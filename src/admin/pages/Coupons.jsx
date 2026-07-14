import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiPlus, FiEdit2, FiTrash2, FiTag, FiCopy, FiCheck, FiX } from 'react-icons/fi';
import { Modal } from '../../components/common/Modal';
import Input from '../../components/common/Input';
import DataTable from '../components/DataTable';
import StatusPill from '../components/StatusPill';
import { useNotification } from '../../contexts/NotificationContext';
import { formatDate, cn } from '../../utils/helpers';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../adminApi';

const schema = z.object({
  code: z.string().min(3, 'Code required').max(20).toUpperCase(),
  type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().min(0, 'Must be ≥ 0'),
  currency: z.string().max(4).default('GHS'),
  appliesTo: z.array(z.enum(['pro', 'express'])).optional(),
  minAmount: z.coerce.number().min(0).optional(),
  maxRedemptions: z.coerce.number().min(0).optional(),
  description: z.string().max(120).optional(),
});

function CouponEditor({ open, initial, onClose, onSubmit }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { code: '', type: 'percentage', value: 10, currency: 'GHS', appliesTo: [], minAmount: 0, maxRedemptions: '', description: '' },
  });
  useEffect(() => {
    if (open) reset(initial || { code: '', type: 'percentage', value: 10, currency: 'GHS', appliesTo: [], minAmount: 0, maxRedemptions: '', description: '' });
  }, [open, initial, reset]);

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={initial ? 'Edit Coupon' : 'Create Coupon'}
      footer={
        <>
          <button onClick={onClose} className="btn-ghost"><FiX className="w-4 h-4 mr-1.5" />Cancel</button>
          <button onClick={handleSubmit(onSubmit)} className="btn bg-accent-600 text-white hover:bg-accent-700"><FiCheck className="w-4 h-4 mr-1.5" />{initial ? 'Save' : 'Create'}</button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Code" {...register('code')} error={errors.code?.message} placeholder="WELCOME20" />
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-admin-700 dark:text-admin-300 mb-1">Type</label>
            <select {...register('type')} className="w-full rounded-lg border border-admin-300 dark:border-admin-700 bg-white dark:bg-admin-900 px-3 py-2.5 text-sm">
              <option value="percentage">% Off</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>
          <Input label="Value" type="number" {...register('value')} error={errors.value?.message} />
          <Input label="Currency" {...register('currency')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Min Amount" type="number" {...register('minAmount')} />
          <Input label="Max Redemptions" type="number" {...register('maxRedemptions')} placeholder="blank = unlimited" />
        </div>
        <div>
          <label className="block text-sm font-medium text-admin-700 dark:text-admin-300 mb-1">Applies To</label>
          <div className="flex gap-4 text-sm text-admin-700 dark:text-admin-200">
            <label className="flex items-center gap-2"><input type="checkbox" value="pro" {...register('appliesTo')} className="rounded border-admin-300" />Pro</label>
            <label className="flex items-center gap-2"><input type="checkbox" value="express" {...register('appliesTo')} className="rounded border-admin-300" />Express</label>
            <span className="text-xs text-admin-400 self-center">(none = all plans)</span>
          </div>
        </div>
        <Input label="Description" {...register('description')} />
      </form>
    </Modal>
  );
}

