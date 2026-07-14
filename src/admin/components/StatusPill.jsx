import { cn } from '../../utils/helpers';

const TONES = {
  green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 ring-emerald-600/20',
  red: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 ring-red-600/20',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 ring-amber-600/20',
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 ring-blue-600/20',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-700/30 dark:text-slate-300 ring-slate-500/20',
  violet: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 ring-violet-600/20',
};

export default function StatusPill({ tone = 'slate', children, dot = true }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset',
      TONES[tone] || TONES.slate
    )}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}
