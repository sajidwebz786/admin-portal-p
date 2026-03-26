import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const InputMaster = () => {
  const [inputs, setInputs] = useState([]);
  const [inputTypes, setInputTypes] = useState([]);
  const [inputClasses, setInputClasses] = useState([]);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    fetchData();
  }, []);

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
      } else {
        await apiService.createInput(payload);
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving input:', error);
      alert(error.message || 'Failed to save input');
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
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this input?')) {
      try {
        await apiService.deleteInput(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting input:', error);
        alert(error.message || 'Failed to delete input');
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

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
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
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Input Master (Promotional Materials)</h1>
            </div>
            <div className="col-sm-6">
              <button className="btn btn-primary float-right" onClick={openAddModal}>
                <i className="fas fa-plus"></i> Add Input
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
                      <th>Input Name</th>
                      <th>Short Name</th>
                      <th>Type</th>
                      <th>Class</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inputs.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center">No inputs found</td>
                      </tr>
                    ) : (
                      inputs.map((input) => (
                        <tr key={input.id}>
                          <td>{input.input_name}</td>
                          <td>{input.short_name}</td>
                          <td>{input.inputType?.type_name || getTypeName(input.input_type_id)}</td>
                          <td>{input.inputClass?.class_name || getClassName(input.input_class_id)}</td>
                          <td>{input.description || '-'}</td>
                          <td>
                            <span className={`badge badge-${input.status === 'active' ? 'success' : 'danger'}`}>
                              {input.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-info mr-1"
                              onClick={() => handleEdit(input)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(input.id)}
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
                <h4 className="modal-title">{editingId ? 'Edit Input' : 'Add Input'}</h4>
                <button type="button" className="close" onClick={() => setShowModal(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Input Name *</label>
                    <input
                      type="text"
                      name="input_name"
                      className={`form-control ${errors.input_name ? 'is-invalid' : ''}`}
                      value={formData.input_name}
                      onChange={handleInputChange}
                      placeholder="e.g., Visual Aid, Leave Behind Literature"
                      required
                    />
                    {errors.input_name && (
                      <div className="invalid-feedback">{errors.input_name}</div>
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
                      placeholder="e.g., VA, LBL, RC"
                      maxLength="10"
                      required
                    />
                    {errors.short_name && (
                      <div className="invalid-feedback">{errors.short_name}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Input Type *</label>
                    <select
                      name="input_type_id"
                      className={`form-control ${errors.input_type_id ? 'is-invalid' : ''}`}
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
                    <label>Input Class</label>
                    <select
                      name="input_class_id"
                      className="form-control"
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
                    <label>Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Brief description of the input"
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

export default InputMaster;