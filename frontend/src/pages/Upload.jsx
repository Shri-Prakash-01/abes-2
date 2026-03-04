import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { 
  FiUpload, 
  FiFile, 
  FiLock, 
  FiCalendar, 
  FiEye,
  FiDownload,
  FiPrinter,
  FiSmartphone,
  FiMonitor,
  FiCheck,
  FiX
} from 'react-icons/fi';
import { FaWater } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    expiry_days: 7,
    view_limit: 0,
    password_protected: false,
    document_password: '',
    confirm_password: '',
    watermark_enabled: false,
    device_restriction: 'both',
    allow_download: true,
    allow_print: true
  });

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setFormData(prev => ({
        ...prev,
        title: selectedFile.name
      }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    if (formData.password_protected) {
      if (formData.document_password !== formData.confirm_password) {
        toast.error('Passwords do not match');
        return;
      }
      if (formData.document_password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
    }

    const uploadData = new FormData();
    uploadData.append('file', file);
    Object.keys(formData).forEach(key => {
      uploadData.append(key, formData[key]);
    });

    try {
      setUploading(true);
      const response = await axios.post('/api/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      toast.success('File uploaded successfully!');
      navigate(`/upload-success/${response.data.document.id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const expiryOptions = [
    { value: 1, label: '1 Day' },
    { value: 7, label: '7 Days' },
    { value: 30, label: '30 Days' },
    { value: 0, label: 'Never Expire' }
  ];

  const viewLimitOptions = [
    { value: 10, label: '10 Views' },
    { value: 50, label: '50 Views' },
    { value: 100, label: '100 Views' },
    { value: 0, label: 'Unlimited' }
  ];

  return (
    <div className="min-h-screen bg-secondary-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-400 px-8 py-6">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <FiUpload className="mr-3" />
              Upload to Vault
            </h1>
            <p className="text-primary-100 mt-2">
              Securely upload and configure your document settings
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* File Drop Zone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-secondary-300 hover:border-primary-400'}`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="flex items-center justify-center space-x-4">
                  <FiFile className="w-12 h-12 text-primary-500" />
                  <div className="text-left">
                    <p className="font-semibold text-secondary-900">{file.name}</p>
                    <p className="text-sm text-secondary-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <FiUpload className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                  <p className="text-secondary-700">
                    Drag & drop your file here, or click to browse
                  </p>
                  <p className="text-sm text-secondary-500 mt-2">
                    Supports: PDF, DOC, DOCX, JPG, PNG (Max: 100MB)
                  </p>
                </div>
              )}
            </div>

            {/* Document Information */}
            <div className="mt-8 space-y-6">
              <h2 className="text-lg font-semibold text-secondary-900">Document Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Document Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="input-field"
                  placeholder="Enter document description..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">Select category</option>
                    <option value="personal">Personal</option>
                    <option value="work">Work</option>
                    <option value="financial">Financial</option>
                    <option value="legal">Legal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Comma separated tags"
                  />
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Security Settings</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Expiry Settings */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-secondary-700">
                    <FiCalendar className="mr-2" />
                    Expiry Settings
                  </label>
                  <select
                    name="expiry_days"
                    value={formData.expiry_days}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    {expiryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Limit */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-secondary-700">
                    <FiEye className="mr-2" />
                    View Limit
                  </label>
                  <select
                    name="view_limit"
                    value={formData.view_limit}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    {viewLimitOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password Protection */}
              <div className="mt-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="password_protected"
                    checked={formData.password_protected}
                    onChange={handleInputChange}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-secondary-700 flex items-center">
                    <FiLock className="mr-1" />
                    Enable Password Protection
                  </span>
                </label>

                {formData.password_protected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Document Password
                      </label>
                      <input
                        type="password"
                        name="document_password"
                        value={formData.document_password}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Watermark */}
              <div className="mt-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="watermark_enabled"
                    checked={formData.watermark_enabled}
                    onChange={handleInputChange}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-secondary-700 flex items-center">
                    <FaWater className="mr-1" />
                    Enable Watermark
                  </span>
                </label>
                {formData.watermark_enabled && (
                  <p className="mt-2 text-sm text-secondary-500">
                    Watermark will include viewer's email, IP, date and time
                  </p>
                )}
              </div>

              {/* Device Restriction */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  Device Access Restriction
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="device_restriction"
                      value="both"
                      checked={formData.device_restriction === 'both'}
                      onChange={handleInputChange}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <FiMonitor className="text-secondary-500" />
                    <FiSmartphone className="text-secondary-500" />
                    <span className="text-sm">Both</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="device_restriction"
                      value="mobile"
                      checked={formData.device_restriction === 'mobile'}
                      onChange={handleInputChange}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <FiSmartphone className="text-secondary-500" />
                    <span className="text-sm">Mobile Only</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="device_restriction"
                      value="desktop"
                      checked={formData.device_restriction === 'desktop'}
                      onChange={handleInputChange}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <FiMonitor className="text-secondary-500" />
                    <span className="text-sm">Desktop Only</span>
                  </label>
                </div>
              </div>

              {/* Download & Print Permissions */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="allow_download"
                    checked={formData.allow_download}
                    onChange={handleInputChange}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-secondary-700 flex items-center">
                    <FiDownload className="mr-1" />
                    Allow Download
                  </span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="allow_print"
                    checked={formData.allow_print}
                    onChange={handleInputChange}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-secondary-700 flex items-center">
                    <FiPrinter className="mr-1" />
                    Allow Print
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="btn-primary flex items-center disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div className="loading-spinner w-5 h-5 mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FiUpload className="mr-2" />
                    Upload & Generate Link
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Upload;
