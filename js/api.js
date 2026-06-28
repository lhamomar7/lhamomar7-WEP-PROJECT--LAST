// api.js
// Small helper for talking to the ShiftPlan backend.

// Empty string means "same origin" — works both on localhost:5000
// (where Express serves these files) and on the deployed URL (Render etc).
const API_BASE = 'http://localhost:5000';

function getToken() {
  return localStorage.getItem('shiftplan_token');
}

function getCurrentUser() {
  const raw = localStorage.getItem('shiftplan_user');
  return raw ? JSON.parse(raw) : null;
}

async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (getToken()) {
    headers.Authorization = `Bearer ${getToken()}`;
  }

  const response = await fetch(API_BASE + path, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'שגיאה בבקשה');
  }

  return data;
}

function showMessage(text, type = 'success') {
  const el = document.getElementById('message');
  if (!el) return;

  el.textContent = text;
  el.classList.remove('hidden');
  el.classList.toggle('error', type === 'error');
}
