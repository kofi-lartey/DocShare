import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiMenu, FiX, FiArrowRight, FiCheck, FiStar, FiUpload, 
  FiShare2, FiLock, FiBarChart2, FiGithub,
  FiTwitter, FiLinkedin, FiYoutube, FiPlay, FiChevronRight,
  FiRefreshCw, FiUsers, FiFileText, FiClock, FiTrendingUp,
  FiCamera, FiVideo, FiImage, FiPlayCircle, FiPauseCircle
} from 'react-icons/fi';
import { RiQrCodeLine } from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { PRICING_PLANS } from '../utils/constants';

// Hero Image Placeholder - Replace with actual images
const heroImage = 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=600&fit=crop';
const featureImages = {
  upload: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=300&fit=crop',
  qr: 'https://images.unsplash.com/photo-1598351451059-3d1be1b8493a?w=400&h=300&fit=crop',
  security: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
  analytics: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
};
const testimonialAvatars = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
];

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const heroRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    document.title = 'DocShare Pro - Share Documents Instantly';
  }, []);

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
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

  const features = [
    {
      icon: <FiUpload className="w-6 h-6" />,
      title: "Instant File Sharing",
      description: "Upload and share files in seconds with secure, tamper-proof links.",
      color: "from-blue-500 to-cyan-400",
      stats: "2.5M+ files shared",
      image: featureImages.upload,
    },
    {
      icon: <RiQrCodeLine className="w-6 h-6" />,
      title: "QR Code Generation",
      description: "Generate beautiful QR codes for instant mobile access to your documents.",
      color: "from-purple-500 to-pink-500",
      stats: "500K+ QR codes",
      image: featureImages.qr,
    },
    {
      icon: <FiLock className="w-6 h-6" />,
      title: "Enterprise Security",
      description: "Password protect, set expiration dates, and control document access.",
      color: "from-green-500 to-emerald-400",
      stats: "99.9% uptime",
      image: featureImages.security,
    },
    {
      icon: <FiBarChart2 className="w-6 h-6" />,
      title: "Analytics & Insights",
      description: "Track views, downloads, and engagement with detailed analytics dashboard.",
      color: "from-orange-500 to-red-400",
      stats: "1.2M+ views tracked",
      image: featureImages.analytics,
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Manager, TechCorp",
      content: "DocShare Pro has completely transformed how our team shares documents. The QR codes and analytics are absolute game-changers!",
      rating: 5,
      avatar: testimonialAvatars[0],
      color: "from-blue-400 to-blue-600"
    },
    {
      name: "Michael Chen",
      role: "Freelance Designer",
      content: "The best document sharing platform I've ever used. Clean interface, lightning-fast uploads, and the analytics help me understand engagement.",
      rating: 5,
      avatar: testimonialAvatars[1],
      color: "from-purple-400 to-purple-600"
    },
    {
      name: "Emily Davis",
      role: "Startup Founder",
      content: "Finally a platform that combines beautiful design with powerful features. My clients absolutely love the QR code sharing feature!",
      rating: 5,
      avatar: testimonialAvatars[2],
      color: "from-green-400 to-green-600"
    }
  ];

  const stats = [
    { value: "2.5M+", label: "Files Shared", icon: <FiFileText /> },
    { value: "50K+", label: "Active Users", icon: <FiUsers /> },
    { value: "99.9%", label: "Uptime", icon: <FiRefreshCw /> },
    { value: "1.2M+", label: "Views Tracked", icon: <FiTrendingUp /> }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                  <span className="text-white font-bold text-sm">DS</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
              </div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DocShare Pro
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              {['Features', 'Pricing', 'Testimonials'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`} 
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link to="/dashboard" className="flex items-center gap-2 group">
                  <div className="relative">
                    <img 
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}`} 
                      alt={user?.fullName} 
                      className="w-9 h-9 rounded-full ring-2 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {user?.fullName?.split(' ')[0]}
                  </span>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                    Log in
                  </Link>
                  <Link to="/register" className="relative group overflow-hidden px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                    <span className="relative z-10 flex items-center gap-2">
                      Get Started Free
                      <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                </>
              )}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>
        
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
            >
              <div className="px-4 py-4 space-y-2">
                {['Features', 'Pricing', 'Testimonials'].map((item) => (
                  <a 
                    key={item}
                    href={`#${item.toLowerCase()}`} 
                    className="block px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section with Video */}
      <section ref={heroRef} className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                🚀 New: AI-powered document insights
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                Share Documents
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Instantly & Securely
                </span>
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed">
                Upload, share, and track your documents with beautiful QR codes, 
                enterprise-grade security, and powerful analytics.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="mt-8 flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="relative group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 text-lg">
                    <span className="relative z-10 flex items-center gap-2">
                      Go to Dashboard
                      <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="relative group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 text-lg">
                      <span className="relative z-10 flex items-center gap-2">
                        Start Free Trial
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Link>
                    <Link to="/login" className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl hover:border-blue-600 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 text-lg">
                      Log in
                    </Link>
                  </>
                )}
              </motion.div>
              
              <motion.div variants={fadeInUp} className="mt-6 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-xs font-medium text-gray-700">
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-blue-600 flex items-center justify-center text-xs font-medium text-white">
                    +2K
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Trusted by 50,000+</p>
                  <p className="text-xs text-gray-500">Teams worldwide</p>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Hero Image/Video */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative"
            >
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-4 border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Video Thumbnail with Play Button */}
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900/20 to-purple-900/20">
                  <img 
                    src={heroImage} 
                    alt="DocShare Pro Preview" 
                    className="w-full h-auto object-cover"
                  />
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group cursor-pointer">
                    <div 
                      className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300"
                      onClick={toggleVideo}
                    >
                      {isVideoPlaying ? (
                        <FiPauseCircle className="w-12 h-12 text-blue-600" />
                      ) : (
                        <FiPlayCircle className="w-12 h-12 text-blue-600 ml-1" />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Document Sharing Demo</p>
                    <p className="text-xs text-gray-500">Watch how it works</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600">
                      <RiQrCodeLine className="w-4 h-4" />
                    </div>
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600">
                      <FiShare2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">
                    <FiCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">1,283 views</p>
                    <p className="text-xs text-gray-500">Last 30 days</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 text-3xl font-extrabold text-gray-900 dark:text-white">
                  {stat.icon}
                  <span>{stat.value}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with Images */}
      <section id="features" className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium mb-4">
              Features
            </span>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Everything you need to share documents
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful features to make document sharing effortless, secure, and insightful
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2 p-8">
                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">{feature.description}</p>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-medium text-gray-500">{feature.stats}</p>
                    </div>
                  </div>
                  <div className="md:w-1/2 min-h-[200px] overflow-hidden">
                    <img 
                      src={feature.image} 
                      alt={feature.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-medium mb-4">
              Pricing
            </span>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Choose your perfect plan
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Start free, upgrade when you need more
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PRICING_PLANS.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className={`relative bg-white dark:bg-gray-800 rounded-3xl border-2 p-8 ${
                  plan.popular 
                    ? 'border-blue-500 dark:border-blue-400 shadow-2xl shadow-blue-500/20 scale-105' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-full shadow-lg shadow-blue-500/25">
                      <FiStar className="w-4 h-4" />
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline justify-center">
                     <span className="text-5xl font-extrabold text-gray-900 dark:text-white">GH₵{plan.price}</span>
                    <span className="text-gray-500 ml-2">/{plan.interval}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
                </div>
                
                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FiCheck className="w-3 h-3 text-green-600" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link 
                  to={isAuthenticated ? "/dashboard/subscription" : "/register"} 
                  className={`block w-full mt-8 py-4 text-center font-semibold rounded-2xl transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl hover:shadow-blue-500/25' 
                      : 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-600 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {plan.price === 0 ? 'Get Started Free' : 'Start Free Trial'}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section with Images */}
      <section id="testimonials" className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 rounded-full text-sm font-medium mb-4">
              Testimonials
            </span>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
              Loved by thousands of users
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              See what our community has to say about DocShare Pro
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="bg-gray-50 dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5"
              >
                <div className="flex gap-1 text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">"{testimonial.content}"</p>
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-gray-200 dark:ring-gray-600"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Image Background */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=600&fit=crop" 
            alt="Team collaboration" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/90"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to transform how you share documents?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join thousands of teams already using DocShare Pro to share documents instantly and securely.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Get Started Free
                <FiArrowRight className="ml-2" />
              </Link>
              <Link to="#" className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/50 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all duration-300">
                <FiPlay className="mr-2" />
                Watch Demo
              </Link>
            </div>
            <p className="mt-6 text-sm text-white/70">No credit card required • Free forever plan available</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DS</span>
                </div>
                <span className="text-lg font-bold">DocShare Pro</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Share documents instantly with smart links. Built for teams that value simplicity, security, and speed.
              </p>
              <div className="flex gap-4 mt-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors"><FiGithub className="w-5 h-5" /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors"><FiTwitter className="w-5 h-5" /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors"><FiLinkedin className="w-5 h-5" /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors"><FiYoutube className="w-5 h-5" /></a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Product</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Company</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} DocShare Pro. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link to="/privacy" className="hover:text-gray-400 transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
              <a href="#" className="hover:text-gray-400 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}