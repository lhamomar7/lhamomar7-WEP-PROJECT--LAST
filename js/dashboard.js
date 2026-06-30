// dashboard.js
// Manager-only page: lists employees in the select box,
// shows quick stats, and handles adding a new shift.

async function loadDashboardData() {
  const employeeSelect = document.getElementById('employeeSelect');
  if (!employeeSelect) return; // not on the dashboard page

  try {
    const users = await api('/api/users');

    employeeSelect.innerHTML = users.data
      .map(u => `<option value="${u._id}">${u.fullName} - ${u.department}</option>`)
      .join('');

    const stats = await api('/api/shifts/stats');
    const statsBox = document.getElementById('statsBox');

    statsBox.innerHTML = `
      <div class="mini-row"><span>משמרות</span><strong class="mono">${stats.data.totalShifts}</strong></div>
      <div class="mini-row"><span>עובדים</span><strong class="mono">${stats.data.activeEmployees}</strong></div>
      <div class="mini-row"><span>שעות</span><strong class="mono">${stats.data.totalHours}</strong></div>
    `;

  } catch (err) {
    showMessage('נדרשת התחברות מנהל', 'error');
  }
}

function setupShiftForm() {
  const form = document.getElementById('shiftForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const shiftData = {
      employee: document.getElementById('employeeSelect').value,
      day: document.getElementById('shiftDay').value,
      start: document.getElementById('startTime').value,
      end: document.getElementById('endTime').value,
      role: document.getElementById('role').value,
      department: document.getElementById('department').value
    };

    try {
      await api('/api/shifts', {
        method: 'POST',
        body: JSON.stringify(shiftData)
      });

      showMessage('המשמרת נוספה בהצלחה');
      form.reset();
      loadDashboardData();
      loadWeekStrip();

    } catch (err) {
      showMessage(err.message, 'error');
    }
  });
}

// Shows a status message inside the "create user" panel specifically,
// separate from the shift-form message above it on the same page.
function showCreateUserMessage(text, type = 'success') {
  const el = document.getElementById('createUserMessage');
  if (!el) return;
  el.textContent = text;
  el.classList.remove('hidden');
  el.classList.toggle('error', type === 'error');
}

// Manager-only: creates a new employee or manager account. The server
// enforces this is manager-only via the adminOnly middleware regardless
// of what happens here in the UI.
function setupCreateUserForm() {
  const form = document.getElementById('createUserForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const newUser = {
      fullName: document.getElementById('newUserName').value,
      email: document.getElementById('newUserEmail').value,
      password: document.getElementById('newUserPassword').value,
      role: document.getElementById('newUserRole').value,
      department: document.getElementById('newUserDepartment').value
    };

    try {
      await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(newUser)
      });

      showCreateUserMessage(`המשתמש ${newUser.fullName} נוצר בהצלחה`);
      form.reset();
      loadDashboardData(); // refresh the employee dropdown to include the new user

    } catch (err) {
      showCreateUserMessage(err.message, 'error');
    }
  });
}

setupShiftForm();
setupCreateUserForm();
loadDashboardData();

// ───────────────────────── Employee list panel ─────────────────────────

function formatJoinDate(isoDate) {
  if (!isoDate) return '—';
  const d = new Date(isoDate);
  return d.toLocaleDateString('he-IL');
}

function renderEmployeeCard(user) {
  const roleLabel = user.role === 'manager' ? 'מנהל' : 'עובד';
  const statusLabel = user.isActive === false ? 'לא פעיל' : 'פעיל';
  const statusClass = user.isActive === false ? 'rejected' : 'approved';

  return `
    <div class="list-item" style="background:#fff;border:1px solid var(--line);border-radius:8px;padding:14px 16px;margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:start;gap:10px;flex-wrap:wrap">
        <div>
          <strong>${user.fullName}</strong>
          <span class="mono" style="color:var(--muted);margin-right:8px">${roleLabel}</span>
          <div style="color:var(--muted);font-size:0.85rem;margin-top:4px">${user.email}</div>
          <div style="color:var(--muted);font-size:0.85rem;margin-top:2px">מחלקה: ${user.department || '—'}</div>
          <div style="color:var(--muted);font-size:0.78rem;margin-top:4px">הצטרף/ה: ${formatJoinDate(user.createdAt)}</div>
        </div>
        <span class="status-pill ${statusClass}">${statusLabel}</span>
      </div>
    </div>
  `;
}

// Fetches and displays every user (employees and managers) so the
// manager can review the team at a glance. Triggered by a button click
// rather than loading automatically, to keep the page light on first load.
async function loadEmployeesList() {
  const container = document.getElementById('employeesList');
  if (!container) return;

  container.innerHTML = '<p class="loading-message">טוען עובדים...</p>';

  try {
    const res = await api('/api/users');

    if (res.data.length === 0) {
      container.innerHTML = '<p class="empty-message">אין עובדים להצגה</p>';
      return;
    }

    container.innerHTML = res.data.map(renderEmployeeCard).join('');

  } catch (err) {
    container.innerHTML = `<p class="empty-message">${err.message}</p>`;
  }
}

function setupEmployeesListButton() {
  const btn = document.getElementById('loadEmployeesBtn');
  if (!btn) return;
  btn.addEventListener('click', loadEmployeesList);
}

setupEmployeesListButton();
