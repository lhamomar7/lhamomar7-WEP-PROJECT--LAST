import Shift from '../models/Shift.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getShifts = asyncHandler(async (req, res) => {
  const { day, employee, department, status, sort = 'day' } = req.query;
  const filter = {};
  if (day && day !== 'all') filter.day = day;
  if (department) filter.department = new RegExp(department, 'i');
  if (status) filter.status = status;

  // Employees only ever see their own shifts; managers see everyone's.
  // This is enforced here on the server, not just hidden in the UI,
  // so the restriction can't be bypassed by calling the API directly.
  if (req.user.role !== 'manager') {
    filter.employee = req.user._id;
  }

  let query = Shift.find(filter).populate('employee', 'fullName email department role');
  if (employee) {
    const shifts = await query;
    const filtered = shifts.filter(s => s.employee.fullName.includes(employee));
    return res.json({ success: true, count: filtered.length, data: filtered });
  }
  const shifts = await query.sort(sort);
  res.json({ success: true, count: shifts.length, data: shifts });
});

export const getShiftById = asyncHandler(async (req, res) => {
  const shift = await Shift.findById(req.params.id).populate('employee', 'fullName email department role');
  if (!shift) { res.status(404); throw new Error('Shift not found'); }

  const isOwner = String(shift.employee._id) === String(req.user._id);
  if (req.user.role !== 'manager' && !isOwner) {
    res.status(403);
    throw new Error('Not authorized to view this shift');
  }

  res.json({ success: true, data: shift });
});

export const createShift = asyncHandler(async (req, res) => {
  const shift = await Shift.create(req.body);
  const populated = await shift.populate('employee', 'fullName email department role');
  res.status(201).json({ success: true, data: populated });
});

export const updateShift = asyncHandler(async (req, res) => {
  const shift = await Shift.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('employee', 'fullName email department role');
  if (!shift) { res.status(404); throw new Error('Shift not found'); }
  res.json({ success: true, data: shift });
});

export const deleteShift = asyncHandler(async (req, res) => {
  const shift = await Shift.findByIdAndDelete(req.params.id);
  if (!shift) { res.status(404); throw new Error('Shift not found'); }
  res.json({ success: true, message: 'Shift deleted successfully' });
});

export const getStats = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'manager' ? {} : { employee: req.user._id };
  const shifts = await Shift.find(filter).populate('employee', 'fullName');
  const employees = new Set(shifts.map(s => String(s.employee?._id)));
  const totalHours = shifts.reduce((sum, s) => sum + (s.hours || 0), 0);
  const byDay = shifts.reduce((acc, s) => { acc[s.day] = (acc[s.day] || 0) + 1; return acc; }, {});
  res.json({ success: true, data: { totalShifts: shifts.length, activeEmployees: employees.size, totalHours, byDay } });
});
