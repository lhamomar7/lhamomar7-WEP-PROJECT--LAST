import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getUsers = asyncHandler(async (req, res) => {
  const { role, department, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (department) filter.department = new RegExp(department, 'i');
  if (search) filter.fullName = new RegExp(search, 'i');
  const users = await User.find(filter).select('-password').sort('fullName');
  res.json({ success: true, count: users.length, data: users });
});
