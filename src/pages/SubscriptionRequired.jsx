import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiCheck, FiCreditCard, FiStar, 
  FiZap, FiArrowRight, FiInfo,
  FiCheckCircle, FiAlertCircle, FiX,
  FiLock, FiUnlock, FiRefreshCw, FiFile,
  FiImage, FiVideo, FiMusic, FiFileText,
  FiShield
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { createSubscription } from '../services/api';
import { PRICING_PLANS } from '../utils/constants';
import { cn } from '../utils/helpers';
import Button from '../components/common/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { Spinner } from '../components/common/Spinner';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

const PlanFeature = ({ feature, included = true }) => (
  <div className="flex items-start gap-3 text-sm">
    {included ? (
      <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
    ) : (
      <FiX className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" />
    )}
    <span className={cn(
      'text-gray-600 dark:text-gray-400',
      !included && 'text-gray-400 dark:text-gray-500 line-through'
    )}>
      {feature}
    </span>
  </div>
);

const PlanCard = ({ plan, isFree, onSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={cn(
        'relative bg-white dark:bg-gray-800 rounded-3xl border-2 p-6 transition-all duration-300 flex flex-col',
        plan.popular 
          ? 'border-blue-500 dark:border-blue-400 shadow-2xl shadow-blue-500/20 scale-105' 
          : 'border-gray-200 dark:border-gray-700 hover:shadow-xl'
      )}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="primary" className="px-4 py-1.5 text-xs">
            <FiStar className="w-3 h-3 mr-1" />
            Recommended
          </Badge>
        </div>
      )}

      <div className="text-center mb-6">
        <div className={cn('inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4',
          plan.id === 'free' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
          plan.id === 'pro' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' :
          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
        )}>
          {plan.id === 'free' ? <FiFile className="w-6 h-6" /> :
           plan.id === 'pro' ? <FiZap className="w-6 h-6" /> :
           <FiStar className="w-6 h-6" />}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>
        <div className="mt-4 flex items-baseline justify-center">
          <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
            {plan.customPrice ? 'Custom' : `GH\u20B5${plan.price}`}
          </span>
          {!plan.customPrice && <span className="text-gray-500 ml-1">/{plan.interval}</span>}
        </div>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature, idx) => (
          <PlanFeature key={idx} feature={feature} included={true} />
        ))}
      </ul>

      <Button
        variant={plan.popular ? 'primary' : 'outline'}
        className="w-full"
        onClick={() => onSelect(plan)}
      >
        {isFree ? 'Activate Free Plan' : `Subscribe to ${plan.name}`}
        <FiArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
};

export default function SubscriptionRequired() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentProvider, setPaymentProvider] = useState('stripe');
  const [showSuccess, setShowSuccess] = useState(false);
  const { success, error: notifyError } = useNotification();
  const { updateUser, user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location }, replace: true });
      return;
    }
    setLoading(false);
  }, [isAuthenticated, authLoading, navigate, location]);

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = new URLSearchParams(location.search).get('reference');
      if (!reference) return;
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/payment/verify-paystack/${reference}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('docshare_token')}`
          }
        });
        const result = await response.json();
        if (result.success) {
          success('Payment verified successfully!');
          setShowSuccess(true);
        } else {
          notifyError(result.message || 'Payment verification failed');
        }
      } catch (err) {
        notifyError(err.message || 'Payment verification failed');
      } finally {
        setLoading(false);
      }
    };
    verifyPayment();
  }, [location, success, notifyError]);

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    try {
      const result = await createSubscription({ 
        planId: selectedPlan.id,
        paymentMethod: paymentProvider
      });
      
      if (selectedPlan.price > 0) {
        if (paymentProvider === 'stripe' && result.data?.sessionUrl) {
          window.location.href = result.data.sessionUrl;
          return;
        }
        if (paymentProvider === 'paystack' && result.data?.authorizationUrl) {
          window.location.href = result.data.authorizationUrl;
          return;
        }
      }
      
      if (result.data?.user) {
        if (result.data.user.token) {
          localStorage.setItem('docshare_token', result.data.user.token);
        }
        updateUser(result.data.user);
      }
      
      setShowSuccess(true);
      success('Subscription created successfully!');
    } catch (err) {
      notifyError(err.message || 'Failed to create subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlanSelect = (plan) => {
    if (!isAuthenticated) {
      notifyError('Please log in to select a plan');
      navigate('/login', { state: { from: location } });
      return;
    }
    setSelectedPlan(plan);
    setShowPaymentMethod(true);
  };

  const handlePaymentMethodConfirm = () => {
    setShowPaymentMethod(false);
    setShowPayment(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Verifying your subscription...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <nav className="border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">DS</span>
              </div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DocShare Pro
              </span>
            </Link>
            <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <Badge variant="primary" className="mb-4">
            <FiShield className="w-3 h-3 mr-1" />
            Subscription Required
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Complete Your Subscription
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose a plan below to unlock the full DocShare Pro experience. 
            Start free and upgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PRICING_PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isFree={plan.id === 'free'}
              onSelect={handlePlanSelect}
            />
          ))}
        </div>

        <div className="mt-12 flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="w-5 h-5 text-green-500" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <FiShield className="w-5 h-5 text-blue-500" />
            <span>Secure payments</span>
          </div>
          <div className="flex items-center gap-2">
            <FiRefreshCw className="w-5 h-5 text-purple-500" />
            <span>Instant activation</span>
          </div>
        </div>
        </div>

        <Modal isOpen={showPaymentMethod} onClose={() => setShowPaymentMethod(false)} title="Select Payment Method" size="md">
          <div className="space-y-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose how you would like to pay for your <span className="font-semibold text-gray-900 dark:text-white">{selectedPlan?.name}</span> plan.
            </p>
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => { setPaymentProvider('stripe'); }}
                className={cn(
                  'p-4 border rounded-xl flex items-center gap-3 transition-all',
                  paymentProvider === 'stripe'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xs">
                  Stripe
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Pay with Card</p>
                  <p className="text-xs text-gray-500">Visa, Mastercard, Apple Pay</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => { setPaymentProvider('paystack'); }}
                className={cn(
                  'p-4 border rounded-xl flex items-center gap-3 transition-all',
                  paymentProvider === 'paystack'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 font-bold text-xs">
                  Paystack
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Pay with Mobile Money / Card</p>
                  <p className="text-xs text-gray-500">M-Pesa, Vodafone Cash, Cards</p>
                </div>
              </button>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button variant="ghost" onClick={() => setShowPaymentMethod(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handlePaymentMethodConfirm}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Continue to {paymentProvider === 'stripe' ? 'Stripe' : 'Paystack'}
            </Button>
          </div>
        </Modal>

        <Modal isOpen={showPayment} onClose={() => setShowPayment(false)} title="Complete Subscription" size="md">
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">Selected Plan</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{selectedPlan?.name}</p>
              <p className="text-sm text-gray-500">{selectedPlan?.description}</p>
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-700 dark:text-blue-300">
              <FiLock className="w-4 h-4 flex-shrink-0" />
              <span>You will be redirected to {paymentProvider === 'stripe' ? 'Stripe' : 'Paystack'} to complete payment</span>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button variant="ghost" onClick={() => setShowPayment(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubscribe} 
              loading={submitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <FiLock className="w-4 h-4 mr-2" />
              Proceed to Payment
            </Button>
          </div>
        </Modal>

      <Modal isOpen={showSuccess} onClose={() => setShowSuccess(false)} title="Subscription Active!" size="sm">
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <FiCheck className="w-10 h-10 text-green-600" />
            </div>
          </motion.div>
          
          <h3 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Welcome to DocShare Pro!
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Your subscription is now active. Let's get started!
          </p>
          
          <Button 
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
            <FiArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Modal>
    </div>
  );
}
