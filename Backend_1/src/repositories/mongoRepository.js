import { HttpError } from '../utils/httpError.js';

function clean(document) {
  if (!document) return null;
  const record = { ...document };
  delete record._id;
  delete record.__v;
  return record;
}

function normalizeMongoError(error) {
  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'value';
    return new HttpError(409, `A record with this ${field} already exists.`);
  }
  return error;
}

export function createMongoRepository(Model) {
  return {
    async findAll() {
      return (await Model.find({}).lean()).map(clean);
    },
    async findById(id) {
      return clean(await Model.findOne({ id: String(id) }).lean());
    },
    async findOne(filter) {
      return clean(await Model.findOne(filter).lean());
    },
    async insert(record) {
      try {
        const safeRecord = { ...record, id: String(record.id) };
        const document = await Model.create(safeRecord);
        return clean(document.toObject());
      } catch (error) {
        throw normalizeMongoError(error);
      }
    },
    async update(id, patch) {
      try {
        const safePatch = { ...patch };
        delete safePatch.id;
        delete safePatch._id;
        delete safePatch.__v;
        safePatch.updatedAt = new Date().toISOString();
        const document = await Model.findOneAndUpdate(
          { id: String(id) },
          { $set: safePatch },
          { new: true, runValidators: true, lean: true },
        );
        return clean(document);
      } catch (error) {
        throw normalizeMongoError(error);
      }
    },
    async remove(id) {
      const result = await Model.deleteOne({ id: String(id) });
      return result.deletedCount > 0;
    },
    async replace(records) {
      if (!Array.isArray(records)) throw new HttpError(400, 'Replacement data must be an array.');
      if (records.length) {
        const operations = records.map((record) => {
          if (record?.id === undefined || record?.id === null || String(record.id).trim() === '') {
            throw new HttpError(400, 'Every record must have an id.');
          }
          const replacement = { ...record, id: String(record.id) };
          delete replacement._id;
          delete replacement.__v;
          return { updateOne: { filter: { id: replacement.id }, update: { $set: replacement }, upsert: true } };
        });
        try {
          await Model.bulkWrite(operations, { ordered: true });
          await Model.deleteMany({ id: { $nin: records.map((record) => String(record.id)) } });
        } catch (error) {
          throw normalizeMongoError(error);
        }
      } else {
        await Model.deleteMany({});
      }
      return this.findAll();
    },
    async count(filter = {}) {
      return Model.countDocuments(filter);
    },
  };
}
