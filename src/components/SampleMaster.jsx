import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import apiService from '../services/apiService';

const asArray = (value, key) => Array.isArray(value) ? value : (Array.isArray(value?.[key]) ? value[key] : []);

const SampleMaster = ({ mode = 'addition' }) => {
  const location = useLocation();
  const isDeletionMode = mode === 'deletion';
  const [samples, setSamples] = useState([]);
  const [products, setProducts] = useState([]);
  const [packSizes, setPackSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    product_id: '',
    pack_size_id: '',
    sample_name: '',
    sample_qty: '',
    unit: 'Tab',
    max_per_call: '5',
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
    if (!isDeletionMode && params.get('open') === 'add') {
      setEditingId(null);
      setShowModal(true);
    }
  }, [location.search, isDeletionMode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [samplesData, productsData, packSizesData] = await Promise.all([
        apiService.getSamples(),
        apiService.getProducts(),
        apiService.getPackSizes()
      ]);
      setSamples(asArray(samplesData, 'samples'));
      setProducts(asArray(productsData, 'products').filter(p => p.status === 'active' || p.isActive));
      setPackSizes(asArray(packSizesData, 'packSizes').filter(p => p.status === 'active'));
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
    if (!formData.product_id) {
      newErrors.product_id = 'Product is required';
    }
    if (!formData.sample_name.trim()) {
      newErrors.sample_name = 'Sample Name is required';
    }
    if (!formData.sample_qty) {
      newErrors.sample_qty = 'Sample Quantity is required';
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
        product_id: parseInt(formData.product_id),
        pack_size_id: formData.pack_size_id ? parseInt(formData.pack_size_id) : null,
        sample_qty: parseFloat(formData.sample_qty),
        max_per_call: parseInt(formData.max_per_call)
      };
      
      if (editingId) {
        await apiService.updateSample(editingId, payload);
        setSuccess('Sample updated successfully!');
      } else {
        await apiService.createSample(payload);
        setSuccess('Sample created successfully!');
      }
      setTimeout(() => closeModal(), 1500);
      fetchData();
    } catch (error) {
      console.error('Error saving sample:', error);
      setError(error.message || 'Failed to save sample');
    }
  };

  const handleEdit = (sample) => {
    setEditingId(sample.id);
    setFormData({
      product_id: sample.product_id?.toString() || '',
      pack_size_id: sample.pack_size_id?.toString() || '',
      sample_name: sample.sample_name,
      sample_qty: sample.sample_qty?.toString() || '',
      unit: sample.unit || 'Tab',
      max_per_call: sample.max_per_call?.toString() || '5',
      status: sample.status
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deactivate this sample?')) {
      try {
        await apiService.deleteSample(id);
        setSuccess('Sample deactivated successfully!');
        fetchData();
      } catch (error) {
        console.error('Error deleting sample:', error);
        setError(error.message || 'Failed to deactivate sample');
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      product_id: '',
      pack_size_id: '',
      sample_name: '',
      sample_qty: '',
      unit: 'Tab',
      max_per_call: '5',
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

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : '-';
  };

  const getPackSize = (packSizeId) => {
    if (!packSizeId) return '-';
    const pack = packSizes.find(p => p.id === packSizeId);
    return pack ? pack.pack_size : '-';
  };

  return (
    <div className="master-page">
      <div className="page-header-container">
        <div className="header-content">
          <h1 className="page-title">
            <i className="fas fa-vial"></i>
            Sample {isDeletionMode ? 'Deletion' : 'Addition'}
          </h1>
          <p className="page-subtitle">
            {isDeletionMode ? 'Search existing samples and submit only deactivation requests' : 'Create only new product samples for doctor calls'}
          </p>
        </div>
        <div className="operation-header-actions">
          <Link to="/addition-deletion-control" className="btn btn-light btn-lg">
            <i className="fas fa-arrow-left"></i> Back
          </Link>
          {!isDeletionMode && (
            <button className="btn btn-primary btn-lg" onClick={() => {
              setError('');
              setSuccess('');
              setShowModal(true);
            }}>
              <i className="fas fa-plus"></i> Add Sample
            </button>
          )}
        </div>
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
            <i className="fas fa-list"></i> Samples List
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
                    <th><i className="fas fa-pills"></i> Product</th>
                    <th><i className="fas fa-weight-hanging"></i> Pack Size</th>
                    <th><i className="fas fa-vial"></i> Sample Name</th>
                    <th><i className="fas fa-sort-numeric-up"></i> Sample Qty</th>
                    <th><i className="fas fa-ruler"></i> Unit</th>
                    <th><i className="fas fa-user-clock"></i> Max/Call</th>
                    <th><i className="fas fa-toggle-on"></i> Status</th>
                    {isDeletionMode && <th><i className="fas fa-cogs"></i> Deletion Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {samples.length === 0 ? (
                    <tr>
                      <td colSpan={isDeletionMode ? '9' : '8'} className="text-center text-muted">
                        <i className="fas fa-inbox"></i> No records found
                      </td>
                    </tr>
                  ) : (
                    samples.map((sample, index) => (
                      <tr key={sample.id}>
                        <td><span className="badge badge-secondary">{index + 1}</span></td>
                        <td className="font-weight-medium">{sample.product?.name || getProductName(sample.product_id)}</td>
                        <td>{sample.packSize?.pack_size || getPackSize(sample.pack_size_id)}</td>
                        <td>{sample.sample_name}</td>
                        <td>{sample.sample_qty}</td>
                        <td><span className="badge badge-info">{sample.unit}</span></td>
                        <td>{sample.max_per_call}</td>
                        <td>
                          <span className={`badge badge-${sample.status === 'active' ? 'success' : 'danger'}`}>
                            <i className={`fas fa-${sample.status === 'active' ? 'check' : 'times'}`}></i>
                            {' '}{sample.status}
                          </span>
                        </td>
                        {isDeletionMode && (
                          <td>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(sample.id)}
                              title="Deactivate"
                            >
                              <i className="fas fa-ban"></i> Deactivate
                            </button>
                          </td>
                        )}
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
                  {' '}{editingId ? 'Edit Sample' : 'Add Sample'}
                </h5>
                <button type="button" className="close" onClick={closeModal}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="col-form-label">
                      <i className="fas fa-pills"></i> Product *
                    </label>
                    <select
                      name="product_id"
                      className={`form-control form-control-lg ${errors.product_id ? 'is-invalid' : ''}`}
                      value={formData.product_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.short_name})
                        </option>
                      ))}
                    </select>
                    {errors.product_id && (
                      <div className="invalid-feedback">{errors.product_id}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="col-form-label">
                      <i className="fas fa-weight-hanging"></i> Pack Size
                    </label>
                    <select
                      name="pack_size_id"
                      className="form-control form-control-lg"
                      value={formData.pack_size_id}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Pack Size (Optional)</option>
                      {packSizes.map(pack => (
                        <option key={pack.id} value={pack.id}>
                          {pack.pack_size} ({pack.short_name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="col-form-label">
                      <i className="fas fa-vial"></i> Sample Name *
                    </label>
                    <input
                      type="text"
                      name="sample_name"
                      className={`form-control form-control-lg ${errors.sample_name ? 'is-invalid' : ''}`}
                      value={formData.sample_name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., PCM500 Sample, OrthoGel Sample"
                    />
                    {errors.sample_name && (
                      <div className="invalid-feedback">{errors.sample_name}</div>
                    )}
                    <small className="form-text text-muted">Name of the sample</small>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="col-form-label">
                          <i className="fas fa-sort-numeric-up"></i> Sample Quantity *
                        </label>
                        <input
                          type="number"
                          name="sample_qty"
                          className={`form-control form-control-lg ${errors.sample_qty ? 'is-invalid' : ''}`}
                          value={formData.sample_qty}
                          onChange={handleInputChange}
                          placeholder="e.g., 2"
                          step="0.01"
                          min="0"
                          required
                        />
                        {errors.sample_qty && (
                          <div className="invalid-feedback">{errors.sample_qty}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="col-form-label">
                          <i className="fas fa-ruler"></i> Unit
                        </label>
                        <select
                          name="unit"
                          className="form-control form-control-lg"
                          value={formData.unit}
                          onChange={handleInputChange}
                        >
                          <option value="Tab">Tab</option>
                          <option value="ml">ml</option>
                          <option value="g">g</option>
                          <option value="Cap">Cap</option>
                          <option value="Syr">Syr</option>
                          <option value="Inj">Inj</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="col-form-label">
                      <i className="fas fa-user-clock"></i> Max Per Call
                    </label>
                    <input
                      type="number"
                      name="max_per_call"
                      className="form-control form-control-lg"
                      value={formData.max_per_call}
                      onChange={handleInputChange}
                      placeholder="Maximum samples per doctor call"
                      min="1"
                    />
                    <small className="form-text text-muted">Maximum samples allowed per call</small>
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

export default SampleMaster;
