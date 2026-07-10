import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  FiUser, FiLock, FiBell, FiMoon, FiGlobe, FiKey, 
  FiUpload, FiSave, FiShield, FiCheck, FiX, FiCopy,
  FiAlertCircle, FiCheckCircle, FiClock, FiTrendingUp,
  FiCpu, FiDatabase, FiServer, FiMail, FiSmartphone,
  FiEdit2, FiSettings, FiTool, FiZap, FiEye, FiEyeOff, FiTrash2
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { updateProfile, changePassword, updatePreferences, getNotifications, updateConsent, exportUserData, deleteUserData } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

// Tab configuration
const tabs = [
  { id: 'Profile', icon: FiUser, label: 'Profile' },
  { id: 'Security', icon: FiLock, label: 'Security' },
  { id: 'Notifications', icon: FiBell, label: 'Notifications' },
  { id: 'Preferences', icon: FiSettings, label: 'Preferences' },
  { id: 'API Access', icon: FiKey, label: 'API Access' },
  { id: 'Privacy', icon: FiShield, label: 'Privacy' },
];

// Validation Schemas
const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatar: z.any().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function Settings() {
  const [activeTab, setActiveTab] = useState('Profile');
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { success, error } = useNotification();
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [apiKeyRevealed, setApiKeyRevealed] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [apiUsage, setApiUsage] = useState(null);

  // Profile form
  const { register: registerProfile, handleSubmit: handleProfile, formState: { errors: profileErrors }, setValue } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      bio: user?.bio || '',
    }
  });

  // Password form
  const { register: registerPassword, handleSubmit: handlePasswordChange, formState: { errors: passErrors }, reset } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  useEffect(() => {
    const fetchApiUsage = async () => {
      try {
        const result = await getNotifications();
        setApiUsage(result.data);
      } catch (err) {
        console.error('Failed to fetch API usage:', err);
      }
    };
    if (activeTab === 'API Access') {
      fetchApiUsage();
    }
  }, [activeTab]);

  const onProfileSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await updateProfile(data);
      updateUser(res.data);
      success('Profile updated successfully!');
    } catch (err) {
      error(err.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  const onPasswordSubmit = async (data) => {
    setSaving(true);
    try {
      await changePassword(data);
      success('Password changed successfully!');
      reset();
    } catch (err) {
      error(err.message || 'Failed to change password');
    }
    setSaving(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
        setValue('avatar', file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyApiKey = () => {
    if (user?.apiKey) {
      navigator.clipboard.writeText(user.apiKey);
      success('API key copied to clipboard!');
    }
  };

  const TabButton = ({ id, icon: Icon, label }) => (
    <motion.button
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
        activeTab === id 
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
      {activeTab === id && (
        <motion.div
          layoutId="activeTab"
          className="ml-auto w-1.5 h-1.5 bg-white rounded-full"
        />
      )}
    </motion.button>
  );

  const notificationSettings = [
    { key: 'emailNotifications', label: 'Email notifications', description: 'Receive email updates about your documents', icon: FiMail },
    { key: 'uploadSuccess', label: 'Upload success alerts', description: 'Get notified when uploads complete', icon: FiCheckCircle },
    { key: 'shareNotifications', label: 'Share notifications', description: 'Alerts when documents are shared', icon: FiUpload },
    { key: 'monthlyReports', label: 'Monthly reports', description: 'Receive monthly usage reports', icon: FiTrendingUp },
    { key: 'viewNotifications', label: 'View notifications', description: 'Get notified when documents are viewed', icon: FiEye },
    { key: 'securityAlerts', label: 'Security alerts', description: 'Important security notifications', icon: FiShield },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card variant="glass" padding="sm" className="h-fit sticky top-24">
          <div className="space-y-1">
            {tabs.map(tab => (
              <TabButton key={tab.id} {...tab} />
            ))}
          </div>
        </Card>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'Profile' && (
                <Card variant="glass" padding="lg">
                  <CardHeader
                    icon={<FiUser className="w-6 h-6 text-blue-600" />}
                    title="Profile Settings"
                    subtitle="Update your personal information"
                    className="mb-6"
                  />
                  <CardContent>
                    <div className="flex items-center gap-6 mb-8">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                          <img 
                            src={avatarPreview || user?.avatar || `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&size=128`} 
                            alt={user?.fullName} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <label className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                          <FiUpload className="w-3.5 h-3.5 text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                          />
                        </label>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {user?.fullName}
                        </h3>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>

                    <form onSubmit={handleProfile(onProfileSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Full Name
                          </label>
                          <Input
                            {...registerProfile('fullName')}
                            error={profileErrors.fullName?.message}
                            placeholder="John Doe"
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Email Address
                          </label>
                          <Input
                            type="email"
                            {...registerProfile('email')}
                            error={profileErrors.email?.message}
                            placeholder="john@example.com"
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          Bio
                        </label>
                        <textarea
                          {...registerProfile('bio')}
                          rows={4}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none"
                          placeholder="Tell us a little about yourself..."
                        />
                        {profileErrors.bio && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.bio.message}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        loading={saving}
                        className="flex items-center gap-2"
                      >
                        <FiSave className="w-4 h-4" />
                        Save Changes
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'Security' && (
                <Card variant="glass" padding="lg">
                  <CardHeader
                    icon={<FiLock className="w-6 h-6 text-purple-600" />}
                    title="Security Settings"
                    subtitle="Manage your password and security preferences"
                    className="mb-6"
                  />
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                          Change Password
                        </h4>
                        <form onSubmit={handlePasswordChange(onPasswordSubmit)} className="space-y-4 max-w-md">
                          <Input
                            label="Current Password"
                            type={showPassword ? 'text' : 'password'}
                            {...registerPassword('currentPassword')}
                            error={passErrors.currentPassword?.message}
                            className="w-full"
                          />
                          <Input
                            label="New Password"
                            type={showPassword ? 'text' : 'password'}
                            {...registerPassword('newPassword')}
                            error={passErrors.newPassword?.message}
                            className="w-full"
                          />
                          <Input
                            label="Confirm Password"
                            type={showPassword ? 'text' : 'password'}
                            {...registerPassword('confirmPassword')}
                            error={passErrors.confirmPassword?.message}
                            className="w-full"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-sm text-blue-600 hover:text-blue-700"
                            >
                              {showPassword ? 'Hide passwords' : 'Show passwords'}
                            </button>
                          </div>
                          <Button
                            type="submit"
                            loading={saving}
                            className="flex items-center gap-2"
                          >
                            <FiShield className="w-4 h-4" />
                            Update Password
                          </Button>
                        </form>
                      </div>

                      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              Two-Factor Authentication
                            </h4>
                            <p className="text-sm text-gray-500">
                              Add an extra layer of security to your account
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Enable 2FA
                          </Button>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              Active Sessions
                            </h4>
                            <p className="text-sm text-gray-500">
                              Sessions data should be fetched from the backend API
                            </p>
                          </div>
                          <Button variant="danger" size="sm">
                            Sign Out All
                          </Button>
                        </div>
                        <div className="mt-3 space-y-2">
                          {sessions.length > 0 ? (
                            sessions.map((session, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {session.device}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {session.location} • {session.lastActive}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No active sessions found</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'Notifications' && (
                <Card variant="glass" padding="lg">
                  <CardHeader
                    icon={<FiBell className="w-6 h-6 text-orange-600" />}
                    title="Notification Preferences"
                    subtitle="Choose what notifications you want to receive"
                    className="mb-6"
                  />
                  <CardContent>
                    <div className="space-y-4">
                      {notificationSettings.map((setting) => (
                        <motion.div
                          key={setting.key}
                          whileHover={{ x: 4 }}
                          className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-white dark:bg-gray-700 rounded-lg">
                              <setting.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {setting.label}
                              </p>
                              <p className="text-sm text-gray-500">
                                {setting.description}
                              </p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              defaultChecked={user?.notifications?.[setting.key] ?? true}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </motion.div>
                      ))}

                      <Button
                        onClick={() => success('Notification preferences saved!')}
                        className="flex items-center gap-2"
                      >
                        <FiSave className="w-4 h-4" />
                        Save Preferences
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'Preferences' && (
                <Card variant="glass" padding="lg">
                  <CardHeader
                    icon={<FiSettings className="w-6 h-6 text-green-600" />}
                    title="Preferences"
                    subtitle="Customize your app experience"
                    className="mb-6"
                  />
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white dark:bg-gray-700 rounded-lg">
                            <FiMoon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                            <p className="text-sm text-gray-500">Toggle between light and dark theme</p>
                          </div>
                        </div>
                        <button
                          onClick={toggleTheme}
                          className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          {theme === 'dark' ? 'Light' : 'Dark'}
                        </button>
                      </div>

                      <Button
                        onClick={() => success('Preferences saved!')}
                        className="flex items-center gap-2"
                      >
                        <FiSave className="w-4 h-4" />
                        Save Preferences
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'Privacy' && (
                <PrivacyTab
                  user={user}
                  success={success}
                  error={error}
                  updateUser={updateUser}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const PRIVACY_CONSENT_VERSION = '1.0';

function PrivacyTab({ user, success, error, updateUser }) {
  const consent = user?.privacyConsent || {};
  const [analytics, setAnalytics] = useState(consent.analytics ?? false);
  const [geoTracking, setGeoTracking] = useState(consent.geoTracking ?? false);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);

  const saveConsent = async () => {
    setSaving(true);
    try {
      const res = await updateConsent({
        analytics,
        geoTracking,
        consentVersion: PRIVACY_CONSENT_VERSION
      });
      updateUser({ ...user, privacyConsent: res.data });
      success('Privacy preferences saved');
    } catch (err) {
      error(err.message || 'Failed to save consent');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setBusy(true);
    try {
      const res = await exportUserData();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'docshare-data-export.json';
      a.click();
      URL.revokeObjectURL(url);
      success('Data exported');
    } catch (err) {
      error(err.message || 'Export failed');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('This permanently deletes your download analytics data. Continue?')) return;
    setBusy(true);
    try {
      await deleteUserData();
      success('Your analytics data was deleted');
    } catch (err) {
      error(err.message || 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  const consentSettings = [
    {
      key: 'analytics',
      label: 'Download analytics',
      description: 'Record anonymous download events (hashed IP only) to show you usage analytics.',
      value: analytics,
      set: setAnalytics
    },
    {
      key: 'geoTracking',
      label: 'Geographic insights',
      description: 'Enrich download analytics with approximate country/region from your IP. Requires analytics to be on.',
      value: geoTracking,
      set: setGeoTracking,
      disabled: !analytics
    }
  ];

  return (
    <Card variant="glass" padding="lg">
      <CardHeader
        icon={<FiShield className="w-6 h-6 text-indigo-600" />}
        title="Privacy & Data"
        subtitle="Control how your data is collected and used"
        className="mb-6"
      />
      <CardContent>
        <div className="space-y-4">
          {consentSettings.map((setting) => (
            <div
              key={setting.key}
              className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white dark:bg-gray-700 rounded-lg">
                  <FiShield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{setting.label}</p>
                  <p className="text-sm text-gray-500">{setting.description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={setting.value}
                  disabled={setting.disabled}
                  onChange={(e) => setting.set(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 disabled:opacity-50"></div>
              </label>
            </div>
          ))}

          <p className="text-xs text-gray-500">
            We store only a salted hash of IP addresses and never raw addresses. You can withdraw consent or delete your data at any time.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button onClick={saveConsent} loading={saving} className="flex items-center gap-2">
              <FiSave className="w-4 h-4" />
              Save Privacy Settings
            </Button>
            <Button variant="outline" onClick={handleExport} loading={busy} className="flex items-center gap-2">
              <FiDownload className="w-4 h-4" />
              Export My Data
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={busy} className="flex items-center gap-2">
              <FiTrash2 className="w-4 h-4" />
              Delete Analytics Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}