import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { confirmEmail } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { Card } from '../components/common/Card';
import Button from '../components/common/Button';
import ImageLoader from '../components/common/ImageLoader';

export default function ConfirmEmail() {
  const { token } = useParams();
  const { success, error } = useNotification();
  const [state, setState] = useState('loading');

  useEffect(() => {
    confirmEmail(token)
      .then(() => {
        setState('success');
        success('Email confirmed successfully!');
      })
      .catch(() => {
        setState('error');
        error('Invalid or expired confirmation link.');
      });
  }, [token]);

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="text-center">
          <ImageLoader size="md" className="mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Confirming your email...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{state === 'success' ? 'Email Confirmed!' : 'Confirmation Failed'}</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          {state === 'success'
            ? 'Your email has been successfully confirmed. You can now log in to your account.'
            : 'This confirmation link is invalid or has expired. Please request a new one.'}
        </p>
        <Link to="/login"><Button className="mt-6">Go to Login</Button></Link>
      </Card>
    </div>
  );
}
