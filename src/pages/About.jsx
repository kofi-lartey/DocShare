import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { FiTarget, FiHeart, FiZap, FiUsers, FiGlobe, FiArrowLeft,FiArrowRight, FiCheck } from 'react-icons/fi';
import BrandLogo from '../components/common/BrandLogo';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const timeline = [
  {
    year: '2023',
    title: 'The Beginning',
    description: 'DocShare Pro was founded with a simple mission: make document sharing instant, secure, and accessible to everyone.'
  },
  {
    year: '2024',
    title: 'Rapid Growth',
    description: 'Reached 50,000+ active users and processed over 2.5 million document shares. Expanded to teams in 30+ countries.'
  },
  {
    year: '2025',
    title: 'Enterprise Features',
    description: 'Launched enterprise-grade security, advanced analytics, and team collaboration features for businesses of all sizes.'
  },
  {
    year: '2026',
    title: 'AI-Powered Insights',
    description: 'Introduced AI-powered document insights and automated workflow integrations, setting new industry standards.'
  }
];

const values = [
  {
    icon: <FiTarget className="w-6 h-6" />,
    title: 'Mission',
    description: 'To empower teams and individuals to share knowledge seamlessly through innovative, secure, and user-friendly document sharing solutions.'
  },
  {
    icon: <FiHeart className="w-6 h-6" />,
    title: 'Vision',
    description: 'A world where information flows freely and securely, enabling collaboration across borders and breaking down barriers to knowledge sharing.'
  },
  {
    icon: <FiZap className="w-6 h-6" />,
    title: 'Innovation',
    description: 'We continuously push the boundaries of what is possible, leveraging cutting-edge technology to deliver the best user experience.'
  },
  {
    icon: <FiUsers className="w-6 h-6" />,
    title: 'Community',
    description: 'We believe in building strong relationships with our users and fostering a community of knowledge sharers and collaborators.'
  }
];

const teamStats = [
  { value: '50+', label: 'Team Members', icon: <FiUsers /> },
  { value: '30+', label: 'Countries', icon: <FiGlobe /> },
  { value: '50K+', label: 'Active Users', icon: <FiUsers /> },
  { value: '99.9%', label: 'Uptime SLA', icon: <FiCheck /> }
];

export default function About() {
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">About Us</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
            Learn about our journey, our mission, and the team behind DocShare Pro. We are passionate about making document sharing simple, secure, and accessible to everyone.
          </p>
        </motion.div>

        {/* Hero / Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <Card variant="primary" padding="lg">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
                DocShare Pro was built to solve a simple problem: sharing documents should be effortless. Whether you are a freelancer sending a proposal, a startup sharing pitch decks, or an enterprise distributing sensitive reports, we provide the tools to share instantly, track engagement, and keep your data secure.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {teamStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
              >
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center gap-2">
                  {stat.icon}
                  <span>{stat.value}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Our Journey</h2>
          <div className="space-y-6">
            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex gap-6"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0">
                    {item.year}
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="w-px h-full bg-gray-200 dark:bg-gray-700 mt-2" />
                  )}
                </div>
                <div className="pb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Our Values</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg mb-4">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card variant="primary" padding="lg">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Want to learn more?</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-xl mx-auto">
                We would love to hear from you. Whether you have a question about our features, pricing, or anything else, our team is ready to answer all your questions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300"
                >
                  Contact Us
                  <FiArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/careers"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:border-blue-600 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                >
                  Join Our Team
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
