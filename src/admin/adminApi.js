// ============================================================================
//  Admin API (Phase 2 — real backend)
//  Talks to the /api/admin routes. The admin session (full JWT with the MFA
//  claim) is stored in localStorage under `docshare_admin_session`. Every
//  privileged call sends it as a Bearer token; the MFA challenge steps
//  (login / login-verify) exchange the short-lived mfaToken first.
// ============================================================================

const API_BASE = import.meta.env.VITE_API_URL || '';
const SESSION_KEY = 'docshare_admin_session';
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

const getSession = () => {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
  catch { return null; }
};

const setSession = (session) => localStorage.setItem(SESSION_KEY, JSON.stringify(session));
const clearSession = () => localStorage.removeItem(SESSION_KEY);

const adminHeaders = () => {
  const token = getSession()?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async (path, { method = 'GET', body, auth = true } = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(auth ? adminHeaders() : {}) };
  const res = await fetch(`${API_BASE}/api/admin${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Admin request failed');
  }
  return res.json();
};

// ---- Auth / MFA ----------------------------------------------------------
export const hasAdmin = async () => {
  await delay(120);
  return request('/has-admin', { auth: false });
};

export const adminSetup = async (payload) => {
  const res = await request('/setup', { method: 'POST', body: payload, auth: false });
  if (res.success && res.data?.token) {
    setSession({ token: res.data.token, email: res.data.email, role: 'admin', method: payload.mfaMethod || 'password+code' });
  }
  return res;
};

export const adminLogin = async ({ email, password }) => {
  return request('/login', { method: 'POST', body: { email, password }, auth: false });
};

export const adminLoginVerify = async ({ mfaToken, adminCode }) => {
  const res = await request('/login/verify', { method: 'POST', body: { mfaToken, adminCode }, auth: false });
  if (res.success && res.data?.token) {
    setSession({ token: res.data.token, email: null, role: 'admin', method: res.data.method });
    // Re-fetch the admin email from the token-less /users? Not needed; kept minimal.
  }
  return res;
};

export const adminLoginOtp = async ({ email }) => {
  return request('/login-otp', { method: 'POST', body: { email }, auth: false });
};

export const adminLoginOtpVerify = async ({ mfaToken, otp, adminCode }) => {
  const res = await request('/login-otp/verify', { method: 'POST', body: { mfaToken, otp, adminCode }, auth: false });
  if (res.success && res.data?.token) {
    setSession({ token: res.data.token, email: null, role: 'admin', method: res.data.method });
  }
  return res;
};

export const adminLogout = async () => {
  try { await request('/logout', { method: 'POST' }); } catch { /* ignore */ }
  clearSession();
  return { success: true };
};

export const getAdminSession = getSession;

export const switchMfaMethod = async (method) => {
  const res = await request('/security/mfa', { method: 'PUT', body: { method } });
  if (res.success) {
    const s = getSession();
    if (s) setSession({ ...s, method });
  }
  return res;
};

// ---- Users ---------------------------------------------------------------
export const getUsers = async ({ page = 1, limit = 10, search = '', role = 'all', status = 'all', sort = 'createdAt:desc' } = {}) => {
  const params = new URLSearchParams({ page, limit, search, role, status, sort });
  return request(`/users?${params}`);
};

export const getUser = async (id) => request(`/users/${id}`);

export const createUser = async (payload) => request('/users', { method: 'POST', body: payload });

export const updateUser = async (id, patch) => request(`/users/${id}`, { method: 'PUT', body: patch });

export const deleteUser = async (id) => request(`/users/${id}`, { method: 'DELETE' });

// ---- Coupons / Marketing -------------------------------------------------
export const getCoupons = async () => request('/coupons');

export const createCoupon = async (payload) => request('/coupons', { method: 'POST', body: payload });

export const updateCoupon = async (id, patch) => request(`/coupons/${id}`, { method: 'PUT', body: patch });

export const deleteCoupon = async (id) => request(`/coupons/${id}`, { method: 'DELETE' });

// ---- Analytics & Audit ---------------------------------------------------
export const getAnalytics = async (range = '30d') => request(`/analytics?range=${range}`);

export const getAuditLog = async () => request('/security/audit');
