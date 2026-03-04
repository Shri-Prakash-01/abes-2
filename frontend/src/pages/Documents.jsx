import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiFile, FiEye, FiDownload, FiCopy, FiTrash2, FiSearch } from 'react-icons/fi';
import { FaRegFilePdf, FaRegFileImage, FaRegFileWord } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('/api/documents', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDocuments(response.data.documents);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'pdf': return <FaRegFilePdf className="w-5 h-5 text-red-500" />;
      case 'jpg': case 'jpeg': case 'png': return <FaRegFileImage className="w-5 h-5 text-green-500" />;
      case 'doc': case 'docx': return <FaRegFileWord className="w-5 h-5 text-blue-500" />;
      default: return <FiFile className="w-5 h-5 text-secondary-500" />;
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-8"><div className="loading-spinner"></div></div>;

  return (
    <div className="min-h-screen bg-secondary-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-secondary-900">My Documents</h1>
          <Link to="/upload" className="btn-primary">Upload New</Link>
        </div>
        
        <div className="mb-6 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Type</th>
                <th className="table-header">Size</th>
                <th className="table-header">Uploaded</th>
                <th className="table-header">Views</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map(doc => (
                <tr key={doc.id} className="hover:bg-secondary-50">
                  <td className="table-cell">
                    <div className="flex items-center">
                      {getFileIcon(doc.file_type)}
                      <span className="ml-2">{doc.title}</span>
                    </div>
                  </td>
                  <td className="table-cell uppercase">{doc.file_type}</td>
                  <td className="table-cell">{(doc.file_size / 1024).toFixed(1)} KB</td>
                  <td className="table-cell">{new Date(doc.created_at).toLocaleDateString()}</td>
                  <td className="table-cell">{doc.views_count}</td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button className="p-1 text-secondary-600 hover:text-primary-600">
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-secondary-600 hover:text-primary-600">
                        <FiCopy className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-secondary-600 hover:text-red-600">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Documents;
