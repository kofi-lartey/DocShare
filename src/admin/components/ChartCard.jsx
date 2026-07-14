import { useTheme } from '../../contexts/ThemeContext';

// Wraps a recharts chart in a consistent admin card surface. Charts use the
// admin palette so they read distinctly from the consumer dashboard.
export default function ChartCard({ title, subtitle, action, children, className = '' }) {
  const { isDark } = useTheme();
  return (
    <div className={`rounded-2xl border border-admin-200 dark:border-admin-800 bg-white dark:bg-admin-900 p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-admin-900 dark:text-white">{title}</h3>
          {subtitle && <p className="text-xs text-admin-400 dark:text-admin-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="w-full" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>
        {children}
      </div>
    </div>
  );
}

export const chartTheme = (isDark) => ({
  axis: isDark ? '#64748b' : '#94a3b8',
  grid: isDark ? '#1e293b' : '#e2e8f0',
  accent: '#6366f1',
  accent2: '#8b5cf6',
  emerald: '#10b981',
});
