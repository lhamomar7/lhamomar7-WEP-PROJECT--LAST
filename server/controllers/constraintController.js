import Constraint from '../models/Constraint.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Employees see only their own constraints; managers see everyone's,
// and can optionally filter by week or status via query params.
export const getConstraints = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'manager' ? {} : { employee: req.user._id };

  if (req.query.week) filter.week = req.query.week;
  if (req.query.status) filter.status = req.query.status;

  const constraints = await Constraint.find(filter)
    .populate('employee', 'fullName email department')
    .populate('week', 'label startDate endDate status')
    .sort('-createdAt');

  res.json({ success: true, count: constraints.length, data: constraints });
});

export const createConstraint = asyncHandler(async (req, res) => {
  const constraint = await Constraint.create({ ...req.body, employee: req.user._id });
  const populated = await constraint.populate([
    { path: 'employee', select: 'fullName email department' },
    { path: 'week', select: 'label startDate endDate status' }
  ]);
  res.status(201).json({ success: true, data: populated });
});

export const updateConstraintStatus = asyncHandler(async (req, res) => {
  const { status, managerNote } = req.body;
  const constraint = await Constraint.findByIdAndUpdate(
    req.params.id,
    { status, managerNote },
    { new: true, runValidators: true }
  ).populate([
    { path: 'employee', select: 'fullName email department' },
    { path: 'week', select: 'label startDate endDate status' }
  ]);

  if (!constraint) {
    res.status(404);
    throw new Error('Constraint not found');
  }
  res.json({ success: true, data: constraint });
});

// Complex query example for the course requirement: grouping +
// aggregation across collections (constraints joined with weeks).
export const getConstraintsSummary = asyncHandler(async (req, res) => {
  const summary = await Constraint.aggregate([
    {
      $group: {
        _id: { week: '$week', status: '$status' },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.week',
        statuses: { $push: { status: '$_id.status', count: '$count' } },
        total: { $sum: '$count' }
      }
    },
    {
      $lookup: {
        from: 'weekperiods',
        localField: '_id',
        foreignField: '_id',
        as: 'week'
      }
    },
    { $unwind: '$week' },
    { $sort: { 'week.startDate': -1 } }
  ]);

  res.json({ success: true, data: summary });
});
