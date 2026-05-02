import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import apiService from '../services/apiService';

const InputMaster = () => {
  const location = useLocation();
  const [inputs, setInputs] = useState([]);
  const [inputTypes, setInputTypes] = useState([]);
  const [inputClasses, setInputClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    input_name: '',
    short_name: '',
    input_type_id: '',
    input_class_id: '',
    description: '',
    status: 'active'
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('open') === 'add') {
      setEditingId(null);
      setShowModal(true);
    }
  }, [location.search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inputsData, typesData, classesData] = await Promise.all([
        apiService.getInputs(),
        apiService.getInputTypes(),
        apiService.getInputClasses()
      ]);
      setInputs(inputsData);
      setInputTypes(typesData.filter(t => t.status === 'active'));
      setInputClasses(classesData.filter(c => c.status === 'active'));
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
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
    if (!formData.input_name.trim()) {
      newErrors.input_name = 'Input Name is required';
    }
    if (!formData.short_name.trim()) {
      newErrors.short_name = 'Short Name is required';
    }
    if (!formData.input_type_id) {
      newErrors.input_type_id = 'Input Type is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        ...formData,
        input_type_id: parseInt(formData.input_type_id),
        input_class_id: formData.input_class_id ? parseInt(formData.input_class_id) : null
      };
      
      if (editingId) {
        await apiService.updateInput(editingId, payload);
        setSuccess('Input updated successfully!');
      } else {
        await apiService.createInput(payload);
        setSuccess('Input created successfully!');
      }
      setTimeout(() => closeModal(), 1500);
      fetchData();
    } catch (error) {
      console.error('Error saving input:', error);
      setError(error.message || 'Failed to save input');
    }
  };

  const handleEdit = (input) => {
    setEditingId(input.id);
    setFormData({
      input_name: input.input_name,
      short_name: input.short_name,
      input_type_id: input.input_type_id?.toString() || '',
      input_class_id: input.input_class_id?.toString() || '',
      description: input.description || '',
      status: input.status
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Inactivate this input?')) {
      try {
        await apiService.deleteInput(id);
        setSuccess('Input inactivated successfully!');
        fetchData();
      } catch (error) {
        console.error('Error deleting input:', error);
        setError(error.message || 'Failed to inactivate input');
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      input_name: '',
      short_name: '',
      input_type_id: '',
      input_class_id: '',
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

  const getTypeName = (typeId) => {
    const type = inputTypes.find(t => t.id === typeId);
    return type ? type.type_name : '-';
  };

  const getClassName = (classId) => {
    if (!classId) return '-';
    const cls = inputClasses.find(c => c.id === classId);
    return cls ? cls.class_name : '-';
  };

  return (
    <div className="master-page">
      <div className="page-header-container">
        <div className="header-content">
          <h1 className="page-title">
            <i className="fas fa-box-open"></i>
            Input Master Addition / Deletion
          </h1>
          <p className="page-subtitle">Add, edit, and inactivate promotional inputs</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => {
          setError('');
          setSuccess('');
          setShowModal(true);
        }}>
          <i className="fas fa-plus"></i> Add Input
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
            <i className="fas fa-list"></i> Inputs List
          </h3>
          <div className="card-tools">
            <button className="btn btn-tool" onClick={fetchData}>
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
                    <th><i className="fas fa-box"></i> Input Name</th>
                    <th><i className="fas fa-code"></i> Short Name</th>
                    <th><i className="fas fa-tag"></i> Type</th>
                    <th><i className="fas fa-tags"></i> Class</th>
                    <th><i className="fas fa-align-left"></i> Description</th>
                    <th><i className="fas fa-toggle-on"></i> Status</th>
                    <th><i className="fas fa-cogs"></i> Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inputs.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center text-muted">
                        <i className="fas fa-inbox"></i> No records found
                      </td>
                    </tr>
                  ) : (
                    inputs.map((input, index) => (
                      <tr key={input.id}>
                        <td><span className="badge badge-secondary">{index + 1}</span></td>
                        <td className="font-weight-medium">{input.input_name}</td>
                        <td><span className="badge badge-info">{input.short_name}</span></td>
                        <td>{input.inputType?.type_name || getTypeName(input.input_type_id)}</td>
                        <td>{input.inputClass?.class_name || getClassName(input.input_class_id)}</td>
                        <td>{input.description || '-'}</td>
                        <td>
                          <span className={`badge badge-${input.status === 'active' ? 'success' : 'danger'}`}>
                            <i className={`fas fa-${input.status === 'active' ? 'check' : 'times'}`}></i>
                            {' '}{input.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-warning mr-1"
                            onClick={() => handleEdit(input)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i> Edit
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(input.id)}
                            title="Inactivate"
                          >
                            <i className="fas fa-ban"></i> Inactivate
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
                  {' '}{editingId ? 'Edit Input' : 'Add Input'}
                </h5>
                <button type="button" className="close" onClick={closeModal}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="col-form-label">
                      <i className="fas fa-box"></i> Input Name *
                    </label>
                    <input
                      type="text"
                      name="input_name"
                      className={`form-control form-control-lg ${errors.input_name ? 'is-invalid' : ''}`}
                      value={formData.input_name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Visual Aid, Leave Behind Literature"
                    />
                    {errors.input_name && (
                      <div className="invalid-feedback">{errors.input_name}</div>
                    )}
                    <small className="form-text text-muted">Full name of the input</small>
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
                      placeholder="e.g., VA, LBL, RC"
                      maxLength="10"
                    />
                    {errors.short_name && (
                      <div className="invalid-feedback">{errors.short_name}</div>
                    )}
                    <small className="form-text text-muted">Abbreviation (max 10 characters)</small>
                  </div>
                  <div className="form-group">
                    <label className="col-form-label">
                      <i className="fas fa-tag"></i> Input Type *
                    </label>
                    <select
                      name="input_type_id"
                      className={`form-control form-control-lg ${errors.input_type_id ? 'is-invalid' : ''}`}
                      value={formData.input_type_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Input Type</option>
                      {inputTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.type_name} ({type.short_name})
                        </option>
                      ))}
                    </select>
                    {errors.input_type_id && (
                      <div className="invalid-feedback">{errors.input_type_id}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="col-form-label">
                      <i className="fas fa-tags"></i> Input Class
                    </label>
                    <select
                      name="input_class_id"
                      className="form-control form-control-lg"
                      value={formData.input_class_id}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Input Class (Optional)</option>
                      {inputClasses.map(cls => (
                        <option key={cls.id} value={cls.id}>
                          {cls.class_name} ({cls.short_name})
                        </option>
                      ))}
                    </select>
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
                      placeholder="Brief description of the input"
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

export default InputMaster;
