import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiEye, FiDownload, FiPrinter, FiCopy, FiClock, FiUsers } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const DocumentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocumentDetails();
  }, [id]);

  const fetchDocumentDetails = async () => {
    try {
      const [docRes, activityRes] = await Promise.all([
        axios.get(`/api/documents/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`/api/documents/${id}/activity`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);
      setDocument(docRes.data);
      setActivity(activityRes.data.logs || []);
    } catch (error) {
      toast.error('Failed to load document');
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/share/${document.unique_token}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied!');
  };

  if (loading) return <div className="flex justify-center p-8"><div className="loading-spinner"></div></div>;

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="flex items-center text-secondary-600 hover:text-primary-600 mb-6">
          <FiArrowLeft className="mr-2" /> Back
        </button>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
              className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h1 className="text-2xl font-bold text-secondary-900 mb-4">{document.title}</h1>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-secondary-50 p-3 rounded-lg text-center">
                  <FiEye className="w-5 h-5 text-primary-600 mx-auto mb-2" />
                  <p className="text-xs text-secondary-500">Views</p>
                  <p className="font-semibold">{document.views_count}</p>
                </div>
                <div className="bg-secondary-50 p-3 rounded-lg text-center">
                  <FiDownload className="w-5 h-5 text-primary-600 mx-auto mb-2" />
                  <p className="text-xs text-secondary-500">Downloads</p>
                  <p className="font-semibold">{document.downloads_count}</p>
                </div>
                <div className="bg-secondary-50 p-3 rounded-lg text-center">
                  <FiClock className="w-5 h-5 text-primary-600 mx-auto mb-2" />
                  <p className="text-xs text-secondary-500">Expires</p>
                  <p className="font-semibold">
                    {document.expiry_date ? format(new Date(document.expiry_date), 'PP') : 'Never'}
                  </p>
                </div>
                <div className="bg-secondary-50 p-3 rounded-lg text-center">
                  <FiUsers className="w-5 h-5 text-primary-600 mx-auto mb-2" />
                  <p className="text-xs text-secondary-500">View Limit</p>
                  <p className="font-semibold">{document.view_limit || 'Unlimited'}</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button onClick={handleCopyLink} className="btn-primary flex-1 flex items-center justify-center">
                  <FiCopy className="mr-2" /> Copy Share Link
                </button>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Access Activity</h2>
              <div className="space-y-3">
                {activity.map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{log.access_type}</p>
                      <p className="text-sm text-secondary-500">IP: {log.ip_address}</p>
                    </div>
                    <p className="text-sm text-secondary-500">
                      {format(new Date(log.timestamp), 'PPp')}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 h-fit">
            <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-secondary-600">Password Protected</span>
                <span className={document.password_protected ? 'text-green-600' : 'text-red-600'}>
                  {document.password_protected ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Watermark</span>
                <span className={document.watermark_enabled ? 'text-green-600' : 'text-red-600'}>
                  {document.watermark_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Allow Download</span>
                <span className={document.allow_download ? 'text-green-600' : 'text-red-600'}>
                  {document.allow_download ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Allow Print</span>
                <span className={document.allow_print ? 'text-green-600' : 'text-red-600'}>
                  {document.allow_print ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DocumentView;

