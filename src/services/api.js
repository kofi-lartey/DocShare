const API_BASE = import.meta.env.VITE_API_URL || '';

const getAuthHeaders = () => {
  const token = localStorage.getItem('docshare_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ==================== Auth APIs ====================
export const login = async (email, password) => {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  return response.json();
};

export const register = async (userData) => {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const error = await response.json();
    const message = error.errors?.map(e => e.message).join(', ') || error.message || 'Registration failed';
    throw new Error(message);
  }
  return response.json();
};

export const forgotPassword = async (email) => {
  const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send reset email');
  }
  return response.json();
};

export const resetPassword = async (token, password) => {
  const response = await fetch(`${API_BASE}/api/auth/reset-password/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Password reset failed');
  }
  return response.json();
};

export const confirmEmail = async (token) => {
  const response = await fetch(`${API_BASE}/api/auth/confirm-email/${token}`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Email confirmation failed');
  }
  return response.json();
};

export const getMe = async () => {
  const response = await fetch(`${API_BASE}/api/auth/me`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch user');
  }
  return response.json();
};

// ==================== File APIs ====================
export const getFiles = async ({ page = 1, limit = 10, search = '', filter = 'all', sort = 'date-desc' } = {}) => {
  const params = new URLSearchParams({ page, limit, search, filter, sort });
  const response = await fetch(`${API_BASE}/api/files?${params}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch files');
  }
  return response.json();
};

export const getFile = async (fileId) => {
  const response = await fetch(`${API_BASE}/api/files/${fileId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch file');
  }
  return response.json();
};

export const uploadFile = async (formData) => {
  const response = await fetch(`${API_BASE}/api/files/upload`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }
  return response.json();
};

export const deleteFile = async (fileId) => {
  const response = await fetch(`${API_BASE}/api/files/${fileId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Delete failed');
  }
  return response.json();
};

export const verifyPassword = async (fileId, password) => {
  const response = await fetch(`${API_BASE}/api/files/${fileId}/verify-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Invalid password');
  }
  return response.json();
};

// ==================== Dashboard APIs ====================
export const getStats = async () => {
  const response = await fetch(`${API_BASE}/api/dashboard/stats`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch stats');
  }
  return response.json();
};

export const getRecentActivity = async () => {
  const response = await fetch(`${API_BASE}/api/dashboard/activity`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch activity');
  }
  return response.json();
};

// ==================== User APIs ====================
export const updateProfile = async (data) => {
  const response = await fetch(`${API_BASE}/api/user/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update profile');
  }
  return response.json();
};

export const changePassword = async (data) => {
  const response = await fetch(`${API_BASE}/api/user/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to change password');
  }
  return response.json();
};

export const getNotifications = async () => {
  const response = await fetch(`${API_BASE}/api/user/notifications`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch notifications');
  }
  return response.json();
};

export const updatePreferences = async (data) => {
  const response = await fetch(`${API_BASE}/api/user/preferences`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update preferences');
  }
  return response.json();
};

// ==================== Subscription APIs ====================
export const createSubscription = async (paymentData) => {
  const response = await fetch(`${API_BASE}/api/subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(paymentData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create subscription');
  }
  return response.json();
};

export const getSubscription = async () => {
  const response = await fetch(`${API_BASE}/api/subscriptions/me`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch subscription');
  }
  return response.json();
};

export const getInvoices = async () => {
  const response = await fetch(`${API_BASE}/api/invoices`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch invoices');
  }
  return response.json();
};

export const verifyPaystackPayment = async (reference) => {
  const response = await fetch(`${API_BASE}/api/payments/verify-paystack/${reference}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Payment verification failed');
  }
  return response.json();
};

export const logout = async () => {
  const token = localStorage.getItem('docshare_token');
  const response = await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    // Don't throw - allow local cleanup even if the server call fails
    return { success: false };
  }
  return response.json();
};