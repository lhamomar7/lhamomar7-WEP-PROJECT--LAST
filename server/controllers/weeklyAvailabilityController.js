import WeeklyAvailability from '../models/WeeklyAvailability.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const WEEK_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

// Employees see only their own weekly submissions; managers see everyone's,
// and can filter to a specific week via ?week=<id>.
export const getWeeklyAvailabilities = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'manager' ? {} : { employee: req.user._id };
  if (req.query.week) filter.week = req.query.week;

  const submissions = await WeeklyAvailability.find(filter)
    .populate('employee', 'fullName email department')
    .populate('week', 'label startDate endDate status')
    .sort('-createdAt');

  res.json({ success: true, count: submissions.length, data: submissions });
});

export const getMyWeeklyAvailability = asyncHandler(async (req, res) => {
  const { week } = req.query;
  if (!week) {
    res.status(400);
    throw new Error('week query param is required');
  }

  const submission = await WeeklyAvailability.findOne({ employee: req.user._id, week })
    .populate('week', 'label startDate endDate status');

  res.json({ success: true, data: submission });
});

// Submits (or overwrites) the employee's full week in a single call.
// `days` is expected as an array of { day, note } covering some or all
// of the 7 weekdays — missing days are simply left blank.
export const submitWeeklyAvailability = asyncHandler(async (req, res) => {
  const { week, days } = req.body;

  if (!week || !Array.isArray(days)) {
    res.status(400);
    throw new Error('week and days[] are required');
  }

  const normalizedDays = WEEK_DAYS.map(day => {
    const found = days.find(d => d.day === day);
    return { day, note: found?.note?.trim() || '' };
  });

  const submission = await WeeklyAvailability.findOneAndUpdate(
    { employee: req.user._id, week },
    {
      employee: req.user._id,
      week,
      days: normalizedDays,
      status: 'pending' // resubmitting resets manager review
    },
    { new: true, upsert: true, runValidators: true }
  ).populate('week', 'label startDate endDate status');

  res.status(201).json({ success: true, data: submission });
});

export const updateWeeklyAvailabilityStatus = asyncHandler(async (req, res) => {
  const { status, managerNote } = req.body;

  const submission = await WeeklyAvailability.findByIdAndUpdate(
    req.params.id,
    { status, managerNote },
    { new: true, runValidators: true }
  )
    .populate('employee', 'fullName email department')
    .populate('week', 'label startDate endDate status');

  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }

  res.json({ success: true, data: submission });
});
