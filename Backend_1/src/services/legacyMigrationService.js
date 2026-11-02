import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { repositories } from '../repositories/index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.resolve(here, '../data');
const sources = [
  ['products.json', repositories.products],
  ['categories.json', repositories.categories],
  ['users.json', repositories.users],
  ['carts.json', repositories.carts],
  ['orders.json', repositories.orders],
  ['payments.json', repositories.payments],
];

// Idempotent, collection-by-collection import: existing MongoDB records are never overwritten.
export async function migrateLegacyJsonIfNeeded() {
  const results = [];
  for (const [fileName, repository] of sources) {
    const filePath = path.join(dataDirectory, fileName);
    let records;
    try {
      records = JSON.parse(await fs.readFile(filePath, 'utf8'));
    } catch (error) {
      if (error.code === 'ENOENT') {
        results.push({ fileName, imported: 0, reason: 'file-not-found' });
        continue;
      }
      throw new Error(`Cannot read ${fileName}: ${error.message}`);
    }
    if (!Array.isArray(records)) throw new Error(`${fileName} must contain a JSON array.`);
    const currentCount = await repository.count();
    if (currentCount > 0 || records.length === 0) {
      results.push({ fileName, imported: 0, reason: currentCount ? 'collection-not-empty' : 'empty-file' });
      continue;
    }
    await repository.replace(records);
    results.push({ fileName, imported: records.length, reason: 'imported' });
    console.log(`Imported ${records.length} records from ${fileName} into MongoDB.`);
  }
  return results;
}
