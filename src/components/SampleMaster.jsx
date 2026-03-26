import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const SampleMaster = () => {
  const [samples, setSamples] = useState([]);
  const [products, setProducts] = useState([]);
  const [packSizes, setPackSizes] = useState([]);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [samplesData, productsData, packSizesData] = await Promise.all([
        apiService.getSamples(),
        apiService.getProducts(),
        apiService.getPackSizes()
      ]);
      setSamples(samplesData);
      setProducts(productsData.filter(p => p.isActive));
      setPackSizes(packSizesData.filter(p => p.status === 'active'));
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
      } else {
        await apiService.createSample(payload);
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving sample:', error);
      alert(error.message || 'Failed to save sample');
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
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sample?')) {
      try {
        await apiService.deleteSample(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting sample:', error);
        alert(error.message || 'Failed to delete sample');
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

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
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
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Sample Master (Product Samples)</h1>
            </div>
            <div className="col-sm-6">
              <button className="btn btn-primary float-right" onClick={openAddModal}>
                <i className="fas fa-plus"></i> Add Sample
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
                      <th>Product</th>
                      <th>Pack Size</th>
                      <th>Sample Name</th>
                      <th>Sample Qty</th>
                      <th>Unit</th>
                      <th>Max/Call</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {samples.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center">No samples found</td>
                      </tr>
                    ) : (
                      samples.map((sample) => (
                        <tr key={sample.id}>
                          <td>{sample.product?.name || getProductName(sample.product_id)}</td>
                          <td>{sample.packSize?.pack_size || getPackSize(sample.pack_size_id)}</td>
                          <td>{sample.sample_name}</td>
                          <td>{sample.sample_qty}</td>
                          <td>{sample.unit}</td>
                          <td>{sample.max_per_call}</td>
                          <td>
                            <span className={`badge badge-${sample.status === 'active' ? 'success' : 'danger'}`}>
                              {sample.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-info mr-1"
                              onClick={() => handleEdit(sample)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(sample.id)}
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
                <h4 className="modal-title">{editingId ? 'Edit Sample' : 'Add Sample'}</h4>
                <button type="button" className="close" onClick={() => setShowModal(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Product *</label>
                    <select
                      name="product_id"
                      className={`form-control ${errors.product_id ? 'is-invalid' : ''}`}
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
                    <label>Pack Size</label>
                    <select
                      name="pack_size_id"
                      className="form-control"
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
                    <label>Sample Name *</label>
                    <input
                      type="text"
                      name="sample_name"
                      className={`form-control ${errors.sample_name ? 'is-invalid' : ''}`}
                      value={formData.sample_name}
                      onChange={handleInputChange}
                      placeholder="e.g., PCM500 Sample, OrthoGel Sample"
                      required
                    />
                    {errors.sample_name && (
                      <div className="invalid-feedback">{errors.sample_name}</div>
                    )}
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Sample Quantity *</label>
                        <input
                          type="number"
                          name="sample_qty"
                          className={`form-control ${errors.sample_qty ? 'is-invalid' : ''}`}
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
                        <label>Unit</label>
                        <select
                          name="unit"
                          className="form-control"
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
                    <label>Max Per Call</label>
                    <input
                      type="number"
                      name="max_per_call"
                      className="form-control"
                      value={formData.max_per_call}
                      onChange={handleInputChange}
                      placeholder="Maximum samples per doctor call"
                      min="1"
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

export default SampleMaster;