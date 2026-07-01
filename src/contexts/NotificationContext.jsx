import { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, ...notification }]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const styles = {
      success: { icon: '✅', style: { background: '#10b981', color: '#fff' } },
      error: { icon: '❌', style: { background: '#ef4444', color: '#fff' } },
      warning: { icon: '⚠️', style: { background: '#f59e0b', color: '#fff' } },
      info: { icon: 'ℹ️', style: { background: '#3b82f6', color: '#fff' } },
    };
    toast(message, { ...styles[type] });
  }, []);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    showToast,
    success: (msg) => showToast(msg, 'success'),
    error: (msg) => showToast(msg, 'error'),
    warning: (msg) => showToast(msg, 'warning'),
    info: (msg) => showToast(msg, 'info'),
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
