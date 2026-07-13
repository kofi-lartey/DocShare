import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiSend, FiClock, FiCheck, FiUser, FiMessageSquare, FiArrowLeft } from 'react-icons/fi';
import { Card, CardHeader, CardContent, CardFooter } from '../components/common/Card';
import BrandLogo from '../components/common/BrandLogo';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const contactMethods = [
  {
    icon: <FiMail className="w-6 h-6" />,
    title: 'Email Us',
    detail: 'kofilartey12@gmail.com',
    href: 'mailto:kofilartey12@gmail.com',
    color: 'from-blue-500 to-cyan-400'
  },
  {
    icon: <FiPhone className="w-6 h-6" />,
    title: 'Call Us',
    detail: '+233 531 147 95',
    href: 'tel:+23353114795',
    color: 'from-green-500 to-emerald-400'
  },
  {
    icon: <FiMapPin className="w-6 h-6" />,
    title: 'Visit Us',
    detail: 'Accra, Ghana',
    href: '#',
    color: 'from-purple-500 to-pink-400'
  },
  {
    icon: <FiClock className="w-6 h-6" />,
    title: 'Business Hours',
    detail: 'Mon - Fri: 8:00 AM - 6:00 PM GMT',
    href: '#',
    color: 'from-orange-500 to-red-400'
  }
];

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contact Us</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
            Have a question or feedback? We would love to hear from you. Fill out the form below and we will get back to you as soon as possible.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card variant="elevated" padding="lg">
              {!submitted ? (
                <form
                  action="https://formsubmit.co/kofilartey12@gmail.com"
                  method="POST"
                  onSubmit={() => setIsSubmitting(true)}
                  className="space-y-6"
                >
                  <input type="hidden" name="_subject" value="New Contact Form Submission - DocShare Pro" />
                  <input type="hidden" name="_captcha" value="false" />
                  <input type="text" name="_honey" style={{ display: 'none' }} />
                  <input type="hidden" name="_replyto" value="" />

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                          <FiUser className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          required
                          className="w-full pl-11 pr-4 py-3 bg-gray-50/80 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                          placeholder="Your full name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                          <FiMail className="w-5 h-5" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          required
                          className="w-full pl-11 pr-4 py-3 bg-gray-50/80 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                          <FiPhone className="w-5 h-5" />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          className="w-full pl-11 pr-4 py-3 bg-gray-50/80 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                          placeholder="+233 000 000 000"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                          <FiMessageSquare className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          name="subject"
                          required
                          className="w-full pl-11 pr-4 py-3 bg-gray-50/80 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                          placeholder="How can we help?"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-gray-50/80 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-900 dark:text-white placeholder:text-gray-400 resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <FiSend className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Thank you for reaching out. We have received your message and will get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:border-blue-600 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              )}
            </Card>
          </motion.div>

          {/* Contact Info Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <Card variant="elevated" padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Get in Touch</h3>
              <div className="space-y-4">
                {contactMethods.map((method, index) => (
                  <motion.a
                    key={index}
                    href={method.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all group"
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br ${method.color} rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                      {method.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{method.title}</p>
                      <p className="text-sm text-gray-900 dark:text-white font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {method.detail}
                      </p>
                    </div>
                  </motion.a>
                ))}
              </div>
            </Card>

            <Card variant="elevated" padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick Support</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                For urgent issues or account-related questions, please include your account email in your message for faster resolution.
              </p>
              <a
                href="https://wa.me/23353114795"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <FiPhone className="w-4 h-4" />
                WhatsApp Support
              </a>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
