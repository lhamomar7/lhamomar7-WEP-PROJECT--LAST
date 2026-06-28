import { asyncHandler } from '../utils/asyncHandler.js';

export const getIsraelHolidays = asyncHandler(async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/IL`);
  if (!response.ok) { res.status(502); throw new Error('External holidays API failed'); }
  const holidays = await response.json();
  res.json({ success: true, source: 'Nager.Date', count: holidays.length, data: holidays.slice(0, 12) });
});
