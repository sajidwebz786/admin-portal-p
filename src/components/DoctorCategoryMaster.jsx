import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';

const DoctorCategoryMaster = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    category_name: '',
    short_name: '',
    status: 'active'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/master/doctor-categories');
      setCategories(response.data);
    } catch (err) {
      setError('Failed to fetch doctor categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      if (editingCategory) {
        await api.put(`/master/doctor-categories/${editingCategory.category_id}`, formData);
        setSuccess('Doctor category updated successfully!');
      } else {
        await api.post('/master/doctor-categories', formData);
        setSuccess('Doctor category created successfully!');
      }
      fetchCategories();
      setTimeout(() => closeModal(), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save doctor category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      category_name: category.category_name,
      short_name: category.short_name,
      status: category.status
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor category?')) {
      try {
        setError('');
        await api.delete(`/master/doctor-categories/${id}`);
        setSuccess('Doctor category deleted successfully!');
        fetchCategories();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete doctor category');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      category_name: '',
      short_name: '',
      status: 'active'
    });
    setError('');
    setSuccess('');
  };

  return (
    <div className="master-page">
      <div className="page-header-container">
        <div className="header-content">
          <h1 className="page-title">
            <i className="fas fa-list-alt"></i>
            Doctor Category Master
          </h1>
          <p className="page-subtitle">Manage doctor categories for classification</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => {
          setError('');
          setSuccess('');
          setShowModal(true);
        }}>
          <i className="fas fa-plus"></i> Add New Category
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible">
          <i className="fas fa-exclamation-circle"></i> {error}
          <button type="button" className="close" onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible">
          <i className="fas fa-check-circle"></i> {success}
          <button type="button" className="close" onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-list"></i> Doctor Categories List
          </h3>
          <div className="card-tools">
            <button className="btn btn-tool" onClick={fetchCategories}>
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
          </div>
        </div>
        
        <div className="card-body">
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="thead-dark">
                  <tr>
                    <th><i className="fas fa-hashtag"></i> Sr. No.</th>
                    <th><i className="fas fa-list-alt"></i> Category Name</th>
                    <th><i className="fas fa-code"></i> Short Name</th>
                    <th><i className="fas fa-toggle-on"></i> Status</th>
                    <th><i className="fas fa-cogs"></i> Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        <i className="fas fa-inbox"></i> No records found
                      </td>
                    </tr>
                  ) : (
                    categories.map((category, index) => (
                      <tr key={category.category_id}>
                        <td><span className="badge badge-secondary">{index + 1}</span></td>
                        <td className="font-weight-medium">{category.category_name}</td>
                        <td><span className="badge badge-info">{category.short_name}</span></td>
                        <td>
                          <span className={`badge badge-${category.status === 'active' ? 'success' : 'danger'}`}>
                            <i className={`fas fa-${category.status === 'active' ? 'check' : 'times'}`}></i>
                            {' '}{category.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-warning mr-1"
                            onClick={() => handleEdit(category)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(category.category_id)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-content-enhanced">
              <div className="modal-header modal-header-gradient">
                <h5 className="modal-title">
                  <i className={`fas ${editingCategory ? 'fa-edit' : 'fa-plus-circle'}`}></i>
                  {' '}{editingCategory ? 'Edit Doctor Category' : 'Add New Doctor Category'}
                </h5>
                <button type="button" className="close" onClick={closeModal}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="col-form-label">
                      <i className="fas fa-list-alt"></i> Category Name *
                    </label>
                    <input
                      type="text"
                      name="category_name"
                      className="form-control form-control-lg"
                      value={formData.category_name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Core, A, B, C"
                    />
                    <small className="form-text text-muted">Full name of the doctor category</small>
                  </div>
                  <div className="form-group">
                    <label className="col-form-label">
                      <i className="fas fa-code"></i> Short Name *
                    </label>
                    <input
                      type="text"
                      name="short_name"
                      className="form-control form-control-lg"
                      value={formData.short_name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., CORE, A, B"
                      maxLength="10"
                    />
                    <small className="form-text text-muted">Abbreviation (max 10 characters)</small>
                  </div>
                  <div className="form-group">
                    <label className="col-form-label">
                      <i className="fas fa-toggle-on"></i> Status
                    </label>
                    <select
                      name="status"
                      className="form-control form-control-lg"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-lg" onClick={closeModal}>
                    <i className="fas fa-times"></i> Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-lg">
                    <i className={`fas ${editingCategory ? 'fa-save' : 'fa-plus'}`}></i>
                    {' '}{editingCategory ? 'Update' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorCategoryMaster;
