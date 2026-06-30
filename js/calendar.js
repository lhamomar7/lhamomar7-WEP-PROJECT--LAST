// calendar.js
// Homepage calendar widget: a standard Gregorian month grid, with the
// matching Hebrew date shown under each day number, and Israeli public
// holidays (from the Nager.Date API) highlighted. Clicking a day opens
// a modal with that day's full details.

const HEBREW_FORMATTER = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', { day: 'numeric', month: 'long' });
const WEEKDAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const MONTH_NAMES = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

let calendarViewDate = new Date(); // tracks which month is currently displayed
let holidaysByYear = {}; // cache: { 2026: [...holidays] } so switching months doesn't re-fetch

function toISODate(date) {
  // local-time YYYY-MM-DD, avoiding timezone shifts from toISOString()
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function getHolidaysForYear(year) {
  if (holidaysByYear[year]) return holidaysByYear[year];

  try {
    const res = await api(`/api/external/holidays?year=${year}`);
    holidaysByYear[year] = res.data;
    return res.data;
  } catch (err) {
    holidaysByYear[year] = [];
    return [];
  }
}

function buildMonthCells(year, month) {
  // month is 0-indexed. Returns an array of { date, inMonth } covering
  // full weeks (including the trailing/leading days of neighboring months
  // needed to fill the grid).
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];

  // Leading days from the previous month
  for (let i = startOffset; i > 0; i--) {
    const d = new Date(year, month, 1 - i);
    cells.push({ date: d, inMonth: false });
  }

  // Days of the current month
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, month, day), inMonth: true });
  }

  // Trailing days to complete the final week
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const d = new Date(last);
    d.setDate(d.getDate() + 1);
    cells.push({ date: d, inMonth: false });
  }

  return cells;
}

async function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  const titleEl = document.getElementById('calMonthTitle');
  if (!grid) return; // not on the homepage

  const year = calendarViewDate.getFullYear();
  const month = calendarViewDate.getMonth();

  titleEl.textContent = `${MONTH_NAMES[month]} ${year}`;
  grid.innerHTML = '<p class="loading-message">טוען לוח שנה...</p>';

  const cells = buildMonthCells(year, month);

  // Leading/trailing days from neighboring months can fall in a different
  // year (e.g. December's trailing days are in January next year), so we
  // fetch holidays for every year actually present in the grid, not just
  // the displayed month's year.
  const yearsNeeded = [...new Set(cells.map(c => c.date.getFullYear()))];
  const holidaySets = await Promise.all(yearsNeeded.map(getHolidaysForYear));
  const holidaysByDate = {};
  holidaySets.flat().forEach(h => { holidaysByDate[h.date] = h; });

  const today = toISODate(new Date());

  grid.innerHTML = cells.map(cell => {
    const iso = toISODate(cell.date);
    const holiday = holidaysByDate[iso];
    const hebrewDate = HEBREW_FORMATTER.format(cell.date);
    const isToday = iso === today;

    const classes = ['calendar-day'];
    if (!cell.inMonth) classes.push('outside-month');
    if (holiday) classes.push('has-holiday');
    if (isToday) classes.push('today');

    return `
      <button type="button" class="${classes.join(' ')}" data-date="${iso}">
        <span class="cal-day-number">${cell.date.getDate()}</span>
        <span class="cal-day-hebrew">${hebrewDate}</span>
        ${holiday ? `<span class="cal-day-holiday-dot" title="${holiday.localName}"></span>` : ''}
      </button>
    `;
  }).join('');

  // Wire up click handlers for the day-detail modal
  grid.querySelectorAll('.calendar-day').forEach(btn => {
    btn.addEventListener('click', () => openDayModal(btn.dataset.date, holidaysByDate[btn.dataset.date]));
  });
}

function openDayModal(isoDate, holiday) {
  const overlay = document.getElementById('dayModalOverlay');
  const title = document.getElementById('dayModalTitle');
  const body = document.getElementById('dayModalBody');
  if (!overlay) return;

  const date = new Date(isoDate + 'T00:00:00');
  const weekdayName = WEEKDAY_NAMES[date.getDay()];
  const hebrewDate = HEBREW_FORMATTER.format(date);
  const gregorianLabel = `${date.getDate()} ב${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;

  title.textContent = `יום ${weekdayName}`;

  body.innerHTML = `
    <div class="day-modal-row"><span>תאריך לועזי</span><strong>${gregorianLabel}</strong></div>
    <div class="day-modal-row"><span>תאריך עברי</span><strong>${hebrewDate}</strong></div>
    ${holiday ? `
      <div class="day-modal-holiday">
        <span class="status-pill pending">חג / מועד</span>
        <strong>${holiday.localName}</strong>
        ${holiday.name !== holiday.localName ? `<span class="day-modal-holiday-en">${holiday.name}</span>` : ''}
      </div>
    ` : `<p class="day-modal-empty">אין חגים או מועדים מיוחדים ביום זה.</p>`}
  `;

  overlay.classList.remove('hidden');
}

function closeDayModal() {
  document.getElementById('dayModalOverlay')?.classList.add('hidden');
}

function setupCalendarNav() {
  document.getElementById('calPrevBtn')?.addEventListener('click', () => {
    calendarViewDate.setMonth(calendarViewDate.getMonth() - 1);
    renderCalendar();
  });

  document.getElementById('calNextBtn')?.addEventListener('click', () => {
    calendarViewDate.setMonth(calendarViewDate.getMonth() + 1);
    renderCalendar();
  });

  const overlay = document.getElementById('dayModalOverlay');
  overlay?.addEventListener('click', (event) => {
    if (event.target === overlay) closeDayModal();
  });
  document.getElementById('dayModalClose')?.addEventListener('click', closeDayModal);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDayModal();
  });
}

if (document.getElementById('calendarGrid')) {
  setupCalendarNav();
  renderCalendar();
}
