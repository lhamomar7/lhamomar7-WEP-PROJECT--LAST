// login-modal.js
// Injects a login modal into the current page and wires up the
// "התחברות" nav button to open it. Works on every page except the
// standalone login page itself (which has its own inline form).

function buildModalMarkup() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay hidden';
  overlay.id = 'loginModalOverlay';

  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="loginModalTitle">
      <button type="button" class="modal-close" id="loginModalClose" aria-label="סגירה">×</button>
      <h2 id="loginModalTitle">התחברות</h2>
      <div id="modalMessage" class="message hidden"></div>
      <form id="modalLoginForm">
        <label>
          אימייל
          <input id="modalEmail" type="email" required autocomplete="email">
        </label>
        <label>
          סיסמה
          <input id="modalPassword" type="password" required autocomplete="current-password">
        </label>
        <button class="btn primary full" type="submit">כניסה למערכת</button>
      </form>
      <p class="modal-hint">משתמש בדיקה: manager@shiftplan.com / 123456</p>
    </div>
  `;

  document.body.appendChild(overlay);
  return overlay;
}

function openModal(overlay) {
  overlay.classList.remove('hidden');
  document.getElementById('modalEmail')?.focus();
  document.addEventListener('keydown', closeOnEscape);
}

function closeModal(overlay) {
  overlay.classList.add('hidden');
  document.removeEventListener('keydown', closeOnEscape);
}

function closeOnEscape(event) {
  if (event.key === 'Escape') {
    document.getElementById('loginModalOverlay')?.classList.add('hidden');
  }
}

function showModalMessage(text, type = 'error') {
  const el = document.getElementById('modalMessage');
  if (!el) return;
  el.textContent = text;
  el.classList.remove('hidden');
  el.classList.toggle('error', type === 'error');
}

function setupLoginModal() {
  // Don't inject the modal on the standalone login page itself.
  if (document.getElementById('loginForm')) return;

  const loginLink = document.getElementById('loginLink');
  if (!loginLink || getToken()) return; // already logged in, nothing to open

  const overlay = buildModalMarkup();

  loginLink.addEventListener('click', (event) => {
    event.preventDefault();
    openModal(overlay);
  });

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeModal(overlay);
  });

  document.getElementById('loginModalClose').addEventListener('click', () => {
    closeModal(overlay);
  });

  document.getElementById('modalLoginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('modalEmail').value;
    const password = document.getElementById('modalPassword').value;

    try {
      const res = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      localStorage.setItem('shiftplan_token', res.token);
      localStorage.setItem('shiftplan_user', JSON.stringify(res.data));
      location.reload();

    } catch (err) {
      showModalMessage(err.message, 'error');
    }
  });
}

setupLoginModal();
