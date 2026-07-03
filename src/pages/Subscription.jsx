import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiCheck, FiDownload, FiCreditCard, FiStar, 
  FiTrendingUp, FiUsers, FiDatabase, FiClock,
  FiShield, FiZap, FiArrowRight, FiInfo,
  FiCheckCircle, FiAlertCircle, FiX,
  FiLock, FiUnlock, FiRefreshCw, FiFile,
  FiImage, FiVideo, FiMusic, FiFileText
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getSubscription, createSubscription, getInvoices } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { PRICING_PLANS } from '../utils/constants';
import { cn, formatDate } from '../utils/helpers';
import Button from '../components/common/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { Spinner } from '../components/common/Spinner';

// Plan Feature Component
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

// Plan Card Component
const PlanCard = ({ plan, isCurrent, onSelect, isPopular }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getPlanIcon = () => {
    switch(plan.id) {
      case 'free':
        return <FiFile className="w-8 h-8 text-blue-400" />;
      case 'pro':
        return <FiZap className="w-8 h-8 text-purple-400" />;
      case 'express':
        return <FiStar className="w-8 h-8 text-yellow-400" />;
      default:
        return <FiFile className="w-8 h-8 text-gray-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative"
    >
      <Card 
        variant={isPopular ? 'primary' : 'glass'}
        padding="lg"
        className={cn(
          'h-full transition-all duration-300',
          isPopular && 'shadow-2xl shadow-blue-500/20 border-blue-500 dark:border-blue-400',
          isCurrent && 'border-green-500 dark:border-green-400'
        )}
      >
        {isPopular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge variant="primary" className="px-4 py-1.5 text-xs">
              <FiStar className="w-3 h-3 mr-1" />
              Most Popular
            </Badge>
          </div>
        )}

        {isCurrent && (
          <div className="absolute -top-3 right-4">
            <Badge variant="success" className="px-4 py-1.5 text-xs">
              <FiCheck className="w-3 h-3 mr-1" />
              Current Plan
            </Badge>
          </div>
        )}

        <div className="text-center">
          <div className="flex justify-center mb-3">
            <div className={cn(
              'p-3 rounded-2xl',
              plan.id === 'free' ? 'bg-blue-100 dark:bg-blue-900/30' :
              plan.id === 'pro' ? 'bg-purple-100 dark:bg-purple-900/30' :
              'bg-yellow-100 dark:bg-yellow-900/30'
            )}>
              {getPlanIcon()}
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {plan.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {plan.description}
          </p>
          <div className="mt-4 flex items-baseline justify-center">
            {plan.customPrice ? (
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">Custom</span>
            ) : (
                <>
                  <span className="text-5xl font-extrabold text-gray-900 dark:text-white">
                    GH₵{plan.price}
                  </span>
                  <span className="ml-1 text-gray-500">/{plan.interval}</span>
                </>
            )}
          </div>
          {plan.price > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              Billed {plan.interval === 'month' ? 'monthly' : 'annually'}
            </p>
          )}
        </div>

        <div className="mt-6 space-y-3">
          {plan.features.map((feature, idx) => (
            <PlanFeature key={idx} feature={feature} included={true} />
          ))}
        </div>

        <div className="mt-8">
          {isCurrent ? (
            <Button variant="outline" className="w-full" disabled>
              <FiCheck className="w-4 h-4 mr-2" />
              Current Plan
            </Button>
          ) : (
            <Button
              variant={isPopular ? 'primary' : 'outline'}
              className="w-full"
              onClick={() => onSelect(plan)}
            >
              {plan.price === 0 ? 'Downgrade to Free' : 'Upgrade Now'}
              {!isCurrent && <FiArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

// Invoice Item Component
const InvoiceItem = ({ invoice }) => (
  <motion.tr 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
  >
    <td className="py-3 px-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <FiDownload className="w-4 h-4 text-gray-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">#{invoice.id}</p>
          <p className="text-xs text-gray-500">{invoice.description || 'Subscription'}</p>
        </div>
      </div>
    </td>
    <td className="py-3 px-4 text-sm text-gray-500">{formatDate(invoice.date)}</td>
    <td className="py-3 px-4">
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        GH₵{invoice.amount === 0 ? '0.00' : invoice.amount.toFixed(2)}
      </span>
    </td>
    <td className="py-3 px-4">
      <Badge variant={invoice.status === 'paid' ? 'success' : 'warning'} size="sm">
        {invoice.status}
      </Badge>
    </td>
    <td className="py-3 px-4 text-right">
      <button className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
        <FiDownload className="w-4 h-4" />
        PDF
      </button>
    </td>
  </motion.tr>
);

export default function Subscription() {
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentProvider, setPaymentProvider] = useState('stripe');
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: notifyError } = useNotification();
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [subRes, invRes] = await Promise.all([
          getSubscription(),
          getInvoices()
        ]);
        
        if (!subRes.data || subRes.data.plan === undefined || subRes.data.status !== 'active') {
          navigate('/subscription-required');
          return;
        }
        
        setSubscription(subRes.data);
        setInvoices(invRes.data || []);
      } catch (err) {
        notifyError(err.message || 'Failed to load subscription data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [notifyError, navigate]);

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
        if (paymentProvider === 'paystack' && result.data?.payment?.authorizationUrl) {
          window.location.href = result.data.payment.authorizationUrl;
          return;
        }
      }
      
      if (result.data?.user) {
        if (result.data.user.token) {
          localStorage.setItem('docshare_token', result.data.user.token);
        }
        updateUser(result.data.user);
      }
      
      setSubscription(result.data);
      setShowSuccess(true);
      setShowPayment(false);
      success('Subscription created successfully! 🎉');
    } catch (err) {
      notifyError(err.message || 'Failed to create subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlanSelect = (plan) => {
    const tiers = { free: 0, pro: 1, express: 2 };
    const currentTier = tiers[currentPlan] || 0;
    const selectedTier = tiers[plan.id] || 0;

    if (selectedTier <= currentTier) {
      return;
    }

    setSelectedPlan(plan);
    setShowPayment(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading subscription details...</p>
      </div>
    );
  }

  const currentPlan = subscription?.plan || 'free';
  const currentPlanData = PRICING_PLANS.find(p => p.id === currentPlan);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upgrade Plan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You are currently on the {currentPlan === 'pro' ? 'Pro' : currentPlan === 'express' ? 'Express' : 'Free'} plan
          </p>
        </div>
        {subscription && (
          <div className="flex items-center gap-2">
            <Badge variant="success" className="px-4 py-2">
              <FiCheckCircle className="w-4 h-4 mr-1" />
              Active
            </Badge>
          </div>
        )}
      </div>

      {/* Current Plan Summary */}
      {subscription && currentPlanData && (
        <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="primary" className="px-3 py-1 text-xs uppercase tracking-wider">
                  Current Plan
                </Badge>
                {subscription.status === 'trialing' && (
                  <Badge variant="warning" className="px-3 py-1 text-xs">
                    Trial
                  </Badge>
                )}
              </div>
              <h2 className="mt-3 text-4xl font-extrabold text-gray-900 dark:text-white">
                {currentPlanData.name}
              </h2>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                 {currentPlanData.price === 0 ? 'Free' : `GH₵${currentPlanData.price}/${currentPlanData.interval}`}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {currentPlanData.description}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {subscription.usage?.uploads || 0}
                </p>
                <p className="text-sm text-gray-500">Uploads</p>
                <div className="mt-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div 
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${Math.min((subscription.usage?.uploads || 0) / (currentPlanData.maxUploads || 100) * 100, 100)}%` }}
                  />
                </div>
                {currentPlanData.maxUploads && (
                  <p className="text-xs text-gray-400 mt-1">
                    {subscription.usage?.uploads || 0} / {currentPlanData.maxUploads === Infinity ? '∞' : currentPlanData.maxUploads}
                  </p>
                )}
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {subscription.usage?.storage || 0} GB
                </p>
                <p className="text-sm text-gray-500">Storage</p>
                <div className="mt-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div 
                    className="h-full bg-purple-600 rounded-full"
                    style={{ width: `${Math.min((subscription.usage?.storage || 0) / (currentPlanData.maxStorage || 50) * 100, 100)}%` }}
                  />
                </div>
                {currentPlanData.maxStorage && (
                  <p className="text-xs text-gray-400 mt-1">
                    {subscription.usage?.storage || 0} / {currentPlanData.maxStorage === Infinity ? '∞' : `${currentPlanData.maxStorage} GB`}
                  </p>
                )}
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {currentPlanData.retentionDays === Infinity ? '∞' : `${currentPlanData.retentionDays} days`}
                </p>
                <p className="text-sm text-gray-500">Data Retention</p>
                <div className="mt-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div 
                    className="h-full bg-green-600 rounded-full"
                    style={{ width: `${Math.min((currentPlanData.retentionDays || 7) / 90 * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {currentPlanData.retentionDays === Infinity ? 'Forever' : `Auto-clean after ${currentPlanData.retentionDays} days`}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FiClock className="w-4 h-4" />
              {subscription.nextBillingDate ? (
                `Next billing date: ${formatDate(subscription.nextBillingDate)}`
              ) : (
                'No upcoming billing'
              )}
            </div>
            {subscription.cancelAtPeriodEnd && (
              <div className="flex items-center gap-2 text-sm text-yellow-600">
                <FiAlertCircle className="w-4 h-4" />
                Cancels at period end
              </div>
            )}
            {currentPlanData.retentionDays && currentPlanData.retentionDays !== Infinity && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <FiInfo className="w-4 h-4" />
                Documents auto-clean after {currentPlanData.retentionDays} days
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Plans Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Upgrade Plan
            </h2>
            <p className="text-sm text-gray-500">
              Get more features, storage, and team members
            </p>
          </div>
          <Badge variant="info" className="px-3 py-1 text-xs">
            <FiShield className="w-3 h-3 mr-1" />
            Secure payments
          </Badge>
        </div>

        {(() => {
          const tiers = { free: 0, pro: 1, express: 2 };
          const currentTier = tiers[currentPlan] || 0;
          const upgradePlans = PRICING_PLANS.filter(p => (tiers[p.id] || 0) > currentTier);

          if (upgradePlans.length === 0) {
            return (
              <Card variant="glass" padding="lg" className="text-center">
                <div className="py-12">
                  <div className="w-16 h-16 mx-auto bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
                    <FiStar className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    You are on the best plan
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    You already have the Express plan with all features, unlimited storage, and forever data retention. 
                    No upgrades are currently available.
                  </p>
                </div>
              </Card>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upgradePlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isCurrent={currentPlan === plan.id}
                  isPopular={plan.popular}
                  onSelect={handlePlanSelect}
                />
              ))}
            </div>
          );
        })()}
      </div>

      {/* Invoice History */}
      {invoices.length > 0 && (
        <Card variant="glass" padding="lg">
          <CardHeader
            icon={<FiDownload className="w-5 h-5 text-blue-600" />}
            title="Invoice History"
            subtitle="View and download your past invoices"
            action={
              <Button size="sm" variant="outline" className="flex items-center gap-1">
                <FiRefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            }
            className="mb-4"
          />
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {invoices.map((invoice) => (
                    <InvoiceItem key={invoice.id} invoice={invoice} />
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter align="center" className="border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
            <p className="text-xs text-gray-500">
              Showing {invoices.length} invoice{invoices.length > 1 ? 's' : ''}
            </p>
          </CardFooter>
        </Card>
      )}

      {/* Payment Modal */}
      <Modal 
        isOpen={showPayment} 
        onClose={() => setShowPayment(false)} 
        title="Complete Subscription"
        size="md"
      >
        <div className="space-y-6">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Selected Plan</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedPlan?.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500">Price</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedPlan?.price === 0 ? 'Free' : `GH₵${selectedPlan?.price}/${selectedPlan?.interval}`}
                </p>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-500">
              <p>• {selectedPlan?.maxUploads === Infinity ? 'Unlimited' : `${selectedPlan?.maxUploads} max`} uploads</p>
              <p>• {selectedPlan?.retentionDays === Infinity ? 'Forever' : `${selectedPlan?.retentionDays} days`} data retention</p>
              <p>• Supports {selectedPlan?.allowedFormats?.join(', ') || 'all formats'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentProvider('stripe')}
                  className={cn(
                    'p-3 border rounded-xl flex items-center justify-center gap-2 transition-all',
                    paymentProvider === 'stripe'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                >
                  <span className="font-semibold text-blue-600">Stripe</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentProvider('paystack')}
                  className={cn(
                    'p-3 border rounded-xl flex items-center justify-center gap-2 transition-all',
                    paymentProvider === 'paystack'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                >
                  <span className="font-semibold text-green-600">Paystack</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-700 dark:text-blue-300">
              <FiLock className="w-4 h-4 flex-shrink-0" />
              <span>You'll be redirected to {paymentProvider === 'stripe' ? 'Stripe' : 'Paystack'} to complete payment</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="ghost" 
            onClick={() => setShowPayment(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubscribe} 
            loading={submitting}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <FiLock className="w-4 h-4 mr-2" />
            Proceed to Payment
          </Button>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal 
        isOpen={showSuccess} 
        onClose={() => setShowSuccess(false)} 
        title="Payment Successful!"
        size="sm"
      >
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
            Subscription Active! 🎉
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Your {selectedPlan?.name} plan is now active.
            {selectedPlan?.id === 'pro' && ' Enjoy premium features!'}
            {selectedPlan?.id === 'express' && ' Unlimited uploads with forever data retention!'}
          </p>
          
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-left">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Plan</span>
              <span className="font-medium text-gray-900 dark:text-white">{selectedPlan?.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-500">Status</span>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-500">Data Retention</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedPlan?.retentionDays === Infinity ? 'Forever' : `${selectedPlan?.retentionDays} days`}
              </span>
            </div>
          </div>

          <Button 
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={() => setShowSuccess(false)}
          >
            Go to Dashboard
            <FiArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Modal>
    </div>
  );
}