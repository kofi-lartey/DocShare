import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FiUploadCloud, FiFolder, FiSettings, FiCreditCard, FiLogOut,
  FiHome, FiBarChart2, FiHelpCircle, FiZap,
  FiChevronLeft, FiChevronRight, FiStar,
  FiPlus, FiGrid
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { cn } from '../../utils/helpers';
import BrandLogo from '../../components/common/BrandLogo';

const mainNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: FiHome },
  { path: '/dashboard/upload', label: 'Upload', icon: FiUploadCloud },
  { path: '/dashboard/my-uploads', label: 'My Uploads', icon: FiFolder },
  // { path: '/dashboard/analytics', label: 'Analytics', icon: FiBarChart2 },
];

const secondaryNavItems = [
  { path: '/dashboard/settings', label: 'Settings', icon: FiSettings },
  { path: '/dashboard/subscription', label: 'Subscription', icon: FiCreditCard },
];

const quickActions = [
  { label: 'New Upload', icon: FiPlus, color: 'blue', action: '/dashboard/upload' },
  { label: 'View All', icon: FiGrid, color: 'purple', action: '/dashboard/my-uploads' },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { success } = useNotification();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    await logout();
    success('Logged out successfully');
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: isCollapsed ? 72 : 264,
        transition: { duration: 0.25, ease: 'easeInOut' }
      }}
      className={cn(
        'relative bg-white dark:bg-gray-900 border-r border-gray-200/50 dark:border-gray-800/50',
        'flex flex-col h-screen overflow-hidden shadow-sm',
        'transition-colors duration-200'
      )}
    >
      {/* Header / Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-gray-200/50 dark:border-gray-800/50',
        isCollapsed ? 'justify-center' : 'justify-between'
      )}>
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <BrandLogo size="md" />
            <div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">DocShare</span>
              <span className="ml-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">PRO</span>
            </div>
          </div>
        ) : (
          <BrandLogo size="md" />
        )}
      </div>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-800/50">
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <NavLink
                key={action.label}
                to={action.action}
                className={cn(
                  'flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200',
                  `bg-${action.color}-50 dark:bg-${action.color}-900/20 text-${action.color}-700 dark:text-${action.color}-400 hover:bg-${action.color}-100 dark:hover:bg-${action.color}-900/30`
                )}
              >
                <action.icon className={`w-3.5 h-3.5 text-${action.color}-500`} />
                {action.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Navigation - No scroll */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {/* Main Navigation */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              Main
            </p>
          )}
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.path || 
                            location.pathname.startsWith(item.path + '/');
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive: isNavActive }) => {
                  const active = isNavActive || isActive;
                  return cn(
                    'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-700 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  );
                }}
              >
                {({ isActive: isNavActive }) => {
                  const active = isNavActive || isActive;
                  return (
                    <>
                      <item.icon 
                        size={20} 
                        className={cn(
                          'flex-shrink-0 transition-colors',
                          active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                        )}
                      />
                      {!isCollapsed && (
                        <span className="flex-1">{item.label}</span>
                      )}
                      {active && !isCollapsed && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="w-1.5 h-1.5 bg-blue-600 rounded-full"
                        />
                      )}
                      {isCollapsed && (
                        <div className="absolute left-12 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                          {item.label}
                        </div>
                      )}
                    </>
                  );
                }}
              </NavLink>
            );
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-800/50">
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                Settings
              </p>
            )}
            {secondaryNavItems.map((item) => {
              const isActive = location.pathname === item.path || 
                              location.pathname.startsWith(item.path + '/');
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive: isNavActive }) => {
                    const active = isNavActive || isActive;
                    return cn(
                      'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                      active
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-700 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    );
                  }}
                >
                  {({ isActive: isNavActive }) => {
                    const active = isNavActive || isActive;
                    return (
                      <>
                        <item.icon 
                          size={20} 
                          className={cn(
                            'flex-shrink-0 transition-colors',
                            active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                          )}
                        />
                        {!isCollapsed && (
                          <span className="flex-1">{item.label}</span>
                        )}
                        {isCollapsed && (
                          <div className="absolute left-12 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                            {item.label}
                          </div>
                        )}
                      </>
                    );
                  }}
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom Actions - No scroll */}
      <div className="border-t border-gray-200/50 dark:border-gray-800/50 px-3 py-3 space-y-1">
        {/* Help */}
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
        >
          <FiHome size={20} className="flex-shrink-0" />
          {!isCollapsed && <span>Home</span>}
          {isCollapsed && (
            <div className="absolute left-12 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              Home
            </div>
          )}
        </NavLink>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
        >
          <span className="flex-shrink-0 text-lg">
            {theme === 'dark' ? '☀️' : '🌙'}
          </span>
          {!isCollapsed && (
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          )}
          {isCollapsed && (
            <div className="absolute left-12 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </div>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
        >
          <FiLogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
          {isCollapsed && (
            <div className="absolute left-12 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>

        {/* Version */}
        {!isCollapsed && (
          <div className="px-3 pt-2 mt-1 border-t border-gray-200/50 dark:border-gray-800/50">
            <p className="text-[10px] text-gray-400 dark:text-gray-500">v2.1.0</p>
          </div>
        )}
      </div>

      {/* Collapse Toggle Button - Desktop */}
      {!isMobile && (
        <button
          onClick={toggleCollapse}
          className={cn(
            'absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6',
            'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full',
            'flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200',
            'hover:bg-gray-50 dark:hover:bg-gray-700'
          )}
        >
          {isCollapsed ? (
            <FiChevronRight className="w-3.5 h-3.5 text-gray-500" />
          ) : (
            <FiChevronLeft className="w-3.5 h-3.5 text-gray-500" />
          )}
        </button>
      )}
    </motion.aside>
  );
}