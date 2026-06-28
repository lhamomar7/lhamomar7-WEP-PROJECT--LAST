// week-strip.js
// Renders the 7-day "week strip" used on the shifts and dashboard pages.
// Each chip shows a day name and how many shifts are scheduled that day.

const WEEK_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

async function loadWeekStrip() {
  const strip = document.getElementById('weekStrip');
  if (!strip) return; // not on a page that has the strip
  if (!getToken()) return; // shifts are personal data, nothing to show yet

  try {
    const res = await api('/api/shifts');
    const counts = {};
    WEEK_DAYS.forEach(day => { counts[day] = 0; });
    res.data.forEach(shift => {
      if (counts[shift.day] !== undefined) counts[shift.day] += 1;
    });

    strip.innerHTML = WEEK_DAYS
      .map(day => `
        <div class="week-chip${counts[day] > 0 ? ' active' : ''}">
          <span class="day-name">${day}</span>
          <span class="day-count mono">${counts[day]}</span>
        </div>
      `)
      .join('');

  } catch (err) {
    console.log('could not load week strip:', err);
  }
}

loadWeekStrip();
