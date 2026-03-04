import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiFile, 
  FiLink, 
  FiLogIn,
  FiTrendingUp,
  FiPieChart,
  FiRefreshCw,
  FiUserPlus,
  FiSettings,
  FiActivity,
  FiDownload,
  FiEye,
  FiTrash2,
  FiMoreVertical
} from 'react-icons/fi';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_documents: 0,
    active_links: 0,
    total_logins_today: 0,
    upload_percentage: 0,
    file_type_distribution: {},
    recent_users: [],
    recent_documents: [],
    recent_activities: []
  });
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAdminStats();
    const interval = setInterval(fetchAdminStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAdminStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStats(response.data);
      setLastRefreshed(new Date());
    } catch (error) {
      toast.error('Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const fileTypeData = Object.entries(stats.file_type_distribution).map(([name, value]) => ({
    name: name.toUpperCase(),
    value
  }));

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

  const statsCards = [
    { 
      title: 'Total Users', 
      value: stats.total_users, 
      icon: FiUsers, 
      color: 'bg-blue-500',
      change: '+12%'
    },
    { 
      title: 'Total Documents', 
      value: stats.total_documents, 
      icon: FiFile, 
      color: 'bg-green-500',
      change: '+8%'
    },
    { 
      title: 'Active Links', 
      value: stats.active_links, 
      icon: FiLink, 
      color: 'bg-purple-500',
      change: '+15%'
    },
    { 
      title: 'Logins Today', 
      value: stats.total_logins_today, 
      icon: FiLogIn, 
      color: 'bg-orange-500',
      change: '+23%'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FiFile className="w-8 h-8 text-primary-600" />
              <h1 className="ml-2 text-xl font-semibold">Admin | System Control Panel</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-secondary-500">
                Last refreshed: {formatDistanceToNow(lastRefreshed, { addSuffix: true })}
              </span>
              <button
                onClick={fetchAdminStats}
                className="p-2 text-secondary-600 hover:text-primary-600 transition-colors"
              >
                <FiRefreshCw className="w-5 h-5" />
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
                  <p className="text-green-600 text-sm mt-2">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary flex items-center">
              <FiUserPlus className="mr-2" />
              Create User
            </button>
            <button className="btn-secondary flex items-center">
              <FiUsers className="mr-2" />
              Manage Users
            </button>
                      <button className="btn-secondary flex items-center">
              <FiFile className="mr-2" />
              Manage Documents
            </button>
            <button className="btn-secondary flex items-center">
              <FiActivity className="mr-2" />
              View Logs
            </button>
            <button className="btn-secondary flex items-center">
              <FiSettings className="mr-2" />
              System Settings
            </button>
          </div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* File Type Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
              <FiPieChart className="mr-2" />
              File Type Distribution
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fileTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {fileTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Daily Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
              <FiTrendingUp className="mr-2" />
              Daily Activity
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Mon', uploads: 4, users: 2 },
                  { name: 'Tue', uploads: 6, users: 3 },
                  { name: 'Wed', uploads: 8, users: 5 },
                  { name: 'Thu', uploads: 7, users: 4 },
                  { name: 'Fri', uploads: 9, users: 6 },
                  { name: 'Sat', uploads: 5, users: 2 },
                  { name: 'Sun', uploads: 3, users: 1 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="uploads" fill="#6366f1" />
                  <Bar dataKey="users" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Recent Users and Documents */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-secondary-200">
              <h2 className="text-lg font-semibold text-secondary-900">Recently Registered Users</h2>
            </div>
            <div className="divide-y divide-secondary-200">
              {stats.recent_users.map((user) => (
                <div key={user.id} className="p-4 hover:bg-secondary-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">
                          {user.full_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">{user.full_name}</p>
                        <p className="text-sm text-secondary-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-secondary-500">
                        {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                      </p>
                      <p className="text-xs text-secondary-400">{user.documents_count} documents</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Documents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-secondary-200">
              <h2 className="text-lg font-semibold text-secondary-900">Recently Uploaded Documents</h2>
            </div>
            <div className="divide-y divide-secondary-200">
              {stats.recent_documents.map((doc) => (
                <div key={doc.id} className="p-4 hover:bg-secondary-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-secondary-900">{doc.title}</p>
                      <p className="text-sm text-secondary-500">
                        Uploaded by {doc.user_id} • {doc.file_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-secondary-500">
                        {doc.views_count} views
                      </p>
                      <p className="text-xs text-secondary-400">
                        {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-secondary-200">
            <h2 className="text-lg font-semibold text-secondary-900">Recent Access Activities</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="table-header">User</th>
                  <th className="table-header">Document</th>
                  <th className="table-header">Action</th>
                  <th className="table-header">Device</th>
                  <th className="table-header">IP Address</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Timestamp</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {stats.recent_activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-secondary-50 transition-colors">
                    <td className="table-cell">{activity.user_id}</td>
                    <td className="table-cell">{activity.document_id || 'N/A'}</td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        activity.action === 'login' ? 'bg-green-100 text-green-800' :
                        activity.action === 'upload' ? 'bg-blue-100 text-blue-800' :
                        activity.action === 'view' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.action}
                      </span>
                    </td>
                    <td className="table-cell">{activity.device_type}</td>
                    <td className="table-cell">{activity.ip_address}</td>
                    <td className="table-cell">
                      <span className={`badge-${activity.status === 'success' ? 'active' : 'expired'}`}>
                        {activity.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;
