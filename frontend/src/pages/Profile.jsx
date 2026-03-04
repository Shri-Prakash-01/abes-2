import React from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiCalendar, FiClock, FiLock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-secondary-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-primary-600 to-primary-400 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
          </div>
          
          <div className="p-8">
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                <FiUser className="w-12 h-12 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-secondary-900">{user?.full_name}</h2>
                <p className="text-secondary-600">{user?.email}</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-secondary-50 rounded-lg p-4">
                <div className="flex items-center text-secondary-600 mb-2">
                  <FiMail className="mr-2" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <p className="text-secondary-900">{user?.email}</p>
              </div>
              
              <div className="bg-secondary-50 rounded-lg p-4">
                <div className="flex items-center text-secondary-600 mb-2">
                  <FiPhone className="mr-2" />
                  <span className="text-sm font-medium">Phone</span>
                </div>
                <p className="text-secondary-900">{user?.phone || 'Not provided'}</p>
              </div>
              
              <div className="bg-secondary-50 rounded-lg p-4">
                <div className="flex items-center text-secondary-600 mb-2">
                  <FiCalendar className="mr-2" />
                  <span className="text-sm font-medium">Member Since</span>
                </div>
                <p className="text-secondary-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              
              <div className="bg-secondary-50 rounded-lg p-4">
                <div className="flex items-center text-secondary-600 mb-2">
                  <FiClock className="mr-2" />
                  <span className="text-sm font-medium">Last Login</span>
                </div>
                <p className="text-secondary-900">
                  {user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Change Password</h3>
              <div className="space-y-4">
                <input type="password" placeholder="Current Password" className="input-field" />
                <input type="password" placeholder="New Password" className="input-field" />
                <input type="password" placeholder="Confirm New Password" className="input-field" />
                <button className="btn-primary">Update Password</button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
