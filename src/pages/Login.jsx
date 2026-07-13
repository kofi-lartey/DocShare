import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  FiMail, FiLock, FiEye, FiEyeOff, 
  FiArrowLeft,
  FiCheck, FiAlertCircle, FiRefreshCw, FiSmartphone
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { cn } from '../utils/helpers';
import Button from '../components/common/Button';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter 
} from '../components/common/Card';
import BrandLogo from '../components/common/BrandLogo';

// ==================== Constants ====================
const LOGIN_SCHEMA = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .min(5, 'Email is too short'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

const DEFAULT_VALUES = {
  email: '',
  password: '',
  rememberMe: false,
};

// ==================== Components ====================

// Background Decorations
const BackgroundDecorations = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
  </div>
);

// Logo Component
const Logo = () => (
  <Link to="/" className="inline-flex items-center gap-3 group">
    <BrandLogo size="xl" />
    <div className="text-left">
      <span className="block text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        DocShare Pro
      </span>
      <span className="block text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">
        Document Sharing Platform
      </span>
    </div>
  </Link>
);

// Input Field Component
const FormField = ({ 
  label, 
  icon: Icon, 
  type, 
  register, 
  error, 
  touched,
  value,
  placeholder,
  disabled,
  rightElement
}) => {
  const hasError = error && touched;
  const isValid = touched && !error && value;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <input
          type={type}
          className={cn(
            'w-full pl-11 pr-4 py-3.5 bg-gray-50/80 dark:bg-gray-700/50 border-2 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 outline-none text-gray-900 dark:text-white placeholder:text-gray-400',
            hasError 
              ? 'border-red-500 focus:border-red-500' 
              : 'border-gray-200 dark:border-gray-600 focus:border-blue-500'
          )}
          placeholder={placeholder}
          {...register}
          disabled={disabled}
        />
        {isValid && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <FiCheck className="w-5 h-5 text-green-500" />
          </div>
        )}
        {rightElement}
      </div>
      <AnimatePresence>
        {hasError && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5"
          >
            <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
            {error.message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// Password Field Component
const PasswordField = ({ register, error, touched, value, disabled }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormField
      label="Password"
      icon={FiLock}
      type={showPassword ? 'text' : 'password'}
      register={register}
      error={error}
      touched={touched}
      value={value}
      placeholder="Enter your password"
      disabled={disabled}
      rightElement={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
        </button>
      }
    />
  );
};

// ==================== Main Component ====================

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, sendOtpLogin, loginWithOtp } = useAuth();
  const { success, error } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting, touchedFields } } = useForm({
    resolver: zodResolver(LOGIN_SCHEMA),
    mode: 'onChange',
    defaultValues: DEFAULT_VALUES,
  });

  const watchedEmail = watch('email');
  const watchedPassword = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      success('Welcome back! ðŸŽ‰');
      
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from);
    } catch (err) {
      if (err.message?.includes('EMAIL_NOT_VERIFIED')) {
        error('Email not verified. Please enter the OTP sent to your email.');
        navigate('/verify-otp', { state: { email: data.email } });
      } else {
        error(err.message || 'Invalid email or password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = isLoading || isSubmitting;

  const [authMethod, setAuthMethod] = useState('password');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpResendCountdown, setOtpResendCountdown] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);
  const otpInputsRef = useRef([]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!otpEmail || !otpEmail.includes('@')) {
      error('Please enter a valid email address');
      return;
    }
    setOtpLoading(true);
    try {
      const response = await sendOtpLogin(otpEmail);
      success(response.message || 'Verification code sent!');
      setOtpSent(true);
      setIsNewUser(response.data?.isNewUser || false);
      setOtpCountdown(600);
      setOtpResendCountdown(60);
      otpInputsRef.current[0]?.focus();
    } catch (err) {
      error(err.message || 'Failed to send verification code');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      error('Please enter the full 6-digit code');
      return;
    }
    setOtpLoading(true);
    try {
      const response = await loginWithOtp(otpEmail, code);
      success('Welcome!' + (isNewUser ? ' Your account has been created.' : ''));
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from);
    } catch (err) {
      error(err.message || 'Invalid or expired OTP');
      setOtp(Array(6).fill(''));
      otpInputsRef.current[0]?.focus();
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpLoading(true);
    try {
      const response = await sendOtpLogin(otpEmail);
      success(response.message || 'A new verification code has been sent.');
      setOtp(Array(6).fill(''));
      setOtpCountdown(600);
      setOtpResendCountdown(60);
      otpInputsRef.current[0]?.focus();
    } catch (err) {
      error(err.message || 'Failed to resend code');
    } finally {
      setOtpLoading(false);
    }
  };

  useEffect(() => {
    let otpTimer;
    if (otpCountdown > 0 && otpSent) {
      otpTimer = setInterval(() => {
        setOtpCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(otpTimer);
  }, [otpCountdown, otpSent]);

  useEffect(() => {
    let resendTimer;
    if (otpResendCountdown > 0 && otpSent) {
      resendTimer = setInterval(() => {
        setOtpResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(resendTimer);
  }, [otpResendCountdown, otpSent]);

  const formatOtpTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <BackgroundDecorations />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Logo />
          <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Card */}
        <Card 
          variant="glass" 
          padding="lg" 
          className="backdrop-blur-sm shadow-2xl border-white/20 dark:border-gray-700/50"
        >
          <CardContent className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 mx-auto">
                <span className="text-white text-3xl">🔐</span>
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                Sign in to your account
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Enter your credentials to access your documents
              </p>
            </div>

            {/* Auth Method Tabs */}
            <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setAuthMethod('password')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  authMethod === 'password'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <FiLock className="w-4 h-4" />
                Password
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('otp')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  authMethod === 'otp'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <FiSmartphone className="w-4 h-4" />
                OTP Login
              </button>
            </div>

            {authMethod === 'password' ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <FormField
                label="Email Address"
                icon={FiMail}
                type="email"
                register={register('email')}
                error={errors.email}
                touched={touchedFields.email}
                value={watchedEmail}
                placeholder="you@example.com"
                disabled={isDisabled}
              />

              {/* Password Field */}
              <PasswordField
                register={register('password')}
                error={errors.password}
                touched={touchedFields.password}
                value={watchedPassword}
                disabled={isDisabled}
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                    {...register('rememberMe')}
                    disabled={isDisabled}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                    Remember me
                  </span>
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium hover:underline transition-all"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
               <Button
                 type="submit"
                 loading={isLoading || isSubmitting}
                 disabled={isDisabled}
                 className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
               >
                 {isLoading || isSubmitting ? 'Signing in...' : 'Sign In'}
               </Button>

             </form>
            ) : (
             <div className="space-y-5">
               {!otpSent ? (
                 <form onSubmit={handleSendOtp} className="space-y-5">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                       Email Address <span className="text-red-500">*</span>
                     </label>
                     <div className="relative group">
                       <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                         <FiMail className="w-5 h-5" />
                       </div>
                       <input
                         type="email"
                         value={otpEmail}
                         onChange={(e) => setOtpEmail(e.target.value)}
                         className="w-full pl-11 pr-4 py-3.5 bg-gray-50/80 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                         placeholder="you@example.com"
                         disabled={otpLoading}
                       />
                     </div>
                   </div>

                   <Button
                     type="submit"
                     loading={otpLoading}
                     disabled={otpLoading}
                     className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
                   >
                     {otpLoading ? 'Sending...' : 'Send OTP'}
                   </Button>
                 </form>
               ) : (
                 <form onSubmit={handleOtpLogin} className="space-y-5">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Enter 6-digit code sent to <span className="font-medium text-gray-900 dark:text-white break-all">{otpEmail}</span>
                     </label>
                     <div className="flex justify-between gap-2">
                       {Array.from({ length: 6 }).map((_, index) => (
                         <input
                           key={index}
                           ref={el => otpInputsRef.current[index] = el}
                           type="text"
                           inputMode="numeric"
                           maxLength={1}
                           value={otp[index]}
                           onChange={(e) => {
                             if (!/^\d*$/.test(e.target.value)) return;
                             const newOtp = [...otp];
                             newOtp[index] = e.target.value.slice(-1);
                             setOtp(newOtp);
                             if (e.target.value && index < 5) {
                               otpInputsRef.current[index + 1]?.focus();
                             }
                           }}
                           onKeyDown={(e) => {
                             if (e.key === 'Backspace' && !otp[index] && index > 0) {
                               otpInputsRef.current[index - 1]?.focus();
                             }
                           }}
                           className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold border-2 rounded-xl outline-none transition-all duration-200 bg-gray-50/80 dark:bg-gray-700/50 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                         />
                       ))}
                     </div>
                     <div className="flex items-center justify-between mt-3">
                       <button
                         type="button"
                         onClick={() => { setOtpSent(false); setOtp(Array(6).fill('')); }}
                         className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 inline-flex items-center gap-1 transition-colors"
                       >
                         <FiArrowLeft className="w-3 h-3" />
                         Change email
                       </button>
                       <p className={`text-xs font-medium ${otpCountdown > 0 ? 'text-gray-500 dark:text-gray-400' : 'text-red-500'}`}>
                         {otpCountdown > 0 ? `Expires in ${formatOtpTime(otpCountdown)}` : 'Code expired'}
                       </p>
                     </div>
                   </div>

                   <Button
                     type="submit"
                     loading={otpLoading}
                     disabled={otpLoading || otp.some(d => d === '')}
                     className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
                   >
                     {otpLoading ? 'Verifying...' : 'Verify & Login'}
                   </Button>

                   <div className="text-center">
                     {otpResendCountdown > 0 ? (
                       <p className="text-xs text-gray-500 dark:text-gray-400">
                         Resend in {formatOtpTime(otpResendCountdown)}
                       </p>
                     ) : (
                       <button
                         type="button"
                         onClick={handleResendOtp}
                         disabled={otpLoading}
                         className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                       >
                         <FiRefreshCw className="w-3 h-3" />
                         Resend Code
                       </button>
                     )}
                   </div>
                 </form>
               )}
             </div>
           )}
          </CardContent>

          <CardFooter align="center" className="border-t border-gray-200/50 dark:border-gray-700/50 pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold hover:underline transition-all"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </motion.div>
      </motion.div>

      {/* Animations CSS */}
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