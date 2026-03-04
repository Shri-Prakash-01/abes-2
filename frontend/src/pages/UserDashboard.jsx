import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiFile, 
  FiEye, 
  FiDownload, 
  FiLink, 
  FiSearch,
  FiFilter,
  FiCopy,
  FiTrash2,
  FiShare2,
  FiRefreshCw,
  FiClock,
  FiUser,
  FiLogOut,
  FiUpload,
  FiMoreVertical
} from 'react-icons/fi';
import { FaRegFilePdf, FaRegFileImage, FaRegFileWord } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    total_documents: 0,
    total_views: 0,
    total_downloads: 0,
    active_links: 0
  });
  const [documents, setDocuments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, docsRes] = await Promise.all([
        axios.get('/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('/api/documents', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);
      
      setStats(statsRes.data);
      setDocuments(docsRes.data.documents);
      setRecentActivity(statsRes.data.recent_activity || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (token) => {
    const link = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await axios.delete(`/api/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Document deleted successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const getFileIcon = (fileType) => {
    switch(fileType?.toLowerCase()) {
      case 'pdf':
        return <FaRegFilePdf className="w-5 h-5 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FaRegFileImage className="w-5 h-5 text-green-500" />;
      case 'doc':
      case 'docx':
        return <FaRegFileWord className="w-5 h-5 text-blue-500" />;
      default:
        return <FiFile className="w-5 h-5 text-secondary-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span className="badge-active">Active</span>;
      case 'expired':
        return <span className="badge-expired">Expired</span>;
      case 'limit_reached':
        return <span className="badge-limit">Limit Reached</span>;
      default:
        return <span className="badge-active">Active</span>;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && doc.status === 'active';
    if (filter === 'expired') return matchesSearch && doc.status === 'expired';
    if (filter === 'shared') return matchesSearch && doc.is_shared;
    return matchesSearch;
  });

  const statsCards = [
    { 
      title: 'Total Documents', 
      value: stats.total_documents, 
      icon: FiFile, 
      color: 'bg-blue-500',
      change: '+12%'
    },
    { 
      title: 'Total Views', 
      value: stats.total_views, 
      icon: FiEye, 
      color: 'bg-green-500',
      change: '+8%'
    },
    { 
      title: 'Total Downloads', 
      value: stats.total_downloads, 
      icon: FiDownload, 
      color: 'bg-purple-500',
      change: '+23%'
    },
    { 
      title: 'Active Links', 
      value: stats.active_links, 
      icon: FiLink, 
      color: 'bg-orange-500',
      change: '+5%'
    }
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FiFile className="w-8 h-8 text-primary-600" />
              <h1 className="ml-2 text-xl font-semibold">Secure Vault Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-secondary-700">
                Welcome, <span className="font-semibold">{user?.full_name}</span>
              </span>
              <button
                onClick={logout}
                className="p-2 text-secondary-600 hover:text-primary-600 transition-colors"
              >
                <FiLogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statsCards.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary-600 text-sm">{stat.title}</p>
                  <p className="text-3xl font-bold text-secondary-900 mt-2">{stat.value}</p>
                  <p className="text-green-600 text-sm mt-2">{stat.change} from last month</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-lg relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
              <input
                type="text"
                placeholder="Search by file name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FiFilter className="text-secondary-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="input-field py-2"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="shared">Shared</option>
                </select>
              </div>
              
              <Link to="/upload" className="btn-primary flex items-center">
                <FiUpload className="mr-2" />
                Upload
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Document Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-secondary-200">
              <h2 className="text-lg font-semibold text-secondary-900">Your Documents</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="table-header">Name</th>
                    <th className="table-header">Type</th>
                    <th className="table-header">Size</th>
                    <th className="table-header">Upload Date</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {filteredDocuments.map((doc) => (
                    <motion.tr 
                      key={doc.id}
                      whileHover={{ backgroundColor: '#f9fafb' }}
                      className="transition-colors"
                    >
                      <td className="table-cell">
                        <div className="flex items-center">
                          {getFileIcon(doc.file_type)}
                          <span className="ml-2 font-medium text-secondary-900">{doc.title}</span>
                        </div>
                      </td>
                      <td className="table-cell uppercase">{doc.file_type}</td>
                      <td className="table-cell">{formatFileSize(doc.file_size)}</td>
                      <td className="table-cell">
                        {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                      </td>
                      <td className="table-cell">
                        {getStatusBadge(doc.status)}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCopyLink(doc.unique_token)}
                            className="p-1 text-secondary-600 hover:text-primary-600 transition-colors"
                            title="Copy link"
                          >
                            <FiCopy className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/document/${doc.id}`}
                            className="p-1 text-secondary-600 hover:text-primary-600 transition-colors"
                            title="View details"
                          >
                            <FiEye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-1 text-secondary-600 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 text-secondary-600 hover:text-primary-600 transition-colors"
                            title="More options"
                          >
                            <FiMoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Activity Log */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-secondary-200">
              <h2 className="text-lg font-semibold text-secondary-900">Recent File Activity</h2>
            </div>
            
            <div className="divide-y divide-secondary-200 max-h-96 overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <div key={index} className="p-4 hover:bg-secondary-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <FiClock className="w-5 h-5 text-secondary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-secondary-500">
                        Document: {activity.document_id}
                      </p>
                      <p className="text-xs text-secondary-400 mt-1">
                        IP: {activity.ip_address} • {activity.device_type}
                      </p>
                      <p className="text-xs text-secondary-400">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-200">
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center">
                <FiRefreshCw className="mr-2" />
                View All Activity
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default UserDashboard;
