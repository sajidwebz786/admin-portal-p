import React, { useState, useEffect } from 'react'
import adminAPI from '../services/apiService'

const ProductManagement = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    subcategory: '',
    brand: '',
    manufacturer: '',
    description: '',
    composition: '',
    indications: '',
    dosage: '',
    packSize: '',
    mrp: '',
    ptr: '',
    pts: '',
    hsnCode: '',
    gstRate: '18',
    schedule: 'H',
    therapeuticClass: ''
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await adminAPI.getProducts()
      const productsData = response.products || response || []
      setProducts(productsData)
    } catch (error) {
      console.error('Error loading products:', error)
      setError('Failed to load products. Please ensure you are logged in.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      category: '',
      subcategory: '',
      brand: '',
      manufacturer: '',
      description: '',
      composition: '',
      indications: '',
      dosage: '',
      packSize: '',
      mrp: '',
      ptr: '',
      pts: '',
      hsnCode: '',
      gstRate: '18',
      schedule: 'H',
      therapeuticClass: '',
      isActive: true
    })
    setEditingProduct(null)
  }

  const showAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const showEditModal = (product) => {
    setFormData({
      name: product.name,
      code: product.code,
      category: product.category,
      subcategory: product.subcategory || '',
      brand: product.brand,
      manufacturer: product.manufacturer,
      description: product.description || '',
      composition: product.composition || '',
      indications: product.indications || '',
      dosage: product.dosage || '',
      packSize: product.packSize,
      mrp: product.mrp,
      ptr: product.ptr,
      pts: product.pts || '',
      hsnCode: product.hsnCode || '',
      gstRate: product.gstRate || '18',
      schedule: product.schedule || 'H',
      therapeuticClass: product.therapeuticClass || '',
      isActive: product.isActive !== undefined ? product.isActive : true
    })
    setEditingProduct(product)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct.id, formData)
      } else {
        await adminAPI.createProduct(formData)
      }

      closeModal()
      loadProducts() // Refresh the products list
    } catch (error) {
      console.error('Error saving product:', error)
      setError('Failed to save product')
    }
  }

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminAPI.deleteProduct(productId)
        loadProducts() // Refresh the products list
      } catch (error) {
        console.error('Error deleting product:', error)
        setError('Failed to delete product')
      }
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="section-content">
        <h2>Product Management</h2>
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i> Loading products...
        </div>
      </div>
    )
  }

  return (
    <div className="section-content">
      <h2>Product Management</h2>

      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-secondary">
          <i className="fas fa-search"></i> Search
        </button>
      </div>

      <div className="management-actions mb-4 d-flex gap-3">
        <button className="btn btn-primary" onClick={showAddModal}>
          <i className="fas fa-plus"></i> Add New Product
        </button>
        <button className="btn btn-info">
          <i className="fas fa-download"></i> Export List
        </button>
      </div>

      <div className="management-table">
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Pack Size</th>
              <th>MRP</th>
              <th>PTR</th>
              <th>PTS</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center">
                  {products.length === 0 ? 'No products found.' : 'No products match your search.'}
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.code}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>{product.packSize}</td>
                  <td>₹{product.mrp}</td>
                  <td>₹{product.ptr}</td>
                  <td>₹{product.pts}</td>
                  <td>
                    <span className={`badge ${product.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => showEditModal(product)}
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                    >
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm ml-1"
                      onClick={() => handleDelete(product.id)}
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                    >
                      <i className="fas fa-trash" style={{ fontSize: '0.75rem' }}></i> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '800px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button className="close-btn" onClick={closeModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label htmlFor="name">Product Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="code">Product Code *</label>
                      <input
                        type="text"
                        id="code"
                        name="code"
                        className="form-control"
                        value={formData.code}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="category">Category *</label>
                      <select
                        id="category"
                        name="category"
                        className="form-control"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="Tablet">Tablet</option>
                        <option value="Capsule">Capsule</option>
                        <option value="Syrup">Syrup</option>
                        <option value="Injection">Injection</option>
                        <option value="Ointment">Ointment</option>
                        <option value="Drops">Drops</option>
                        <option value="Powder">Powder</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="brand">Brand *</label>
                      <input
                        type="text"
                        id="brand"
                        name="brand"
                        className="form-control"
                        value={formData.brand}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="manufacturer">Manufacturer *</label>
                      <input
                        type="text"
                        id="manufacturer"
                        name="manufacturer"
                        className="form-control"
                        value={formData.manufacturer}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="packSize">Pack Size *</label>
                      <input
                        type="text"
                        id="packSize"
                        name="packSize"
                        className="form-control"
                        value={formData.packSize}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., 10 tablets, 100ml"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="mrp">MRP (₹) *</label>
                      <input
                        type="number"
                        id="mrp"
                        name="mrp"
                        className="form-control"
                        value={formData.mrp}
                        onChange={handleInputChange}
                        required
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="ptr">PTR (₹) *</label>
                      <input
                        type="number"
                        id="ptr"
                        name="ptr"
                        className="form-control"
                        value={formData.ptr}
                        onChange={handleInputChange}
                        required
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="pts">PTS (₹) *</label>
                      <input
                        type="number"
                        id="pts"
                        name="pts"
                        className="form-control"
                        value={formData.pts}
                        onChange={handleInputChange}
                        required
                        step="0.01"
                        min="0"
                        placeholder="Price to Stockist"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                    <div className="form-group">
                      <label htmlFor="gstRate">GST Rate (%)</label>
                      <select
                        id="gstRate"
                        name="gstRate"
                        className="form-control"
                        value={formData.gstRate}
                        onChange={handleInputChange}
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="schedule">Schedule</label>
                      <select
                        id="schedule"
                        name="schedule"
                        className="form-control"
                        value={formData.schedule}
                        onChange={handleInputChange}
                      >
                        <option value="H">H (Prescription)</option>
                        <option value="OTC">OTC (Over the Counter)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '15px' }}>
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      className="form-control"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="composition">Composition</label>
                    <textarea
                      id="composition"
                      name="composition"
                      className="form-control"
                      value={formData.composition}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Active ingredients and their quantities"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="indications">Indications</label>
                    <textarea
                      id="indications"
                      name="indications"
                      className="form-control"
                      value={formData.indications}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Uses and indications"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dosage">Dosage</label>
                    <input
                      type="text"
                      id="dosage"
                      name="dosage"
                      className="form-control"
                      value={formData.dosage}
                      onChange={handleInputChange}
                      placeholder="Recommended dosage"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="therapeuticClass">Therapeutic Class</label>
                    <input
                      type="text"
                      id="therapeuticClass"
                      name="therapeuticClass"
                      className="form-control"
                      value={formData.therapeuticClass}
                      onChange={handleInputChange}
                      placeholder="e.g., Antibiotic, Analgesic, etc."
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingProduct ? 'Update Product' : 'Save Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductManagement