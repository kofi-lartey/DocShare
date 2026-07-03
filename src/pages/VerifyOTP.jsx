import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { verifyOtp, resendVerification } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { cn } from '../utils/helpers';
import Button from '../components/common/Button';
import {
  Card,
  CardContent
} from '../components/common/Card';
import {
  FiMail,
  FiArrowLeft,
  FiRefreshCw
} from 'react-icons/fi';

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 600;
const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error } = useNotification();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(OTP_EXPIRY_SECONDS);
  const [resendCountdown, setResendCountdown] = useState(RESEND_COOLDOWN_SECONDS);

  const email = location.state?.email || '';
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setOtpCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-OTP_LENGTH);
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      error('Please enter the full 6-digit code');
      return;
    }
    setIsLoading(true);
    try {
      const response = await verifyOtp(email, code);
      success('Email verified successfully! ðŸŽ‰');
      if (response.data?.token) {
        localStorage.setItem('docshare_token', response.data.token);
        localStorage.setItem('docshare_user', JSON.stringify(response.data));
        navigate('/subscription-required');
      } else {
        navigate('/login');
      }
    } catch (err) {
      error(err.message || 'Invalid or expired OTP');
      setOtp(Array(OTP_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const res = await resendVerification(email);
      success(res.message || 'A new verification code has been sent.');
      setOtp(Array(OTP_LENGTH).fill(''));
      setOtpCountdown(OTP_EXPIRY_SECONDS);
      setResendCountdown(RESEND_COOLDOWN_SECONDS);
      inputsRef.current[0]?.focus();
    } catch (err) {
      error(err.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 mx-auto">
            <FiMail className="w-8 h-8 text-white" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Verify your email
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Enter the 6-digit code sent to<br />
            <span className="font-medium text-gray-900 dark:text-white break-all">{email}</span>
          </p>
        </div>

        <Card variant="glass" padding="lg" className="backdrop-blur-sm shadow-2xl border-white/20 dark:border-gray-700/50">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-between gap-3">
                {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                  <input
                    key={index}
                    ref={el => inputsRef.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[index]}
                    onChange={e => handleChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    className={cn(
                      'w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all duration-200',
                      'bg-gray-50/80 dark:bg-gray-700/50 text-gray-900 dark:text-white',
                      'border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                      otpCountdown === 0 && 'border-red-300 dark:border-red-700'
                    )}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 inline-flex items-center gap-1 transition-colors"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Change email
                </button>
                <p className={cn(
                  'text-sm font-medium',
                  otpCountdown > 0 ? 'text-gray-500 dark:text-gray-400' : 'text-red-500'
                )}>
                  {otpCountdown > 0 ? `Expires in ${formatTime(otpCountdown)}` : 'Code expired'}
                </p>
              </div>

              <Button
                type="submit"
                loading={isLoading}
                disabled={isLoading || otp.some(d => d === '')}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
              >
                Verify Email
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
                Didn't receive the code?
              </p>
              {resendCountdown > 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Resend in {formatTime(resendCountdown)}
                </p>
              ) : (
                <Button
                  type="button"
                  onClick={handleResend}
                  loading={isResending}
                  disabled={isResending}
                  variant="outline"
                  className="w-full"
                >
                  <FiRefreshCw className="w-4 h-4 mr-2" />
                  Resend Code
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
