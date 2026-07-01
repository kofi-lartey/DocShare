import { motion } from 'framer-motion';
import { Card } from '../components/common/Card';
import { FiShield, FiLock, FiEye, FiDatabase, FiUser, FiMail } from 'react-icons/fi';

export default function Privacy() {
  const sections = [
    {
      icon: <FiDatabase className="w-6 h-6" />,
      title: 'Data Collection',
      content: 'We collect information you provide directly to us, such as when you create an account, upload documents, or contact us for support. This includes your name, email address, and any content you choose to store on our platform.'
    },
    {
      icon: <FiLock className="w-6 h-6" />,
      title: 'Data Security',
      content: 'We implement industry-standard security measures to protect your data. All documents are encrypted in transit using TLS and at rest using AES-256 encryption. Access to your documents is restricted to authenticated users only.'
    },
    {
      icon: <FiEye className="w-6 h-6" />,
      title: 'Data Usage',
      content: 'We use your data solely to provide and improve our services. We do not sell, rent, or share your personal information with third parties for marketing purposes. Your documents remain yours.'
    },
    {
      icon: <FiUser className="w-6 h-6" />,
      title: 'Your Rights',
      content: 'You have the right to access, update, or delete your personal data at any time. You can export your documents or request permanent deletion by contacting our support team.'
    },
    {
      icon: <FiMail className="w-6 h-6" />,
      title: 'Communications',
      content: 'We may send you service-related emails such as password resets and security alerts. You can opt out of promotional communications at any time using the unsubscribe link in our emails.'
    },
    {
      icon: <FiShield className="w-6 h-6" />,
      title: 'Cookies & Tracking',
      content: 'We use essential cookies to maintain your session and preferences. We do not use third-party tracking cookies for advertising. You can disable non-essential cookies in your browser settings.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Last updated: June 30, 2026</p>
          </div>

          <Card className="mb-8">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              At DocShare Pro, we take your privacy seriously. This policy outlines how we collect, use, and protect your personal information when you use our document sharing platform. We are committed to being transparent about our data practices.
            </p>
          </Card>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
              >
                <Card>
                  <div className="flex items-start gap-4">
                    <div className="text-blue-600 dark:text-blue-400 mt-1">
                      {section.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{section.title}</h2>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{section.content}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at <a href="mailto:privacy@docshare.pro" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@docshare.pro</a>.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
