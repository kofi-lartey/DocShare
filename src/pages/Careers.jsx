import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { FiBriefcase, FiMapPin, FiClock, FiDollarSign, FiUsers, FiArrowRight, FiCheck, FiArrowLeft, FiMail } from 'react-icons/fi';
import BrandLogo from '../components/common/BrandLogo';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const benefits = [
  {
    icon: <FiDollarSign className="w-5 h-5" />,
    title: 'Competitive Compensation',
    description: 'We offer industry-leading salaries, performance bonuses, and equity options for all full-time employees.'
  },
  {
    icon: <FiClock className="w-5 h-5" />,
    title: 'Flexible Work Hours',
    description: 'Work when you are most productive. We offer flexible scheduling and generous PTO to help you maintain work-life balance.'
  },
  {
    icon: <FiUsers className="w-5 h-5" />,
    title: 'Remote-First Culture',
    description: 'Work from anywhere in the world. Our distributed team collaborates across time zones using modern async communication tools.'
  },
  {
    icon: <FiBriefcase className="w-5 h-5" />,
    title: 'Growth & Development',
    description: 'We invest in your professional growth with learning budgets, conference sponsorships, and mentorship programs.'
  }
];

const openings = [
  {
    title: 'Senior Frontend Engineer',
    location: 'Remote / Accra, Ghana',
    type: 'Full-time',
    department: 'Engineering'
  },
  {
    title: 'Backend Developer',
    location: 'Remote / Accra, Ghana',
    type: 'Full-time',
    department: 'Engineering'
  },
  {
    title: 'Product Designer',
    location: 'Remote / Accra, Ghana',
    type: 'Full-time',
    department: 'Design'
  },
  {
    title: 'Marketing Manager',
    location: 'Remote / Accra, Ghana',
    type: 'Full-time',
    department: 'Marketing'
  }
];

export default function Careers() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Careers</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
            Join our team and help us build the future of document sharing. We are looking for passionate individuals who want to make an impact.
          </p>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Why Work With Us</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Open Positions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Open Positions</h2>
          <div className="space-y-4">
            {openings.map((job, index) => (
              <motion.div
                key={job.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                        <FiMapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                        <FiBriefcase className="w-4 h-4" />
                        {job.type}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
                        {job.department}
                      </span>
                    </div>
                  </div>
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all group-hover:translate-x-1">
                    Apply Now
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12"
        >
          <Card variant="primary" padding="lg">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Do not see the right fit?</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-xl mx-auto">
                We are always looking for talented individuals to join our team. Send us your resume and we will reach out when a matching opportunity arises.
              </p>
              <a
                href="mailto:kofilartey12@gmail.com?subject=General Application - DocShare Pro Careers&body=Hi,%0A%0AI am interested in joining the DocShare Pro team. Please find my resume attached.%0A%0ABest regards"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300"
              >
                <FiMail className="w-4 h-4" />
                Send General Application
              </a>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
