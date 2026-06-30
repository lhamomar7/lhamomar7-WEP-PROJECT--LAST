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
