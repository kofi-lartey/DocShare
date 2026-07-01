import { motion } from 'framer-motion';
import { Card } from '../components/common/Card';
import { FiFileText, FiAlertCircle, FiCheckCircle, FiXCircle, FiShield, FiMail, FiUser } from 'react-icons/fi';

export default function Terms() {
  const terms = [
    {
      icon: <FiCheckCircle className="w-6 h-6" />,
      title: 'Acceptance of Terms',
      content: 'By accessing or using DocShare Pro, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.'
    },
    {
      icon: <FiUser className="w-6 h-6" />,
      title: 'Account Responsibility',
      content: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use.'
    },
    {
      icon: <FiFileText className="w-6 h-6" />,
      title: 'Acceptable Use',
      content: 'You may not use our service for any unlawful purpose or to store, share, or distribute content that violates intellectual property rights, privacy laws, or contains malicious code.'
    },
    {
      icon: <FiShield className="w-6 h-6" />,
      title: 'Service Availability',
      content: 'We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. We may suspend or terminate service for maintenance, security, or other operational reasons with reasonable notice.'
    },
    {
      icon: <FiAlertCircle className="w-6 h-6" />,
      title: 'Limitation of Liability',
      content: 'DocShare Pro shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount paid by you in the past 12 months.'
    },
    {
      icon: <FiXCircle className="w-6 h-6" />,
      title: 'Termination',
      content: 'We may terminate or suspend your access to our services immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.'
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Last updated: June 30, 2026</p>
          </div>

          <Card className="mb-8">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Welcome to DocShare Pro. These Terms of Service govern your use of our document sharing platform. Please read these terms carefully before using our services.
            </p>
          </Card>

          <div className="space-y-6">
            {terms.map((term, index) => (
              <motion.div
                key={term.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
              >
                <Card>
                  <div className="flex items-start gap-4">
                    <div className="text-purple-600 dark:text-purple-400 mt-1">
                      {term.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{term.title}</h2>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{term.content}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              If you have questions about these Terms, please contact us at <a href="mailto:legal@docshare.pro" className="text-blue-600 dark:text-blue-400 hover:underline">legal@docshare.pro</a>.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
