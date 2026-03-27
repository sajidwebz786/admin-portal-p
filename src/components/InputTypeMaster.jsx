import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const InputTypeMaster = () => {
  const [inputTypes, setInputTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type_name: '',
    short_name: '',
    description: '',
    status: 'active'
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchInputTypes();
  }, []);

  const fetchInputTypes = async () => {
    try {
      setLoading(true);
      const data = await apiService.getInputTypes();
      setInputTypes(data);
    } catch (error) {
      console.error('Error fetching input types:', error);
      setError('Failed to fetch input types');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setErrors({
      ...errors,
      [name]: ''
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.type_name.trim()) {
      newErrors.type_name = 'Input Type Name is required';
    }
    if (!formData.short_name.trim()) {
      newErrors.short_name = 'Short Name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingId) {
        await apiService.updateInputType(editingId, formData);
        setSuccess('Input type updated successfully!');
      } else {
        await apiService.createInputType(formData);
        setSuccess('Input type created successfully!');
      }
      setTimeout(() => closeModal(), 1500);
      fetchInputTypes();
    } catch (error) {
      console.error('Error saving input type:', error);
      setError(error.message || 'Failed to save input type');
    }
  };

  const handleEdit = (inputType) => {
    setEditingId(inputType.id);
    setFormData({
      type_name: inputType.type_name,
      short_name: inputType.short_name,
      description: inputType.description || '',
      status: inputType.status
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this input type?')) {
      try {
        await apiService.deleteInputType(id);
        setSuccess('Input type deleted successfully!');
        fetchInputTypes();
      } catch (error) {
        console.error('Error deleting input type:', error);
        setError(error.message || 'Failed to delete input type');
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      type_name: '',
      short_name: '',
      description: '',
      status: 'active'
    });
    setErrors({});
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
    setError('');
    setSuccess('');
  };

  return (
    <div className="master-page">
      <div className="page-header-container">
        <div className="header-content">
          <h1 className="page-title">
            <i className="fas fa-tag"></i>
            Input Type Master
          </h1>
          <p className="page-subtitle">Manage input types for promotional materials</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => {
          setError('');
          setSuccess('');
          setShowModal(true);
        }}>
          <i className="fas fa-plus"></i> Add Input Type
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
            <i className="fas fa-list"></i> Input Types List
          </h3>
          <div className="card-tools">
            <button className="btn btn-tool" onClick={fetchInputTypes}>
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
                    <th><i className="fas fa-tag"></i> Type Name</th>
                    <th><i className="fas fa-code"></i> Short Name</th>
                    <th><i className="fas fa-align-left"></i> Description</th>
                    <th><i className="fas fa-toggle-on"></i> Status</th>
                    <th><i className="fas fa-cogs"></i> Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inputTypes.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        <i className="fas fa-inbox"></i> No records found
                      </td>
                    </tr>
                  ) : (
                    inputTypes.map((type, index) => (
                      <tr key={type.id}>
                        <td><span className="badge badge-secondary">{index + 1}</span></td>
                        <td className="font-weight-medium">{type.type_name}</td>
                        <td><span className="badge badge-info">{type.short_name}</span></td>
                        <td>{type.description || '-'}</td>
                        <td>
                          <span className={`badge badge-${type.status === 'active' ? 'success' : 'danger'}`}>
                            <i className={`fas fa-${type.status === 'active' ? 'check' : 'times'}`}></i>
                            {' '}{type.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-warning mr-1"
                            onClick={() => handleEdit(type)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(type.id)}
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
                  <i className={`fas ${editingId ? 'fa-edit' : 'fa-plus-circle'}`}></i>
                  {' '}{editingId ? 'Edit Input Type' : 'Add Input Type'}
                </h5>
                <button type="button" className="close" onClick={closeModal}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="col-form-label">
                      <i className="fas fa-tag"></i> Type Name *
                    </label>
                    <input
                      type="text"
                      name="type_name"
                      className={`form-control form-control-lg ${errors.type_name ? 'is-invalid' : ''}`}
                      value={formData.type_name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Visual Aid, Leave Behind Literature"
                    />
                    {errors.type_name && (
                      <div className="invalid-feedback">{errors.type_name}</div>
                    )}
                    <small className="form-text text-muted">Full name of the input type</small>
                  </div>
                  <div className="form-group">
                    <label className="col-form-label">
                      <i className="fas fa-code"></i> Short Name *
                    </label>
                    <input
                      type="text"
                      name="short_name"
                      className={`form-control form-control-lg ${errors.short_name ? 'is-invalid' : ''}`}
                      value={formData.short_name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., VA, LBL"
                      maxLength="10"
                    />
                    {errors.short_name && (
                      <div className="invalid-feedback">{errors.short_name}</div>
                    )}
                    <small className="form-text text-muted">Abbreviation (max 10 characters)</small>
                  </div>
                  <div className="form-group">
                    <label className="col-form-label">
                      <i className="fas fa-align-left"></i> Description
                    </label>
                    <textarea
                      name="description"
                      className="form-control form-control-lg"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Brief description of the input type"
                    />
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
                    <i className={`fas ${editingId ? 'fa-save' : 'fa-plus'}`}></i>
                    {' '}{editingId ? 'Update' : 'Save'}
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

export default InputTypeMaster;
