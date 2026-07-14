import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { cn } from '../../utils/helpers';

export default function KpiCard({ label, value, delta, icon: Icon, tone = 'accent', hint }) {
  const TONES = {
    accent: 'from-accent-500 to-accent-700 text-white',
    emerald: 'from-emerald-500 to-emerald-600 text-white',
    amber: 'from-amber-500 to-orange-600 text-white',
    violet: 'from-violet-500 to-purple-600 text-white',
    slate: 'from-admin-600 to-admin-800 text-white',
  };
  const up = typeof delta === 'number' && delta >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-admin-200 dark:border-admin-800 bg-white dark:bg-admin-900 p-4 flex flex-col gap-3 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-admin-500 dark:text-admin-400 uppercase tracking-wide">{label}</span>
        {Icon && (
          <span className={cn('inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm', TONES[tone])}>
            <Icon className="w-4.5 h-4.5" />
          </span>
        )}
      </div>
      <div className="text-2xl font-semibold text-admin-900 dark:text-white tabular-nums">{value}</div>
      <div className="flex items-center gap-2 text-xs">
        {typeof delta === 'number' && (
          <span className={cn('inline-flex items-center gap-0.5 font-medium', up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
            {up ? <FiTrendingUp className="w-3.5 h-3.5" /> : <FiTrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(delta)}%
          </span>
        )}
        {hint && <span className="text-admin-400 dark:text-admin-500">{hint}</span>}
      </div>
    </motion.div>
  );
}
