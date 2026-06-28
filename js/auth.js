// auth.js
// Runs on every page: handles the mobile menu, the logout button,
// and (on the standalone login page) the login form itself.

function setupMobileMenu() {
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  if (!menuBtn || !navLinks) return;

  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

function setupLoginStatus() {
  const logoutBtn = document.getElementById('logoutBtn');
  const loginLink = document.getElementById('loginLink');
  const user = getCurrentUser();

  if (!getToken()) return;

  if (logoutBtn) {
    logoutBtn.classList.remove('hidden');
    logoutBtn.addEventListener('click', () => {
      localStorage.clear();
      location.href = 'login.html';
    });
  }

  if (loginLink && user) {
    loginLink.textContent = user.fullName;
    loginLink.classList.remove('btn-login');
    loginLink.removeAttribute('href');
    loginLink.style.cursor = 'default';
  }
}

// Employees (and logged-out visitors) should never even see that a
// manager area exists — the "ניהול" nav link is removed entirely for
// anyone who isn't a manager, not just visually hidden, so it can't be
// discovered via dev tools either.
function setupRoleBasedNav() {
  const managerLink = document.querySelector('.nav-links a[href="dashboard.html"]');
  if (!managerLink) return;

  const user = getCurrentUser();
  const isManager = !!getToken() && user && user.role === 'manager';
  if (!isManager) {
    managerLink.remove();
  }
}

// dashboard.html is manager-only. A non-manager landing on it directly
// (typed URL, bookmark, etc.) is redirected immediately, before the
// page's own data-loading scripts get a chance to run. A logged-out
// visitor goes to the login page; a logged-in employee goes home.
function guardManagerOnlyPage() {
  const isDashboardPage = document.body.dataset.page === 'dashboard';
  if (!isDashboardPage) return;

  if (!getToken()) {
    location.replace('login.html');
    return;
  }

  const user = getCurrentUser();
  const isManager = user && user.role === 'manager';
  if (!isManager) {
    location.replace('index.html');
  }
}

function setupLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      localStorage.setItem('shiftplan_token', res.token);
      localStorage.setItem('shiftplan_user', JSON.stringify(res.data));
      location.href = 'index.html';

    } catch (err) {
      showMessage(err.message, 'error');
    }
  });
}

guardManagerOnlyPage();
setupMobileMenu();
setupLoginStatus();
setupRoleBasedNav();
setupLoginForm();
