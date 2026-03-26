import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const InputTypeMaster = () => {
  const [inputTypes, setInputTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type_name: '',
    short_name: '',
    description: '',
    status: 'active'
  });
  const [errors, setErrors] = useState({});

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
      } else {
        await apiService.createInputType(formData);
      }
      setShowModal(false);
      resetForm();
      fetchInputTypes();
    } catch (error) {
      console.error('Error saving input type:', error);
      alert(error.message || 'Failed to save input type');
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
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this input type?')) {
      try {
        await apiService.deleteInputType(id);
        fetchInputTypes();
      } catch (error) {
        console.error('Error deleting input type:', error);
        alert(error.message || 'Failed to delete input type');
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

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Input Type Master</h1>
            </div>
            <div className="col-sm-6">
              <button className="btn btn-primary float-right" onClick={openAddModal}>
                <i className="fas fa-plus"></i> Add Input Type
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          <div className="card">
            <div className="card-body">
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              ) : (
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th>Type Name</th>
                      <th>Short Name</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inputTypes.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center">No input types found</td>
                      </tr>
                    ) : (
                      inputTypes.map((type) => (
                        <tr key={type.id}>
                          <td>{type.type_name}</td>
                          <td>{type.short_name}</td>
                          <td>{type.description || '-'}</td>
                          <td>
                            <span className={`badge badge-${type.status === 'active' ? 'success' : 'danger'}`}>
                              {type.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-info mr-1"
                              onClick={() => handleEdit(type)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(type.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">{editingId ? 'Edit Input Type' : 'Add Input Type'}</h4>
                <button type="button" className="close" onClick={() => setShowModal(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Type Name *</label>
                    <input
                      type="text"
                      name="type_name"
                      className={`form-control ${errors.type_name ? 'is-invalid' : ''}`}
                      value={formData.type_name}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.type_name && (
                      <div className="invalid-feedback">{errors.type_name}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Short Name *</label>
                    <input
                      type="text"
                      name="short_name"
                      className={`form-control ${errors.short_name ? 'is-invalid' : ''}`}
                      value={formData.short_name}
                      onChange={handleInputChange}
                      maxLength="10"
                      required
                    />
                    {errors.short_name && (
                      <div className="invalid-feedback">{errors.short_name}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      className="form-control"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-default" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Update' : 'Save'}
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