export default function Coupons() {
  const { success } = useNotification();
  const [params, setParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [editor, setEditor] = useState({ open: false, initial: null });
  const [copied, setCopied] = useState(null);

  const load = async () => {
    const res = await getCoupons();
    setRows(res.data.coupons);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (params.get('action') === 'new') {
      setEditor({ open: true, initial: null });
      params.delete('action'); setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (data) => {
    const payload = { ...data, maxRedemptions: data.maxRedemptions === '' ? null : data.maxRedemptions, appliesTo: data.appliesTo || [] };
    if (editor.initial) { await updateCoupon(editor.initial._id, payload); success('Coupon updated'); }
    else { await createCoupon(payload); success('Coupon created'); }
    setEditor({ open: false, initial: null });
    load();
  };

  const toggleActive = async (c) => {
    await updateCoupon(c._id, { active: !c.active });
    success(c.active ? 'Coupon disabled' : 'Coupon enabled');
    load();
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete coupon ${c.code}?`)) return;
    await deleteCoupon(c._id);
    success('Coupon deleted');
    load();
  };

  const copy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1200);
  };

  const columns = useMemo(() => [
    {
      header: 'Coupon', accessorKey: 'code',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 dark:bg-accent-600/10 text-accent-600"><FiTag className="w-4 h-4" /></span>
          <div>
            <p className="font-mono font-medium text-admin-900 dark:text-white">{row.original.code}</p>
            <p className="text-xs text-admin-400">{row.original.description}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Discount', accessorKey: 'value',
      cell: ({ row }) => <span className="tabular-nums font-medium">{row.original.type === 'percentage' ? `${row.original.value}%` : `${row.original.currency} ${row.original.value}`}</span>,
    },
    {
      header: 'Redemptions', accessorKey: 'usedCount',
      cell: ({ row }) => {
        const { usedCount, maxRedemptions } = row.original;
        const pct = maxRedemptions ? Math.min(100, (usedCount / maxRedemptions) * 100) : 0;
        return (
          <div className="min-w-[120px]">
            <p className="text-xs tabular-nums">{usedCount}{maxRedemptions ? ` / ${maxRedemptions}` : ' (unlimited)'}</p>
            <div className="h-1.5 mt-1 rounded-full bg-admin-100 dark:bg-admin-800 overflow-hidden">
              <div className={cn('h-full', maxRedemptions && usedCount >= maxRedemptions ? 'bg-red-500' : 'bg-accent-500')} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Revenue Impact', accessorKey: 'revenueImpact',
      cell: ({ getValue }) => <span className="tabular-nums font-medium">{getValue() ? `GHS ${getValue().toLocaleString()}` : '—'}</span>,
    },
    {
      header: 'Status', accessorKey: 'active',
      cell: ({ row }) => row.original.active
        ? <StatusPill tone="green">Active</StatusPill>
        : <StatusPill tone="slate">Inactive</StatusPill>,
    },
    {
      header: 'Expires', accessorKey: 'validTo',
      cell: ({ getValue }) => <span className="text-xs">{getValue ? formatDate(getValue) : 'Never'}</span>,
    },
    {
      header: '', id: 'actions', sortable: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => copy(row.original.code)} className="p-2 rounded-lg text-admin-500 hover:bg-admin-100 dark:hover:bg-admin-800" title="Copy code">
            {copied === row.original.code ? <FiCheck className="w-4 h-4 text-emerald-500" /> : <FiCopy className="w-4 h-4" />}
          </button>
          <button onClick={() => toggleActive(row.original)} className={cn('p-2 rounded-lg hover:bg-admin-100 dark:hover:bg-admin-800', row.original.active ? 'text-amber-500' : 'text-emerald-500')} title={row.original.active ? 'Disable' : 'Enable'}>
            {row.original.active ? <FiX className="w-4 h-4" /> : <FiCheck className="w-4 h-4" />}
          </button>
          <button onClick={() => setEditor({ open: true, initial: row.original })} className="p-2 rounded-lg text-admin-500 hover:bg-admin-100 dark:hover:bg-admin-800" title="Edit"><FiEdit2 className="w-4 h-4" /></button>
          <button onClick={() => remove(row.original)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" title="Delete"><FiTrash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ], [copied]);

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={rows}
        toolbar={
          <button onClick={() => setEditor({ open: true, initial: null })} className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent-600 text-white text-sm font-medium hover:bg-accent-700">
            <FiPlus className="w-4 h-4" /> New Coupon
          </button>
        }
      />
      <CouponEditor open={editor.open} initial={editor.initial} onClose={() => setEditor({ open: false, initial: null })} onSubmit={handleSubmit} />
    </div>
  );
}
