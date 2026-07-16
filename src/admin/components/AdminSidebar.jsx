import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers, FiTag, FiBarChart2, FiShield, FiChevronLeft, FiChevronRight,
  FiZap, FiX,
} from 'react-icons/fi';
import { cn } from '../../utils/helpers';
import { getAdminSession } from '../adminApi';

const NAV = [
  { path: '/admin/users', label: 'Users', icon: FiUsers, desc: 'Accounts & roles' },
  { path: '/admin/coupons', label: 'Marketing', icon: FiTag, desc: 'Coupons & promos' },
  { path: '/admin/analytics', label: 'Analytics', icon: FiBarChart2, desc: 'KPIs & metrics' },
  { path: '/admin/security', label: 'Security', icon: FiShield, desc: 'Audit & MFA' },
];

const QUICK = [
  { label: 'New User', icon: FiUsers, to: '/admin/users?action=new' },
  { label: 'New Coupon', icon: FiTag, to: '/admin/coupons?action=new' },
  { label: 'View Analytics', icon: FiBarChart2, to: '/admin/analytics' },
];

export default function AdminSidebar({ variant = 'sidebar', onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const session = getAdminSession();

  useEffect(() => {
    const check = () => {
      const m = window.innerWidth < 1024;
      if (m) setCollapsed(true);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const isDrawer = variant === 'drawer';

  const handleNav = () => onNavigate?.();

  return (
    <motion.aside
      animate={isDrawer ? undefined : { width: collapsed ? 76 : 264 }}
      className={cn(
        'h-screen flex flex-col bg-admin-950 text-admin-100 border-admin-800',
        isDrawer ? 'w-[280px] max-w-[85vw] border-r fixed inset-y-0 left-0 z-50 shadow-2xl' : 'relative border-r'
      )}
    >
      <div className={cn('flex items-center h-16 px-4 border-b border-admin-800', (collapsed && !isDrawer) ? 'justify-center' : 'justify-between')}>
        {(!collapsed || isDrawer) ? (
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-violet-600 text-white shadow">
              <FiShield className="w-5 h-5" />
            </span>
            <div>
              <span className="block text-sm font-bold text-white leading-tight">Admin Console</span>
              <span className="block text-[10px] uppercase tracking-widest text-accent-300">DocShare</span>
            </div>
          </div>
        ) : (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-violet-600 text-white shadow">
            <FiZap className="w-5 h-5" />
          </span>
        )}
        {isDrawer && (
          <button onClick={handleNav} className="p-2 rounded-lg text-admin-300 hover:bg-admin-800 hover:text-white transition-colors" title="Close menu">
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {(!collapsed || isDrawer) && (
        <div className="px-4 py-3 border-b border-admin-800">
          <p className="px-1 text-[10px] font-semibold text-admin-400 uppercase tracking-widest mb-2">Quick Actions</p>
          <div className="grid grid-cols-1 gap-1.5">
            {QUICK.map((q) => (
              <NavLink key={q.label} to={q.to} onClick={handleNav} className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-admin-200 hover:bg-admin-800 hover:text-white transition-colors">
                <q.icon className="w-4 h-4 text-accent-300" /> {q.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {(!collapsed || isDrawer) && <p className="px-2 text-[10px] font-semibold text-admin-400 uppercase tracking-widest mb-2">Management</p>}
        {NAV.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNav}
              className={cn(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active ? 'bg-accent-600/20 text-white ring-1 ring-inset ring-accent-500/40' : 'text-admin-300 hover:bg-admin-800 hover:text-white'
              )}
            >
              <item.icon className={cn('w-5 h-5 flex-shrink-0', active ? 'text-accent-300' : 'text-admin-400 group-hover:text-white')} />
              {(!collapsed || isDrawer) && (
                <span className="flex flex-col">
                  <span>{item.label}</span>
                  <span className="text-[10px] text-admin-500 group-hover:text-admin-400">{item.desc}</span>
                </span>
              )}
              {collapsed && !isDrawer && (
                <span className="absolute left-16 px-2 py-1 rounded-lg bg-admin-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-admin-800 px-3 py-3">
        {(!collapsed || isDrawer) && (
          <div className="flex items-center gap-2 px-2 mb-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-600 text-white text-xs font-bold">
              {(session?.email || 'A').slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{session?.email || 'admin@docshare.app'}</p>
              <p className="text-[10px] text-emerald-400">● Superuser</p>
            </div>
          </div>
        )}
        {!isDrawer && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden lg:flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-admin-300 hover:bg-admin-800 hover:text-white transition-colors"
          >
            {collapsed ? <FiChevronRight /> : <><FiChevronLeft /> Collapse</>}
          </button>
        )}
      </div>
    </motion.aside>
  );
}
