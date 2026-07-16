import { useEffect, useState } from 'react';
import { FiShield, FiKey, FiRefreshCw, FiUser, FiTag, FiLogIn, FiBarChart2 } from 'react-icons/fi';
import DataTable from '../components/DataTable';
import StatusPill from '../components/StatusPill';
import { useNotification } from '../../contexts/NotificationContext';
import { formatDateTime, cn } from '../../utils/helpers';
import { getAuditLog, switchMfaMethod, getAdminSession } from '../adminApi';

const ACTION_ICON = {
  'user.create': FiUser, 'user.update': FiUser, 'user.delete': FiUser, 'user.suspend': FiUser,
  'coupon.create': FiTag, 'coupon.update': FiTag, 'coupon.delete': FiTag,
  'mfa.method.switch': FiKey, 'admin.login': FiLogIn,
};

const ACTION_TONE = (a) => (a.includes('delete') ? 'red' : a.includes('suspend') ? 'amber' : a.includes('mfa') ? 'violet' : 'blue');

export default function Security() {
  const { success } = useNotification();
  const session = getAdminSession();
  const [log, setLog] = useState([]);
  const [method, setMethod] = useState(session?.method || 'password+code');

  const load = async () => {
    const res = await getAuditLog();
    setLog(res.data.log);
  };
  useEffect(() => { load(); }, []);

  const changeMethod = async (m) => {
    setMethod(m);
    await switchMfaMethod(m);
    success(`MFA method set to ${m === 'otp+code' ? 'Email OTP + Admin Code' : 'Password + Admin Code'}`);
  };

  const columns = [
    {
      header: 'Action', accessorKey: 'action',
      cell: ({ row }) => {
        const Icon = ACTION_ICON[row.original.action] || FiShield;
        return (
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-admin-100 dark:bg-admin-800 text-admin-500"><Icon className="w-3.5 h-3.5" /></span>
            <StatusPill tone={ACTION_TONE(row.original.action)} className="capitalize">{row.original.action}</StatusPill>
          </div>
        );
      },
    },
    { header: 'Target', accessorKey: 'target', cell: ({ getValue }) => <span className="font-mono text-xs">{getValue || '—'}</span> },
    { header: 'Actor', accessorKey: 'actor', cell: ({ getValue }) => <span className="text-xs text-admin-500">{getValue || '—'}</span> },
    { header: 'IP', accessorKey: 'ip', cell: ({ getValue }) => <span className="font-mono text-xs text-admin-400">{getValue || '—'}</span> },
    {
      header: 'When', accessorKey: 'at',
      cell: ({ getValue }) => {
        const value = getValue;
        if (value === null || value === undefined || value === '') {
          return <span className="text-xs text-admin-400">—</span>;
        }
        const formatted = formatDateTime(value);
        const bad = formatted === 'Invalid Date';
        return (
          <span className={bad ? 'text-xs font-medium text-red-500' : 'text-xs'}>
            {formatted}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-admin-200 dark:border-admin-800 bg-white dark:bg-admin-900 p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-admin-900 dark:text-white mb-1">Multi-Factor Authentication</h3>
          <p className="text-xs text-admin-400 mb-4">The Administrator requires an additional factor on every login. Choose the second factor combined with the unique Admin Code.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'password+code', title: 'Password + Admin Code', desc: 'Option A · username, password, unique code' },
              { id: 'otp+code', title: 'Email OTP + Admin Code', desc: 'Option B · email, one-time code, unique code' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => changeMethod(opt.id)}
                className={cn(
                  'text-left rounded-xl border p-4 transition-colors',
                  method === opt.id
                    ? 'border-accent-500 bg-accent-50 dark:bg-accent-600/10 ring-1 ring-accent-500/40'
                    : 'border-admin-200 dark:border-admin-700 hover:border-admin-300'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <FiKey className={cn('w-4 h-4', method === opt.id ? 'text-accent-600' : 'text-admin-400')} />
                  <span className="text-sm font-medium text-admin-900 dark:text-white">{opt.title}</span>
                </div>
                <p className="text-xs text-admin-400">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-admin-200 dark:border-admin-800 bg-white dark:bg-admin-900 p-5">
          <h3 className="text-sm font-semibold text-admin-900 dark:text-white mb-1">Access</h3>
          <p className="text-xs text-admin-400 mb-4">Superuser inherits all standard user privileges plus exclusive admin controls.</p>
          <ul className="space-y-2 text-xs text-admin-600 dark:text-admin-300">
            <li className="flex items-center gap-2"><FiShield className="w-4 h-4 text-emerald-500" /> Full user CRUD</li>
            <li className="flex items-center gap-2"><FiTag className="w-4 h-4 text-emerald-500" /> Coupon management</li>
            <li className="flex items-center gap-2"><FiBarChart2 className="w-4 h-4 text-emerald-500" /> System analytics</li>
            <li className="flex items-center gap-2"><FiKey className="w-4 h-4 text-emerald-500" /> Audit & MFA control</li>
          </ul>
          <div className="mt-4 flex items-center gap-2 text-xs text-admin-400">
            <FiRefreshCw className="w-3.5 h-3.5" /> Admin Code stored hashed (bcrypt)
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-admin-900 dark:text-white">Audit Trail</h3>
        <button onClick={load} className="inline-flex items-center gap-1.5 text-xs text-admin-500 hover:text-admin-800 dark:hover:text-white"><FiRefreshCw className="w-3.5 h-3.5" />Refresh</button>
      </div>
      <DataTable columns={columns} data={log} pageSize={10} />
    </div>
  );
}
