// shifts.js
// Handles the shifts list page: rendering cards, search, and filtering.

function renderShiftCard(shift) {
  const user = getCurrentUser();
  const canDelete = user && user.role === 'manager';

  const deleteButton = canDelete
    ? `<div class="actions">
         <button class="icon-btn reject" onclick="deleteShift('${shift._id}')">מחיקה</button>
       </div>`
    : '';

  return `
    <article class="shift-card">
      <h3>${shift.employee?.fullName || ''}</h3>
      <div class="shift-info"><span>יום</span><strong>${shift.day}</strong></div>
      <div class="shift-info"><span>שעות</span><strong>${shift.start} - ${shift.end}</strong></div>
      <div class="shift-info"><span>תפקיד</span><strong style="font-family:'Heebo',sans-serif">${shift.role}</strong></div>
      <div class="shift-info"><span>מחלקה</span><strong style="font-family:'Heebo',sans-serif">${shift.department}</strong></div>
      ${deleteButton}
    </article>
  `;
}

async function loadShifts() {
  const container = document.getElementById('shiftsContainer');
  if (!container) return; // not on the shifts page

  const emptyMessage = document.getElementById('emptyMessage');

  // Shifts are personal data now, so we don't even call the API
  // without a logged-in user — show a clear message instead.
  if (!getToken()) {
    container.innerHTML = '';
    emptyMessage.textContent = 'יש להתחבר כדי לצפות במשמרות.';
    emptyMessage.classList.remove('hidden');
    return;
  }

  container.innerHTML = '<p class="loading-message">טוען משמרות...</p>';

  const day = document.getElementById('dayFilter').value;
  const employeeName = document.getElementById('searchInput')?.value.trim();

  const params = new URLSearchParams();
  if (day) params.set('day', day);
  if (employeeName) params.set('employee', employeeName);

  try {
    const res = await api('/api/shifts?' + params.toString());
    container.innerHTML = res.data.map(renderShiftCard).join('');
    emptyMessage.textContent = 'לא נמצאו משמרות.';
    emptyMessage.classList.toggle('hidden', res.data.length > 0);

  } catch (err) {
    container.innerHTML = '';
    emptyMessage.textContent = err.message;
    emptyMessage.classList.remove('hidden');
  }
}

async function deleteShift(id) {
  try {
    await api('/api/shifts/' + id, { method: 'DELETE' });
    loadShifts();
    loadWeekStrip();
  } catch (err) {
    alert(err.message);
  }
}

function setupShiftsPage() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  const user = getCurrentUser();
  const isManager = user && user.role === 'manager';

  // The "search by employee name" filter only makes sense for managers,
  // who can see everyone's shifts. Employees only ever see their own.
  if (!isManager) {
    document.getElementById('searchFilterGroup')?.classList.add('hidden');
  }

  const pageTitle = document.getElementById('shiftsPageTitle');
  if (pageTitle && !isManager) {
    pageTitle.textContent = 'המשמרות שלי';
  }

  searchInput.addEventListener('input', loadShifts);
  document.getElementById('dayFilter').addEventListener('change', loadShifts);
  document.getElementById('refreshShifts').addEventListener('click', loadShifts);

  loadShifts();
}

// expose for the inline onclick in renderShiftCard
window.deleteShift = deleteShift;

setupShiftsPage();
