import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiShield, 
  FiLock, 
  FiUpload, 
  FiShare2, 
  FiEye, 
  FiDownload,
  FiTrendingUp,
  FiUsers,
  FiAward
} from 'react-icons/fi';
import { FaCloudUploadAlt, FaRegCopy, FaQrcode } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';

const LandingPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: <FiShield className="w-8 h-8 text-primary-600" />,
      title: "Bank-Level Security",
      description: "Your documents are encrypted with AES-256 encryption, ensuring maximum protection"
    },
    {
      icon: <FiLock className="w-8 h-8 text-primary-600" />,
      title: "Password Protection",
      description: "Set passwords on shared links and control who can access your documents"
    },
    {
      icon: <FiEye className="w-8 h-8 text-primary-600" />,
      title: "View Limits",
      description: "Control how many times a document can be viewed before access expires"
    },
    {
      icon: <FiUpload className="w-8 h-8 text-primary-600" />,
      title: "Easy Upload",
      description: "Drag and drop interface with support for multiple file formats"
    },
    {
      icon: <FiShare2 className="w-8 h-8 text-primary-600" />,
      title: "Secure Sharing",
      description: "Share documents with custom expiry dates and device restrictions"
    },
    {
      icon: <FiDownload className="w-8 h-8 text-primary-600" />,
      title: "Download Control",
      description: "Enable or disable downloads and printing for each document"
    }
  ];

  const stats = [
    { icon: <FiUsers />, value: "10,000+", label: "Active Users" },
    { icon: <FiTrendingUp />, value: "50,000+", label: "Documents Shared" },
    { icon: <FiAward />, value: "99.9%", label: "Uptime" }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Upload Document",
      description: "Drag and drop your file or click to upload. Set security preferences."
    },
    {
      step: "2",
      title: "Configure Security",
      description: "Set expiry dates, view limits, passwords, and device restrictions."
    },
    {
      step: "3",
      title: "Share Securely",
      description: "Get a secure link to share. Control access with granular permissions."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Secure Vault - Enterprise Document Security</title>
        <meta name="description" content="Secure document sharing with bank-level encryption" />
      </Helmet>

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <FiShield className="w-8 h-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold gradient-text">SecureVault</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <Link to="/login" className="text-secondary-700 hover:text-primary-600 transition-colors">
                Login
              </Link>
              <Link 
                to="/register" 
                className="btn-primary"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Secure Document{' '}
                <span className="gradient-text">Sharing</span>{' '}
                Platform
              </h1>
              <p className="mt-6 text-xl text-secondary-600">
                Share sensitive documents with confidence. Bank-level encryption, 
                granular access controls, and comprehensive activity tracking.
              </p>
              <div className="mt-8 flex space-x-4">
                <Link to="/register" className="btn-primary text-lg px-8 py-3">
                  Start Free Trial
                </Link>
                <Link to="/login" className="btn-secondary text-lg px-8 py-3">
                  Watch Demo
                </Link>
              </div>
              
              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="flex justify-center text-primary-600 text-2xl">
                      {stat.icon}
                    </div>
                    <div className="mt-2 text-2xl font-bold text-secondary-900">{stat.value}</div>
                    <div className="text-sm text-secondary-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="ml-2 text-sm text-secondary-600">Secure Document Upload</span>
                </div>
                
                <div className="border-2 border-dashed border-primary-200 rounded-lg p-8 text-center">
                  <FaCloudUploadAlt className="mx-auto w-16 h-16 text-primary-400" />
                  <p className="mt-4 text-secondary-700">Drag and drop your files here</p>
                  <p className="text-sm text-secondary-500">or click to browse</p>
                  <button className="mt-4 btn-primary">
                    Upload Document
                  </button>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary-600">Security Level</span>
                    <span className="text-primary-600 font-semibold">AES-256 Encryption</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary-600">Expiry</span>
                    <span className="text-primary-600 font-semibold">7 Days</span>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-200 rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary-300 rounded-full opacity-20 blur-2xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-secondary-900">
              Enterprise-Grade{' '}
              <span className="gradient-text">Security Features</span>
            </h2>
            <p className="mt-4 text-xl text-secondary-600">
              Everything you need to share documents securely
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="card hover-lift"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-secondary-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-secondary-900">
              How{' '}
              <span className="gradient-text">SecureVault</span>{' '}
              Works
            </h2>
            <p className="mt-4 text-xl text-secondary-600">
              Three simple steps to secure document sharing
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-secondary-600">
                    {item.description}
                  </p>
                </div>
                
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-2/3 w-full h-0.5 bg-primary-200">
                    <div className="absolute right-0 -top-1 w-3 h-3 bg-primary-400 rounded-full"></div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-400">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center px-4"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Secure Your Documents?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of users who trust SecureVault for their document sharing needs
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-50 transform hover:scale-105 transition-all duration-200"
          >
            Get Started Now - It's Free
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <FiShield className="w-6 h-6 text-primary-400" />
                <span className="ml-2 text-lg font-bold">SecureVault</span>
              </div>
              <p className="text-secondary-400 text-sm">
                Enterprise-grade document security platform
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-secondary-400">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-secondary-400">
                <li><a href="#" className="hover:text-primary-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-secondary-400">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-secondary-800 text-center text-secondary-400">
            <p>&copy; 2024 SecureVault. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;
