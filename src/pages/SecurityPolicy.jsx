import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { FiShield, FiLock, FiEye, FiDatabase, FiServer, FiCheckCircle, FiAlertTriangle, FiArrowLeft, FiMail, FiPhone } from 'react-icons/fi';
import BrandLogo from '../components/common/BrandLogo';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const securitySections = [
  {
    icon: <FiLock className="w-6 h-6" />,
    title: 'Data Encryption',
    content: 'All data transmitted between your device and our servers is protected using TLS 1.3 encryption. Data at rest is encrypted using AES-256, ensuring your documents remain secure even in the unlikely event of a data breach.'
  },
  {
    icon: <FiShield className="w-6 h-6" />,
    title: 'Access Controls',
    content: 'We implement role-based access control (RBAC) and enforce the principle of least privilege. Only authorized personnel have access to production systems, and all access is logged and monitored continuously.'
  },
  {
    icon: <FiServer className="w-6 h-6" />,
    title: 'Infrastructure Security',
    content: 'Our infrastructure is hosted on secure, SOC 2 compliant cloud platforms. We implement network segmentation, DDoS protection, Web Application Firewalls (WAF), and regular vulnerability scanning to protect against threats.'
  },
  {
    icon: <FiEye className="w-6 h-6" />,
    title: 'Monitoring & Auditing',
    content: 'We maintain comprehensive audit logs of all system activities. Security events are monitored in real-time using automated tools, with 24/7 on-call coverage for incident response.'
  },
  {
    icon: <FiDatabase className="w-6 h-6" />,
    title: 'Data Backup & Recovery',
    content: 'We perform automated daily backups with point-in-time recovery capabilities. Our disaster recovery plan ensures business continuity with an RPO of 1 hour and an RTO of 4 hours.'
  },
  {
    icon: <FiCheckCircle className="w-6 h-6" />,
    title: 'Compliance & Certifications',
    content: 'DocShare Pro adheres to GDPR, CCPA, and other relevant data protection regulations. We undergo regular third-party security audits and penetration testing to maintain the highest security standards.'
  },
  {
    icon: <FiAlertTriangle className="w-6 h-6" />,
    title: 'Incident Response',
    content: 'We have a formal incident response plan in place. In the event of a security incident affecting your data, we will notify you within 72 hours and provide details about the nature of the breach and remediation steps.'
  }
];

export default function SecurityPolicy() {
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Security Policy</h1>
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
              At DocShare Pro, security is our top priority. This policy outlines our commitment to protecting your data and the measures we implement to ensure the confidentiality, integrity, and availability of our services.
            </p>
          </Card>

          <div className="space-y-6">
            {securitySections.map((section, index) => (
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8"
          >
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Report a Security Issue</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                If you discover a security vulnerability or have concerns about the security of our platform, please report it to us immediately. We take all security reports seriously and will respond promptly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:kofilartey12@gmail.com"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                  <FiMail className="w-4 h-4" />
                  Report via Email
                </a>
                <a
                  href="tel:+23353114795"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:border-blue-600 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                >
                  <FiPhone className="w-4 h-4" />
                  Call Support
                </a>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
