// home.js
// Loads the weekly stats and upcoming holidays on the homepage, and for
// employees, checks whether they've submitted availability for the
// currently open week — surfacing a clear call-to-action if not.

async function loadSubmissionStatusCard() {
  const container = document.getElementById('submissionStatusCard');
  if (!container) return; // not on the homepage, or markup not present

  const user = getCurrentUser();
  // Managers don't submit availability themselves, so this card is
  // employee-only — it stays hidden entirely for a manager.
  if (!user || user.role === 'manager' || !getToken()) {
    container.classList.add('hidden');
    return;
  }

  try {
    const weekRes = await api('/api/weeks/open');
    const openWeek = weekRes.data;

    if (!openWeek) {
      container.classList.add('hidden');
      return;
    }

    const mineRes = await api(`/api/weekly-availability/mine?week=${openWeek._id}`);
    const hasSubmitted = !!mineRes.data;

    container.classList.remove('hidden');

    if (hasSubmitted) {
      const statusLabel = mineRes.data.status === 'approved' ? 'אושרה'
        : mineRes.data.status === 'rejected' ? 'נדחתה — יש לעדכן'
        : 'ממתינה לאישור המנהל';

      container.className = 'submission-cta submitted';
      container.innerHTML = `
        <div class="submission-cta-text">
          <strong>הזמינות שלך לשבוע ${openWeek.label} הוגשה ✓</strong>
          <span>סטטוס: ${statusLabel}</span>
        </div>
        <a class="btn ghost" href="constraints.html">צפייה / עדכון</a>
      `;
    } else {
      container.className = 'submission-cta pending';
      container.innerHTML = `
        <div class="submission-cta-text">
          <strong>עדיין לא הגשת זמינות לשבוע ${openWeek.label}</strong>
          <span>הגשה מהירה — פחות מדקה</span>
        </div>
        <a class="btn primary" href="constraints.html">הגשת זמינות עכשיו</a>
      `;
    }

  } catch (err) {
    container.classList.add('hidden');
  }
}

async function loadHomeStats() {
  const totalShiftsEl = document.getElementById('totalShifts');
  if (!totalShiftsEl) return; // not on the homepage

  const user = getCurrentUser();
  const isManager = user && user.role === 'manager';

  // Wording matters here: an employee's numbers are personal, not
  // company-wide, so the labels should say so rather than imply otherwise.
  const statusTitle = document.getElementById('statusCardTitle');
  const employeesRow = document.getElementById('activeEmployeesRow');
  if (statusTitle) {
    statusTitle.textContent = isManager ? 'סטטוס שבועי — כל הצוות' : 'הסטטוס השבועי שלי';
  }
  if (employeesRow && !isManager) {
    employeesRow.classList.add('hidden');
  }

  if (getToken()) {
    try {
      const stats = await api('/api/shifts/stats');
      totalShiftsEl.textContent = stats.data.totalShifts;
      document.getElementById('activeEmployees').textContent = stats.data.activeEmployees;
      document.getElementById('totalHours').textContent = stats.data.totalHours;
    } catch (err) {
      console.log('could not load stats:', err);
    }
  }

  try {
    const holidays = await api('/api/external/holidays');
    const holidaysBox = document.getElementById('holidaysBox');

    if (!holidays.data.length) {
      holidaysBox.innerHTML = '<p class="empty-message">לא נמצאו חגים קרובים.</p>';
      return;
    }

    holidaysBox.innerHTML = holidays.data
      .map(h => `
        <div class="list-item" style="background:#f8f8f6;border:1px solid var(--line);border-radius:8px;padding:12px 14px">
          <strong>${h.localName}</strong><br>
          <span class="mono" style="color:var(--muted);font-size:0.85rem">${h.date}</span>
        </div>
      `)
      .join('');

  } catch (err) {
    const holidaysBox = document.getElementById('holidaysBox');
    if (holidaysBox) {
      holidaysBox.innerHTML = '<p class="empty-message">לא ניתן לטעון חגים כרגע.</p>';
    }
  }
}

loadSubmissionStatusCard();
loadHomeStats();
