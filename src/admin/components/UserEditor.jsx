import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { FiSave, FiX } from 'react-icons/fi';

const schema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  plan: z.enum(['free', 'pro', 'express']),
  role: z.enum(['user', 'admin']),
  emailVerified: z.boolean(),
});

export default function UserEditor({ open, initial, onClose, onSubmit }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: '', plan: 'free', role: 'user', emailVerified: true },
  });

  useEffect(() => {
    if (open) {
      reset(initial || { fullName: '', email: '', plan: 'free', role: 'user', emailVerified: true });
    }
  }, [open, initial, reset]);

  const submit = (data) => onSubmit(data);

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={initial ? 'Edit User' : 'Create User'}
      footer={
        <>
          <button onClick={onClose} className="btn-ghost"><FiX className="w-4 h-4 mr-1.5" />Cancel</button>
          <button onClick={handleSubmit(submit)} className="btn bg-accent-600 text-white hover:bg-accent-700"><FiSave className="w-4 h-4 mr-1.5" />{initial ? 'Save Changes' : 'Create User'}</button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(submit)}>
        <Input label="Full Name" {...register('fullName')} error={errors.fullName?.message} />
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} disabled={!!initial} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-admin-700 dark:text-admin-300 mb-1">Plan</label>
            <select {...register('plan')} className="block w-full rounded-lg border border-admin-300 dark:border-admin-700 bg-white dark:bg-admin-900 px-3 py-2.5 text-sm text-admin-900 dark:text-white">
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="express">Express</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-admin-700 dark:text-admin-300 mb-1">Role</label>
            <select {...register('role')} className="block w-full rounded-lg border border-admin-300 dark:border-admin-700 bg-white dark:bg-admin-900 px-3 py-2.5 text-sm text-admin-900 dark:text-white">
              <option value="user">User</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-admin-700 dark:text-admin-300">
          <input type="checkbox" {...register('emailVerified')} className="rounded border-admin-300" />
          Email verified
        </label>
      </form>
    </Modal>
  );
}
