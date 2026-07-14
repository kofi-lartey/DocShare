import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiUsers, FiTag, FiBarChart2, FiShield, FiCornerDownLeft } from 'react-icons/fi';
import { useAdminStore } from '../store';
import { cn } from '../../utils/helpers';

const ACTIONS = [
  { label: 'Go to Users', icon: FiUsers, to: '/admin/users' },
  { label: 'Go to Marketing / Coupons', icon: FiTag, to: '/admin/coupons' },
  { label: 'Go to Analytics', icon: FiBarChart2, to: '/admin/analytics' },
  { label: 'Go to Security & Audit', icon: FiShield, to: '/admin/security' },
  { label: 'Create New User', icon: FiUsers, to: '/admin/users?action=new' },
  { label: 'Create New Coupon', icon: FiTag, to: '/admin/coupons?action=new' },
];

// ⌘K / Ctrl+K command palette for rapid navigation and actions.
export default function CommandPalette() {
  const { paletteOpen, setPaletteOpen } = useAdminStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if (e.key === 'Escape') setPaletteOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPaletteOpen]);

  useEffect(() => {
    if (paletteOpen) { setQuery(''); setActive(0); setTimeout(() => inputRef.current?.focus(), 30); }
  }, [paletteOpen]);

  if (!paletteOpen) return null;

  const filtered = ACTIONS.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  const run = (a) => {
    if (!a) return;
    setPaletteOpen(false);
    navigate(a.to);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    if (e.key === 'Enter') { e.preventDefault(); run(filtered[active]); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4 bg-admin-950/60 backdrop-blur-sm" onClick={() => setPaletteOpen(false)}>
      <div
        className="w-full max-w-lg rounded-2xl border border-admin-700 bg-white dark:bg-admin-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-admin-200 dark:border-admin-800">
          <FiSearch className="w-5 h-5 text-admin-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={onKeyDown}
            placeholder="Type a command or search…"
            className="flex-1 bg-transparent outline-none text-sm text-admin-900 dark:text-white placeholder-admin-400"
          />
          <span className="text-[10px] text-admin-400 border border-admin-200 dark:border-admin-700 rounded px-1.5 py-0.5">ESC</span>
        </div>
        <ul className="max-h-72 overflow-y-auto py-2">
          {filtered.map((a, i) => (
            <li key={a.label}>
              <button
                onMouseEnter={() => setActive(i)}
                onClick={() => run(a)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                  i === active ? 'bg-accent-50 dark:bg-accent-600/10 text-accent-700 dark:text-accent-300' : 'text-admin-700 dark:text-admin-200'
                )}
              >
                <a.icon className="w-4 h-4" />
                <span className="flex-1">{a.label}</span>
                {i === active && <FiCornerDownLeft className="w-3.5 h-3.5 text-admin-400" />}
              </button>
            </li>
          ))}
          {filtered.length === 0 && <li className="px-4 py-6 text-center text-sm text-admin-400">No matching commands</li>}
        </ul>
      </div>
    </div>
  );
}
