import { createContext, useContext, useState, useEffect } from 'react';
import { mockLogin, mockRegister, mockGetSubscription, mockUpdateProfile } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('docshare_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      localStorage.setItem('docshare_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('docshare_user');
    }
  }, [user]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await mockLogin(email, password);
    setUser(response.data);
    return response;
  };

  const register = async (userData) => {
    const response = await mockRegister(userData);
    setUser(response.data);
    return response;
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (data) => {
    setUser(prev => ({ ...prev, ...data }));
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
