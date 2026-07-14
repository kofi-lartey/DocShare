import { useNavigate } from 'react-router-dom';
import { FiSearch, FiCommand, FiSun, FiMoon, FiLogOut, FiCalendar } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useAdminStore } from '../store';
import { adminLogout } from '../adminApi';
import { cn } from '../../utils/helpers';

const RANGES = [
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: '90d', label: '90D' },
];

export default function AdminTopbar({ title, subtitle }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { success } = useNotification();
  const { range, setRange, setPaletteOpen } = useAdminStore();

  const handleLogout = async () => {
    await adminLogout();
    success('Signed out of Admin Console');
    navigate('/admin/login');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 md:px-6 h-16 bg-white/80 dark:bg-admin-900/80 backdrop-blur border-b border-admin-200 dark:border-admin-800">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-admin-900 dark:text-white truncate">{title}</h1>
        {subtitle && <p className="text-xs text-admin-400 dark:text-admin-500 truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-admin-400 bg-admin-50 dark:bg-admin-800/50 hover:text-admin-600 dark:hover:text-white border border-admin-200 dark:border-admin-700 transition-colors"
        >
          <FiSearch className="w-4 h-4" />
          <span>Search…</span>
          <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] text-admin-400 border border-admin-200 dark:border-admin-700 rounded px-1.5 py-0.5">
            <FiCommand className="w-3 h-3" />K
          </span>
        </button>

        <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-admin-50 dark:bg-admin-800/50 border border-admin-200 dark:border-admin-700">
          <FiCalendar className="w-3.5 h-3.5 text-admin-400 ml-1" />
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                range === r.id ? 'bg-accent-600 text-white' : 'text-admin-500 hover:text-admin-800 dark:hover:text-white'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        <button onClick={toggleTheme} className="p-2 rounded-xl text-admin-500 hover:bg-admin-50 dark:hover:bg-admin-800 transition-colors" title="Toggle theme">
          {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
        </button>

        <button onClick={handleLogout} className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" title="Sign out">
          <FiLogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
