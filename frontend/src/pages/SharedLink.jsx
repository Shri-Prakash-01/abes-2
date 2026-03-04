import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiFile, 
  FiEye, 
  FiDownload, 
  FiPrinter,
  FiLock,
  FiAlertCircle,
  FiArrowLeft
} from 'react-icons/fi';
import { FaRegFilePdf, FaRegFileImage, FaRegFileWord } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const SharedLink = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [accessError, setAccessError] = useState(null);

  useEffect(() => {
    fetchDocumentInfo();
  }, [token]);

  const fetchDocumentInfo = async () => {
    try {
      const response = await axios.get(`/api/share/${token}`);
      if (response.data.requires_password) {
        setRequiresPassword(true);
        setDocumentInfo(response.data.document_info);
      } else {
        setDocumentInfo(response.data.document_info);
      }
      setLoading(false);
    } catch (error) {
      setAccessError(error.response?.data?.error || 'Failed to load document');
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/share/${token}/verify-password`, { password });
      setPasswordVerified(true);
      setRequiresPassword(false);
      toast.success('Password verified successfully');
    } catch (error) {
      toast.error('Invalid password');
    }
  };

  const handleView = async () => {
    try {
      const response = await axios.post(`/api/share/${token}/view`, {
        password_verified: passwordVerified
      }, {
        responseType: 'blob'
      });
      
      // Create a blob URL and open in new tab
      const url = window.URL.createObjectURL(new Blob([response.data]));
      window.open(url, '_blank');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to view document');
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.post(`/api/share/${token}/download`, {
        password_verified: passwordVerified
      }, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', documentInfo.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to download document');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getFileIcon = () => {
    const type = documentInfo?.file_type?.toLowerCase();
    switch(type) {
      case 'pdf':
        return <FaRegFilePdf className="w-16 h-16 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FaRegFileImage className="w-16 h-16 text-green-500" />;
      case 'doc':
      case 'docx':
        return <FaRegFileWord className="w-16 h-16 text-blue-500" />;
      default:
        return <FiFile className="w-16 h-16 text-secondary-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (accessError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center"
        >
          <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Access Denied</h2>
          <p className="text-secondary-600 mb-6">{accessError}</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go to Homepage
          </button>
        </motion.div>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full"
        >
          <div className="text-center mb-6">
            <FiLock className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-secondary-900">Password Protected</h2>
            <p className="text-secondary-600 mt-2">
              This document is password protected. Please enter the password to continue.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Document Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter document password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
            >
              Verify Password
            </button>
          </form>

          <button
            onClick={() => navigate('/')}
            className="mt-4 text-secondary-600 hover:text-primary-600 text-sm flex items-center justify-center"
          >
            <FiArrowLeft className="mr-1" />
            Back to Homepage
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-400 px-6 py-4">
            <button
              onClick={() => navigate('/')}
              className="text-white hover:text-primary-100 flex items-center"
            >
              <FiArrowLeft className="mr-2" />
              Back
            </button>
          </div>

          {/* Document Info */}
          <div className="p-8">
            <div className="text-center mb-8">
              {getFileIcon()}
              <h1 className="mt-4 text-2xl font-bold text-secondary-900">
                {documentInfo.title}
              </h1>
              <p className="text-secondary-600 mt-2">
                {documentInfo.filename} • {(documentInfo.file_size / 1024 / 1024).toFixed(2)} MB
              </p>
              <div className="flex justify-center space-x-4 mt-4 text-sm text-secondary-500">
                <span>{documentInfo.views_count} Views</span>
                <span>•</span>
                <span>{documentInfo.downloads_count} Downloads</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-4">
              {documentInfo.allow_download !== false && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="flex flex-col items-center p-4 rounded-lg hover:bg-secondary-50 transition-colors"
                >
                  <FiDownload className="w-8 h-8 text-primary-600 mb-2" />
                  <span className="text-sm font-medium">Download</span>
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleView}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-secondary-50 transition-colors"
              >
                <FiEye className="w-8 h-8 text-primary-600 mb-2" />
                <span className="text-sm font-medium">View</span>
              </motion.button>

              {documentInfo.allow_print && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrint}
                  className="flex flex-col items-center p-4 rounded-lg hover:bg-secondary-50 transition-colors"
                >
                  <FiPrinter className="w-8 h-8 text-primary-600 mb-2" />
                  <span className="text-sm font-medium">Print</span>
                </motion.button>
              )}
            </div>

            {/* Security Notice */}
            <div className="mt-8 p-4 bg-secondary-50 rounded-lg">
              <p className="text-sm text-secondary-600 flex items-center">
                <FiLock className="mr-2 text-primary-600" />
                This document is securely shared. Your access is being monitored.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SharedLink;
