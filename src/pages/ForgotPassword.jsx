import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FiMail } from 'react-icons/fi';
import { forgotPassword } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { cn } from '../utils/helpers';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Card } from '../components/common/Card';

const schema = z.object({ email: z.string().email('Invalid email') });

export default function ForgotPassword() {
  const { success, error } = useNotification();
  const [submitted, setSubmitted] = useState(false);

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
      await forgotPassword(data.email);
      success('If an account with that email exists, a reset link has been sent.');
      setSubmitted(true);
    } catch (err) {
      error(err.message);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Card className="max-w-md w-full text-center">
          <FiMail className="mx-auto h-12 w-12 text-primary-600" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Check your email</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">We've sent a password reset link to your email address.</p>
          <Link to="/login" className="mt-6 inline-block text-primary-600 hover:text-primary-700 font-medium">Back to login</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Forgot password?</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Enter your email and we'll send you a reset link.</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <div className="relative"><FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" className="pl-10" placeholder="you@example.com" {...register('email')} />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <Button type="submit" loading={isSubmitting} className="w-full">Send Reset Link</Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700">Back to login</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}