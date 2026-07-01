import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockResetPassword } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { cn } from '../utils/helpers';
import Button from '../components/common/Button';
import { Card } from '../components/common/Card';

const schema = z.object({
  password: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const [show, setShow] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: async (data) => {
      const result = schema.safeParse(data);
      if (!result.success) {
        const fieldErrors = {};
        result.error.errors.forEach(e => { fieldErrors[e.path[0]] = e.message; });
        return { values: {}, errors: fieldErrors };
      }
      return { values: result.data, errors: {} };
    },
  });

  const onSubmit = async (data) => {
    try {
      await mockResetPassword(token, data.password);
      success('Password reset successful!');
      navigate('/login');
    } catch (err) {
      error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">Reset password</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Enter your new password below.</p>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <div className="relative"><FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={show ? 'text' : 'password'} className="pl-10 pr-10" placeholder="••••••••" {...register('password')} />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {show ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
              <div className="relative"><FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" className="pl-10" placeholder="••••••••" {...register('confirmPassword')} />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" loading={isSubmitting} className="w-full">Reset Password</Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700">Back to login</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}