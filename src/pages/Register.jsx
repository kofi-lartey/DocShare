import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { register as apiRegister } from '../services/api';
import {
  FiUser, FiMail, FiLock, FiEye, FiEyeOff,
  FiCheck, FiArrowLeft, FiShield, FiStar,
  FiGithub, FiTwitter, FiLinkedin, FiAlertCircle
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../contexts/NotificationContext';
import { cn } from '../utils/helpers';
import Button from '../components/common/Button';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter
} from '../components/common/Card';

// ==================== Constants ====================
const REGISTER_SCHEMA = z.object({
  fullName: z.string()
    .min(2, 'Full name is required')
    .max(50, 'Name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z.string()
    .email('Please enter a valid email address')
    .min(5, 'Email is too short'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const DEFAULT_VALUES = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false,
};

// ==================== Components ====================

// Background Decorations
const BackgroundDecorations = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
  </div>
);

// Logo Component
const Logo = () => (
  <Link to="/" className="inline-flex items-center gap-3 group">
    <div className="relative">
      <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
        <span className="text-white font-bold text-2xl">DS</span>
      </div>
      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
    </div>
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

// Form Field Component
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
const PasswordField = ({ label, register, error, touched, value, disabled }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormField
      label={label}
      icon={FiLock}
      type={showPassword ? 'text' : 'password'}
      register={register}
      error={error}
      touched={touched}
      value={value}
      placeholder={label === 'Confirm Password' ? 'Confirm your password' : 'Create a strong password'}
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

// Password Strength Indicator
const PasswordStrength = ({ password, passwordStrength }) => {
  if (!password || password.length === 0) return null;

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    if (passwordStrength <= 4) return 'Strong';
    return 'Very Strong';
  };

  const requirements = [
    { label: 'Min 8 characters', test: (p) => p.length >= 8 },
    { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { label: 'Lowercase letter', test: (p) => /[a-z]/.test(p) },
    { label: 'Number', test: (p) => /[0-9]/.test(p) },
    { label: 'Special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-3 space-y-2"
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(passwordStrength / 5) * 100}%` }}
            className={`h-full ${getStrengthColor()} rounded-full transition-all duration-500`}
          />
        </div>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {getStrengthText()}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {requirements.map((req, index) => (
          <p key={index} className={cn(
            'text-xs flex items-center gap-1.5 transition-colors',
            req.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
          )}>
            <span className={cn(
              'inline-block w-1.5 h-1.5 rounded-full',
              req.test(password) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            )} />
            {req.label}
          </p>
        ))}
      </div>
    </motion.div>
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

export default function Register() {
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotification();
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting, touchedFields } } = useForm({
    resolver: zodResolver(REGISTER_SCHEMA),
    mode: 'onChange',
    defaultValues: DEFAULT_VALUES,
  });

  const watchedPassword = watch('password');
  const watchedEmail = watch('email');
  const watchedFullName = watch('fullName');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await apiRegister({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        terms: data.terms,
      });
      if (response.data.token) {
        localStorage.setItem('docshare_token', response.data.token);
      }
      success('Account created successfully! Welcome to DocShare Pro 🎉');
      navigate('/dashboard');
    } catch (err) {
      notifyError(err.message || 'Registration failed. Please try again.');
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
        <div className="text-center mb-8">
          <Logo />
          <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Start sharing documents instantly
          </p>
        </div>

        <Card variant="glass" padding="lg" className="backdrop-blur-sm shadow-2xl border-white/20 dark:border-gray-700/50">
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 mx-auto">
                <span className="text-white text-3xl">✨</span>
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                Create your account
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Start sharing documents instantly
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                label="Full Name"
                icon={FiUser}
                type="text"
                register={register('fullName')}
                error={errors.fullName}
                touched={touchedFields.fullName}
                value={watchedFullName}
                placeholder="John Doe"
                disabled={isDisabled}
              />

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

              <div>
                <PasswordField
                  label="Password"
                  register={register('password')}
                  error={errors.password}
                  touched={touchedFields.password}
                  value={watchedPassword}
                  disabled={isDisabled}
                />
                <PasswordStrength 
                  password={watchedPassword} 
                  passwordStrength={passwordStrength}
                />
              </div>

              <FormField
                label="Confirm Password"
                icon={FiLock}
                type={showConfirmPassword ? 'text' : 'password'}
                register={register('confirmPassword')}
                error={errors.confirmPassword}
                touched={touchedFields.confirmPassword}
                value={watch('confirmPassword')}
                placeholder="Confirm your password"
                disabled={isDisabled}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                }
              />

              <div className="flex items-start gap-3 p-3 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                  {...register('terms')}
                  disabled={isDisabled}
                />
                <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium hover:underline">
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
              <AnimatePresence>
                {errors.terms && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-red-600 flex items-center gap-1.5"
                  >
                    <FiAlertCircle className="w-4 h-4" />
                    {errors.terms.message}
                  </motion.p>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                loading={isDisabled}
                disabled={isDisabled}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
              >
                {isDisabled ? 'Creating account...' : 'Create Account'}
              </Button>

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

              <SocialLoginButtons disabled={isDisabled} />
            </form>
          </CardContent>

          <CardFooter align="center" className="border-t border-gray-200/50 dark:border-gray-700/50 pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold hover:underline transition-all"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>

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