import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  FiMail, FiLock, FiEye, FiEyeOff, 
  FiArrowLeft, FiGithub, FiTwitter, FiLinkedin,
  FiCheck, FiAlertCircle, FiRefreshCw
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

// Social Login Buttons
const SocialLoginButtons = ({ disabled }) => {
  const socialProviders = [
    { icon: FiGithub, label: 'GitHub', color: 'hover:bg-gray-800 hover:text-white' },
    { icon: FiTwitter, label: 'Twitter', color: 'hover:bg-blue-400 hover:text-white' },
    { icon: FiLinkedin, label: 'LinkedIn', color: 'hover:bg-blue-600 hover:text-white' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {socialProviders.map(({ icon: Icon, label, color }) => (
        <button
          key={label}
          type="button"
          className={cn(
            'flex items-center justify-center py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl transition-all duration-200 group',
            color,
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          disabled={disabled}
        >
          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors" />
        </button>
      ))}
    </div>
  );
};


// ==================== Main Component ====================

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
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

               {/* Divider */}
               <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white dark:bg-gray-800 text-sm text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Social Login */}
              <SocialLoginButtons disabled={isDisabled} />
            </form>
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