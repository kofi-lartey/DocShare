import { FiUpload, FiEye, FiHardDrive, FiLink } from 'react-icons/fi';
import { cn } from '../../utils/helpers';

const colorClasses = {
  blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
  green: 'bg-green-50 dark:bg-green-900/20 text-green-600',
  purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
  orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600',
};

const icons = {
  FiUpload,
  FiEye,
  FiHardDrive,
  FiLink,
};

export default function StatCard({ title, value, subtitle, icon, color = 'blue' }) {
  const Icon = icons[icon.name];
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        <div className={cn('p-3 rounded-lg', colorClasses[color])}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
