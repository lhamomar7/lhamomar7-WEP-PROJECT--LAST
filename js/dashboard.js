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

setupShiftForm();
loadDashboardData();
