import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { repositories } from '../repositories/index.js';
import { HttpError } from '../utils/httpError.js';

const publicUser = (user) => ({
  id: user.id, name: user.name, email: user.email, phone: user.phone || '',
  address: user.address || '', pincode: user.pincode || '', gender: user.gender || '', role: user.role,
});
const signToken = (user) => jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, env.jwtSecret, { expiresIn: '7d' });
const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());

export async function register(req, res) {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const phone = String(req.body.phone || '').trim();
  if (name.length < 2 || !validEmail(email) || !password) throw new HttpError(400, 'A valid name, email and password are required.');
  if (password.length < 8) throw new HttpError(400, 'Password must be at least 8 characters.');
  if (password.length > 128) throw new HttpError(400, 'Password must be 128 characters or fewer.');
  if (await repositories.users.findOne({ email })) throw new HttpError(409, 'An account with this email already exists.');
  const user = await repositories.users.insert({
    id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name, email, phone,
    password: await bcrypt.hash(password, 12), address: '', pincode: '', gender: '', role: 'customer', createdAt: new Date().toISOString(),
  });
  res.status(201).json({ success: true, data: { user: publicUser(user), token: signToken(user) } });
}

export async function login(req, res) {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!email || !password) throw new HttpError(400, 'Email and password are required.');
  const user = await repositories.users.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password || ''))) throw new HttpError(401, 'Invalid email or password.');
  res.json({ success: true, data: { user: publicUser(user), token: signToken(user) } });
}

export async function me(req, res) {
  const user = await repositories.users.findById(req.user.id);
  if (!user) throw new HttpError(404, 'User account not found.');
  res.json({ success: true, data: publicUser(user) });
}

export async function updateProfile(req, res) {
  const allowed = ['name', 'phone', 'address', 'pincode', 'gender'];
  const patch = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  if (patch.name !== undefined && String(patch.name).trim().length < 2) throw new HttpError(400, 'Name must contain at least 2 characters.');
  if (patch.pincode !== undefined && String(patch.pincode).length > 10) throw new HttpError(400, 'Pincode must be 10 characters or fewer.');
  if (patch.name !== undefined) patch.name = String(patch.name).trim();
  const user = await repositories.users.update(req.user.id, patch);
  if (!user) throw new HttpError(404, 'User account not found.');
  res.json({ success: true, data: publicUser(user) });
}
