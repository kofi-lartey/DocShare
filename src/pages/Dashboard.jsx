import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FiUpload, FiEye, FiHardDrive, FiLink, 
  FiTrendingUp, FiUsers, FiClock, FiFileText,
  FiArrowUp, FiArrowDown, FiMoreVertical,
  FiRefreshCw, FiActivity, FiBarChart2,
  FiDownload, FiShare2, FiStar, FiZap
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getStats, getRecentActivity, verifyPaystackPayment } from '../services/api';
import StatCard from '../components/dashboard/StatCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import QuickActions from '../components/dashboard/QuickActions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import ImageLoader from '../components/common/ImageLoader';
import { formatDate, formatFileSize } from '../utils/helpers';

// Enhanced Stat Card Component
const EnhancedStatCard = ({ title, value, subtitle, icon: Icon, color, trend, trendLabel }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    green: 'from-green-500 to-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    purple: 'from-purple-500 to-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    orange: 'from-orange-500 to-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    red: 'from-red-500 to-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    teal: 'from-teal-500 to-teal-600 bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative group"
    >
      <Card 
        variant="glass" 
        padding="md" 
        className={`border-2 ${colors[color] || colors.blue} hover:shadow-xl transition-all duration-300`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {trend > 0 ? (
                  <FiArrowUp className="w-3 h-3 text-green-500" />
                ) : (
                  <FiArrowDown className="w-3 h-3 text-red-500" />
                )}
                <span className={`text-xs font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(trend)}%
                </span>
                <span className="text-xs text-gray-400">{trendLabel || 'vs last month'}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color] || colors.blue} bg-opacity-10`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
        
        {/* Progress bar for storage */}
        {title === 'Storage Used' && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(parseFloat(value) / 10) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

// Recent Activity Item Component
const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch(type) {
      case 'upload': return <FiUpload className="text-blue-500" />;
      case 'view': return <FiEye className="text-green-500" />;
      case 'share': return <FiShare2 className="text-purple-500" />;
      case 'download': return <FiDownload className="text-orange-500" />;
      default: return <FiFileText className="text-gray-500" />;
    }
  };

  const getActivityColor = (type) => {
    switch(type) {
      case 'upload': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'view': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'share': return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      case 'download': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      default: return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      className={`flex items-center gap-4 p-4 rounded-xl border ${getActivityColor(activity.type)} transition-all duration-200`}
    >
      <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white truncate">
          {activity.description}
        </p>
        <p className="text-sm text-gray-500">
          {activity.fileName && (
            <span className="font-medium">{activity.fileName}</span>
          )}
          {activity.fileName && activity.user && ' • '}
          {activity.user && (
            <span>by {activity.user}</span>
          )}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-gray-400">{formatDate(activity.timestamp)}</span>
        {activity.status && (
          <Badge variant={activity.status === 'success' ? 'success' : 'warning'} size="sm">
            {activity.status}
          </Badge>
        )}
      </div>
    </motion.div>
  );
};

// Quick Action Button Component
const QuickActionButton = ({ icon: Icon, label, description, href, color, onClick }) => {
  const colors = {
    blue: 'hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    green: 'hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20',
    purple: 'hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20',
    orange: 'hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20',
    teal: 'hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20',
  };

  const content = (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 ${colors[color] || colors.blue} transition-all duration-300 cursor-pointer text-center`}
    >
      <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl mb-3">
        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>
      <h4 className="font-semibold text-gray-900 dark:text-white">{label}</h4>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </motion.div>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return <div onClick={onClick}>{content}</div>;
};

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');

  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    setLoading(true);
    setError(null);
    try {
      const [statsRes, activityRes] = await Promise.all([
        getStats(),
        getRecentActivity()
      ]);
      setStats(statsRes.data);
      setActivity(activityRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message);
      if (err.message?.includes('complete your subscription')) {
        navigate('/dashboard/subscription');
      }
    } finally {
      setLoading(false);
      if (showRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) return;
      try {
        const result = await verifyPaystackPayment(reference);
        if (result.success) {
          navigate('/dashboard/subscription', { replace: true });
        }
      } catch (err) {
        console.error('Payment verification failed:', err);
      }
    };

    verifyPayment();
  }, [reference, navigate]);

  const quickActions = [
    {
      icon: FiUpload,
      label: 'Upload Document',
      description: 'Share a new document',
      href: '/dashboard/upload',
      color: 'blue'
    },
    {
      icon: FiLink,
      label: 'Manage Links',
      description: 'View all your links',
      href: '/dashboard/my-uploads',
      color: 'purple'
    },
    {
      icon: FiUsers,
      label: 'Team Members',
      description: 'Manage your team',
      href: '/dashboard/settings',
      color: 'green'
    },
    {
      icon: FiBarChart2,
      label: 'Analytics',
      description: 'View detailed stats',
      href: '/dashboard/analytics',
      color: 'orange'
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <ImageLoader size="lg" />
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading your dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-sm text-red-500">{error || 'Failed to load dashboard data'}</p>
        <button
          onClick={() => fetchData(true)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome back! Here's what's happening with your documents
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            {['day', 'week', 'month'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  selectedPeriod === period 
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
          >
            <FiRefreshCw className={`w-5 h-5 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

{/* Stats Grid */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <EnhancedStatCard
           title="Total Uploads"
           value={stats.totalUploads}
           icon={FiUpload}
           color="blue"
           trend={stats.uploadsTrend}
           trendLabel="vs last month"
         />
         <EnhancedStatCard
           title="Total Views"
           value={stats.totalViews.toLocaleString()}
           icon={FiEye}
           color="green"
           trend={stats.viewsTrend}
           trendLabel="vs last month"
         />
         <EnhancedStatCard
           title="Storage Used"
           value={`${stats.storageUsed} GB`}
           subtitle={`of ${stats.storageLimit} GB`}
           icon={FiHardDrive}
           color="purple"
         />
         <EnhancedStatCard
           title="Active Links"
           value={stats.activeLinks}
           icon={FiLink}
           color="orange"
           trend={stats.linksTrend}
           trendLabel="vs last month"
         />
      </div>

      {/* Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card variant="glass" padding="md">
            <CardHeader
              title="Recent Activity"
              subtitle="Latest actions on your documents"
              action={
                <Link 
                  to="/dashboard/activity" 
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  View all
                  <FiArrowUp className="w-4 h-4 rotate-90" />
                </Link>
              }
              className="mb-4"
            />
            <CardContent>
              {activity && activity.length > 0 ? (
                <div className="space-y-3">
                  {activity.slice(0, 5).map((item, index) => (
                    <ActivityItem key={index} activity={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <FiActivity className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card variant="glass" padding="md">
            <CardHeader
              title="Quick Actions"
              subtitle="Common tasks"
              className="mb-4"
            />
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <QuickActionButton key={index} {...action} />
                ))}
              </div>
            </CardContent>
            <CardFooter align="center" className="border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FiZap className="w-3 h-3 text-yellow-500" />
                <span>Pro tip: Upload documents for instant sharing</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Additional Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass" padding="md" className="border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Documents Shared</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalUploads || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <FiShare2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>
        <Card variant="glass" padding="md" className="border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalViews || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <FiEye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
        <Card variant="glass" padding="md" className="border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Storage Used</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.storageUsed || 0} GB
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <FiHardDrive className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}