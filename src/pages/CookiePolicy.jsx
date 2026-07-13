import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { FiBox, FiToggleLeft, FiToggleRight, FiInfo, FiBarChart2, FiMail, FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';
import BrandLogo from '../components/common/BrandLogo';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const cookieTypes = [
  {
    icon: <FiCheck className="w-5 h-5" />,
    title: 'Essential Cookies',
    description: 'Required for the website to function properly. These enable core functionality such as security, network management, and accessibility. You may disable these by changing your browser settings, but the site may not function correctly.',
    required: true
  },
  {
    icon: <FiBarChart2 className="w-5 h-5" />,
    title: 'Analytics Cookies',
    description: 'Help us understand how visitors interact with our website by collecting and reporting information anonymously. This data is used to improve our services and user experience.',
    required: false
  },
  {
    icon: <FiInfo className="w-5 h-5" />,
    title: 'Functional Cookies',
    description: 'Enable enhanced functionality and personalization, such as remembering your preferences and settings. If you do not allow these cookies, some services may not function properly.',
    required: false
  },
  {
    icon: <FiBox className="w-5 h-5" />,
    title: 'Marketing Cookies',
    description: 'Used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user. Currently, we do not use marketing cookies.',
    required: false
  }
];

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors mb-6">
            <FiArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <BrandLogo size="md" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cookie Policy</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Last updated: June 30, 2026</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-8">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              This Cookie Policy explains how DocShare Pro uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
            </p>
          </Card>

          <div className="space-y-6">
            {cookieTypes.map((cookie, index) => (
              <motion.div
                key={cookie.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
              >
                <Card>
                  <div className="flex items-start gap-4">
                    <div className="text-blue-600 dark:text-blue-400 mt-1">
                      {cookie.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{cookie.title}</h2>
                        {cookie.required && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{cookie.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8"
          >
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Managing Cookies</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                Most browsers allow you to refuse to accept cookies and to delete cookies. The methods for doing so vary from browser to browser. Please check your browser documentation for instructions on how to manage your cookie preferences.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FiToggleLeft className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900 dark:text-white">Accept All</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Enables all cookies for the best experience.</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FiToggleRight className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">Essential Only</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Only essential cookies will be used.</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8"
          >
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                If you have questions about our use of cookies, please contact us at{' '}
                <a href="mailto:kofilartey12@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">kofilartey12@gmail.com</a>
                {' '}or call <a href="tel:+23353114795" className="text-blue-600 dark:text-blue-400 hover:underline">+233 531 147 95</a>.
              </p>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
