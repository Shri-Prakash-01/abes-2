import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiCheckCircle, 
  FiCopy, 
  FiShare2, 
  FiDownload,
  FiEye,
  FiPrinter,
  FiLock,
  FiCalendar,
  FiUsers,
  FiArrowLeft,
  FiEdit2,
  FiTrash2
} from 'react-icons/fi';
import { FaWhatsapp, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const UploadSuccess = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  const fetchDocument = async () => {
    try {
      const response = await axios.get(`/api/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDocument(response.data);
    } catch (error) {
      toast.error('Failed to load document');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/share/${document.unique_token}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  const handleShare = (platform) => {
    const link = `${window.location.origin}/share/${document.unique_token}`;
    const text = `Check out this document: ${document.title}`;
    
    let url = '';
    switch(platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + link)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`;
        break;
    }
    
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-400 px-8 py-6">
            <div className="flex items-center">
              <FiCheckCircle className="w-12 h-12 text-white mr-4" />
              <div>
                <h1 className="text-2xl font-bold text-white">Upload Successful!</h1>
                <p className="text-green-100 mt-1">
                  Your document has been securely stored and is ready to share.
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Document Details */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Document Details</h2>
              <div className="bg-secondary-50 rounded-lg p-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-secondary-500">Document Name</p>
                    <p className="font-medium text-secondary-900">{document.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500">File Type</p>
                    <p className="font-medium text-secondary-900 uppercase">{document.file_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500">File Size</p>
                    <p className="font-medium text-secondary-900">
                      {(document.file_size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500">Upload Date</p>
                    <p className="font-medium text-secondary-900">
                      {format(new Date(document.created_at), 'PPP')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions Summary */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Permissions Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-secondary-50 rounded-lg p-3 text-center">
                  <FiEye className="w-5 h-5 text-primary-600 mx-auto mb-2" />
                  <p className="text-xs text-secondary-500">View</p>
                  <p className="text-sm font-medium text-secondary-900">
                    {document.view_limit === 0 ? 'Unlimited' : `${document.view_limit} views`}
                  </p>
                </div>
                <div className="bg-secondary-50 rounded-lg p-3 text-center">
                  <FiDownload className="w-5 h-5 text-primary-600 mx-auto mb-2" />
                  <p className="text-xs text-secondary-500">Download</p>
                  <p className="text-sm font-medium text-secondary-900">
                    {document.allow_download ? 'Allowed' : 'Disabled'}
                  </p>
                </div>
                <div className="bg-secondary-50 rounded-lg p-3 text-center">
                  <FiPrinter className="w-5 h-5 text-primary-600 mx-auto mb-2" />
                  <p className="text-xs text-secondary-500">Print</p>
                  <p className="text-sm font-medium text-secondary-900">
                    {document.allow_print ? 'Allowed' : 'Disabled'}
                  </p>
                </div>
                <div className="bg-secondary-50 rounded-lg p-3 text-center">
                  <FiLock className="w-5 h-5 text-primary-600 mx-auto mb-2" />
                  <p className="text-xs text-secondary-500">Password</p>
                  <p className="text-sm font-medium text-secondary-900">
                    {document.password_protected ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            </div>

            {/* Shareable Link Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Shareable Link</h2>
              <div className="bg-secondary-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="text"
                    value={`${window.location.origin}/share/${document.unique_token}`}
                    readOnly
                    className="input-field flex-1"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="btn-primary flex items-center"
                  >
                    <FiCopy className="mr-2" />
                    Copy
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-secondary-600">
                      <FiCalendar className="mr-1" />
                      {document.expiry_date ? 
                        `Expires: ${format(new Date(document.expiry_date), 'PPP')}` : 
                        'Never expires'}
                    </div>
                    <div className="flex items-center text-sm text-secondary-600">
                      <FiUsers className="mr-1" />
                      {document.view_limit === 0 ? 
                        'Unlimited views' : 
                        `${document.current_views}/${document.view_limit} views`}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    {showQR ? 'Hide QR' : 'Show QR'}
                  </button>
                </div>

                {showQR && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 flex justify-center"
                  >
                    <QRCodeSVG
                      value={`${window.location.origin}/share/${document.unique_token}`}
                      size={128}
                      bgColor={"#ffffff"}
                      fgColor={"#6366f1"}
                      level={"L"}
                      includeMargin={false}
                    />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Social Share */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Share via Social Media</h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <FaWhatsapp className="mr-2" />
                  WhatsApp
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaLinkedin className="mr-2" />
                  LinkedIn
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                >
                  <FaTwitter className="mr-2" />
                  Twitter
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-between items-center pt-6 border-t border-secondary-200">
              <div className="flex space-x-3">
                <Link to="/upload" className="btn-primary flex items-center">
                  <FiArrowLeft className="mr-2" />
                  Upload Another File
                </Link>
                <Link to="/dashboard" className="btn-secondary">
                  Go to Dashboard
                </Link>
              </div>
              
              <div className="flex space-x-2">
                <Link
                  to={`/document/${document.id}/edit`}
                  className="p-2 text-secondary-600 hover:text-primary-600 transition-colors"
                  title="Edit Document"
                >
                  <FiEdit2 className="w-5 h-5" />
                </Link>
                <button
                  className="p-2 text-secondary-600 hover:text-red-600 transition-colors"
                  title="Delete Document"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadSuccess;
