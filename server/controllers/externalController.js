// External API integration — fetches Israeli public holidays from the
// free Nager.Date API, used both for the homepage holiday list and the
// calendar widget, which needs the full year (not just the next 12).
import { asyncHandler } from '../utils/asyncHandler.js';

export const getIsraelHolidays = asyncHandler(async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/IL`);
  if (!response.ok) { res.status(502); throw new Error('External holidays API failed'); }
  const holidays = await response.json();
  res.json({ success: true, source: 'Nager.Date', count: holidays.length, data: holidays });
});
