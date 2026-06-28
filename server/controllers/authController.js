import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function createToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function userResponse(user) {
  return { id: user._id, fullName: user.fullName, email: user.email, role: user.role, department: user.department };
}

export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, role, department } = req.body;
  if (!fullName || !email || !password) {
    res.status(400); throw new Error('Full name, email and password are required');
  }
  const exists = await User.findOne({ email });
  if (exists) { res.status(409); throw new Error('Email already exists'); }
  const user = await User.create({ fullName, email, password, role, department });
  res.status(201).json({ success: true, data: userResponse(user), token: createToken(user._id) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401); throw new Error('Invalid email or password');
  }
  res.json({ success: true, data: userResponse(user), token: createToken(user._id) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: userResponse(req.user) });
});
