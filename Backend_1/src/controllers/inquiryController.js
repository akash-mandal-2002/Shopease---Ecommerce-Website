import { repositories } from '../repositories/index.js';
import { HttpError } from '../utils/httpError.js';
export async function createInquiry(req, res) {
  const subject = String(req.body.subject || '').trim();
  const message = String(req.body.message || '').trim();
  if (subject.length < 3 || message.length < 10) throw new HttpError(400, 'Subject must be at least 3 characters and message at least 10 characters.');
  const inquiry = await repositories.inquiries.insert({ id: `INQ-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, userId: String(req.user.id), subject, message, status: 'open', createdAt: new Date().toISOString() });
  res.status(201).json({ success: true, data: inquiry });
}
export async function getMyInquiries(req, res) {
  const items = (await repositories.inquiries.findAll()).filter((item) => String(item.userId) === String(req.user.id)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, data: items });
}
export async function getAllInquiries(_req, res) { res.json({ success: true, data: await repositories.inquiries.findAll() }); }
export async function updateInquiryStatus(req, res) {
  if (!['open', 'in_progress', 'resolved', 'closed'].includes(req.body.status)) throw new HttpError(400, 'Invalid inquiry status.');
  const inquiry = await repositories.inquiries.update(req.params.id, { status: req.body.status, updatedAt: new Date().toISOString() });
  if (!inquiry) throw new HttpError(404, 'Inquiry not found.');
  res.json({ success: true, data: inquiry });
}
