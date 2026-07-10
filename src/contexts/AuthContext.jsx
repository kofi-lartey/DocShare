import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getMe, logout as apiLogout } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('docshare_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('docshare_token');
      if (token) {
        try {
          const response = await getMe();
          setUser(response.data);
        } catch (err) {
          console.log('Token validation failed:', err.message);
          localStorage.removeItem('docshare_token');
          localStorage.removeItem('docshare_user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('docshare_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('docshare_user');
    }
  }, [user]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'docshare_token' && !e.newValue) {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email, password) => {
    const response = await apiLogin(email, password);
    localStorage.setItem('docshare_token', response.data.token);
    setUser(response.data);
    return response;
  };

  const register = async (userData) => {
    const response = await apiRegister(userData);
    if (response.data.token) {
      localStorage.setItem('docshare_token', response.data.token);
      setUser(response.data);
    }
    return response;
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      // Proceed with local cleanup even if the server call fails
    } finally {
      setUser(null);
      localStorage.removeItem('docshare_token');
      localStorage.removeItem('docshare_user');
    }
  };

  const updateUser = (data) => {
    setUser(prev => ({ ...(prev || {}), ...data }));
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}