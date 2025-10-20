import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Filter, 
  Tag, 
  Calendar, 
  DollarSign, 
  Building, 
  Mail, 
  Globe,
  Edit,
  Trash2,
  X
} from 'lucide-react';

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Grant Card Component
const GrantCard = ({ grant, onEdit, onDelete, onTagClick }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount) => {
    if (!amount) return 'Amount not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{grant.title}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(grant)}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(grant.id)}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-3">{grant.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-gray-600">
          <DollarSign size={16} className="mr-2" />
          <span>{formatAmount(grant.amount)}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Calendar size={16} className="mr-2" />
          <span>{formatDate(grant.deadline)}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Building size={16} className="mr-2" />
          <span>{grant.organization || 'Organization not specified'}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            grant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {grant.status}
          </span>
        </div>
      </div>
      
      {grant.contact_email && (
        <div className="flex items-center text-gray-600 mb-2">
          <Mail size={16} className="mr-2" />
          <a href={`mailto:${grant.contact_email}`} className="hover:text-blue-600">
            {grant.contact_email}
          </a>
        </div>
      )}
      
      {grant.website && (
        <div className="flex items-center text-gray-600 mb-4">
          <Globe size={16} className="mr-2" />
          <a href={grant.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
            Visit Website
          </a>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        {grant.tags && grant.tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => onTagClick(tag.id)}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: tag.color }}
          >
            <Tag size={12} className="mr-1" />
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  );
};

// Grant Form Component
const GrantForm = ({ grant, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    deadline: '',
    status: 'active',
    organization: '',
    contact_email: '',
    website: '',
    tags: []
  });

  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    if (grant) {
      setFormData({
        title: grant.title || '',
        description: grant.description || '',
        amount: grant.amount || '',
        deadline: grant.deadline || '',
        status: grant.status || 'active',
        organization: grant.organization || '',
        contact_email: grant.contact_email || '',
        website: grant.website || '',
        tags: grant.tags ? grant.tags.map(tag => tag.id) : []
      });
    }
    
    // Fetch available tags
    axios.get(`${API_BASE_URL}/tags`)
      .then(response => setAvailableTags(response.data))
      .catch(error => console.error('Error fetching tags:', error));
  }, [grant]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleTagToggle = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {grant ? 'Edit Grant' : 'Create New Grant'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.tags.includes(tag.id)
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={formData.tags.includes(tag.id) ? { backgroundColor: tag.color } : {}}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {grant ? 'Update Grant' : 'Create Grant'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [grants, setGrants] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingGrant, setEditingGrant] = useState(null);

  useEffect(() => {
    fetchGrants();
    fetchTags();
  }, []);

  const fetchGrants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedTag) params.append('tag', selectedTag);
      
      const response = await axios.get(`${API_BASE_URL}/grants?${params}`);
      setGrants(response.data);
    } catch (error) {
      console.error('Error fetching grants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tags`);
      setTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleSearch = () => {
    fetchGrants();
  };

  const handleTagFilter = (tagId) => {
    setSelectedTag(tagId === selectedTag ? '' : tagId);
  };

  const handleCreateGrant = () => {
    setEditingGrant(null);
    setShowForm(true);
  };

  const handleEditGrant = (grant) => {
    setEditingGrant(grant);
    setShowForm(true);
  };

  const handleSaveGrant = async (formData) => {
    try {
      if (editingGrant) {
        await axios.put(`${API_BASE_URL}/grants/${editingGrant.id}`, formData);
      } else {
        await axios.post(`${API_BASE_URL}/grants`, formData);
      }
      
      setShowForm(false);
      setEditingGrant(null);
      fetchGrants();
    } catch (error) {
      console.error('Error saving grant:', error);
      alert('Error saving grant. Please try again.');
    }
  };

  const handleDeleteGrant = async (grantId) => {
    if (window.confirm('Are you sure you want to delete this grant?')) {
      try {
        await axios.delete(`${API_BASE_URL}/grants/${grantId}`);
        fetchGrants();
      } catch (error) {
        console.error('Error deleting grant:', error);
        alert('Error deleting grant. Please try again.');
      }
    }
  };

  const handleTagClick = (tagId) => {
    handleTagFilter(tagId);
  };

  useEffect(() => {
    fetchGrants();
  }, [selectedTag]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Grant Tag System</h1>
              </div>
              <button
                onClick={handleCreateGrant}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Add Grant
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search grants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
            
            {/* Tag Filters */}
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTag('')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTag === '' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagFilter(tag.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTag === tag.id 
                        ? 'text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={selectedTag === tag.id ? { backgroundColor: tag.color } : {}}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grants Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : grants.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No grants found</div>
              <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {grants.map(grant => (
                <GrantCard
                  key={grant.id}
                  grant={grant}
                  onEdit={handleEditGrant}
                  onDelete={handleDeleteGrant}
                  onTagClick={handleTagClick}
                />
              ))}
            </div>
          )}
        </main>

        {/* Grant Form Modal */}
        {showForm && (
          <GrantForm
            grant={editingGrant}
            onSave={handleSaveGrant}
            onCancel={() => {
              setShowForm(false);
              setEditingGrant(null);
            }}
          />
        )}
      </div>
    </Router>
  );
};

export default App;
