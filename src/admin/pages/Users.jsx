import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiUserPlus, FiEdit2, FiTrash2, FiSearch, FiShieldOff, FiShield } from 'react-icons/fi';
import DataTable from '../components/DataTable';
import StatusPill from '../components/StatusPill';
import UserEditor from '../components/UserEditor';
import { useNotification } from '../../contexts/NotificationContext';
import { formatDate, formatFileSize, cn } from '../../utils/helpers';
import {
  getUsers, createUser, updateUser, deleteUser,
} from '../adminApi';

const statusTone = (s) => (s === 'active' ? 'green' : s === 'suspended' ? 'red' : 'amber');

export default function Users() {
  const { success } = useNotification();
  const [params, setParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [editor, setEditor] = useState({ open: false, initial: null });

  const load = async () => {
    const res = await getUsers({ search, role, status });
    setRows(res.data.users);
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, role, status]);

  // Deep-link ?action=new opens the create editor.
  useEffect(() => {
    if (params.get('action') === 'new') {
      setEditor({ open: true, initial: null });
      params.delete('action');
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (data) => {
    if (editor.initial) {
      await updateUser(editor.initial._id, data);
      success('User updated');
    } else {
      await createUser(data);
      success('User created');
    }
    setEditor({ open: false, initial: null });
    load();
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete ${u.fullName}? This cannot be undone.`)) return;
    await deleteUser(u._id);
    success('User deleted');
    load();
  };

  const toggleSuspend = async (u) => {
    await updateUser(u._id, { status: u.status === 'suspended' ? 'active' : 'suspended' });
    success(u.status === 'suspended' ? 'User reactivated' : 'User suspended');
    load();
  };

  const columns = useMemo(() => [
    {
      header: 'User',
      accessorKey: 'fullName',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent-600 text-white text-xs font-bold">
            {row.original.fullName.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <p className="font-medium text-admin-900 dark:text-white">{row.original.fullName}</p>
            <p className="text-xs text-admin-400">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    { header: 'Plan', accessorKey: 'plan', cell: ({ getValue }) => <span className="capitalize">{getValue()}</span> },
    {
      header: 'Role',
      accessorKey: 'role',
      cell: ({ getValue }) => getValue() === 'admin'
        ? <StatusPill tone="violet">Administrator</StatusPill>
        : <span className="text-admin-400">User</span>,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ getValue }) => <StatusPill tone={statusTone(getValue())} className="capitalize">{getValue()}</StatusPill>,
    },
    {
      header: 'Storage',
      accessorKey: 'storageUsed',
      cell: ({ getValue }) => <span className="tabular-nums">{formatFileSize(getValue())}</span>,
    },
    { header: 'Joined', accessorKey: 'createdAt', cell: ({ getValue }) => <span className="text-xs">{formatDate(getValue())}</span> },
    {
      header: '',
      id: 'actions',
      sortable: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); setEditor({ open: true, initial: row.original }); }} className="p-2 rounded-lg text-admin-500 hover:bg-admin-100 dark:hover:bg-admin-800" title="Edit"><FiEdit2 className="w-4 h-4" /></button>
          <button onClick={(e) => { e.stopPropagation(); toggleSuspend(row.original); }} className={cn('p-2 rounded-lg hover:bg-admin-100 dark:hover:bg-admin-800', row.original.status === 'suspended' ? 'text-emerald-500' : 'text-amber-500')} title={row.original.status === 'suspended' ? 'Reactivate' : 'Suspend'}>
            {row.original.status === 'suspended' ? <FiShield className="w-4 h-4" /> : <FiShieldOff className="w-4 h-4" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(row.original); }} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" title="Delete"><FiTrash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={rows}
        toolbar={
          <>
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email…"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-admin-200 dark:border-admin-700 bg-white dark:bg-admin-900 text-sm text-admin-900 dark:text-white placeholder-admin-400 focus:ring-2 focus:ring-accent-500/30 focus:outline-none"
              />
            </div>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-xl border border-admin-200 dark:border-admin-700 bg-white dark:bg-admin-900 px-3 py-2 text-sm text-admin-700 dark:text-admin-200">
              <option value="all">All roles</option>
              <option value="user">User</option>
              <option value="admin">Administrator</option>
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-admin-200 dark:border-admin-700 bg-white dark:bg-admin-900 px-3 py-2 text-sm text-admin-700 dark:text-admin-200">
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <button onClick={() => setEditor({ open: true, initial: null })} className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent-600 text-white text-sm font-medium hover:bg-accent-700">
              <FiUserPlus className="w-4 h-4" /> New User
            </button>
          </>
        }
      />

      <UserEditor
        open={editor.open}
        initial={editor.initial}
        onClose={() => setEditor({ open: false, initial: null })}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
