import React, { useState, useEffect } from 'react'
import adminAPI from '../services/apiService'

const ProductManagement = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  
  // Master data for dropdowns
  const [divisions, setDivisions] = useState([])
  const [categories, setCategories] = useState([])
  const [packSizes, setPackSizes] = useState([])
  const [brandGroups, setBrandGroups] = useState([])
  const [strengths, setStrengths] = useState([])
  const [priceHistory, setPriceHistory] = useState([])
  const [showPriceHistory, setShowPriceHistory] = useState(false)
  
  // Check user role for access control
  const [currentUser, setCurrentUser] = useState(null)
  
  const [formData, setFormData] = useState({
    unique_id: '',
    name: '',
    short_name: '',
    code: '',
    division_id: '',
    brand_group_id: '',
    category_id: '',
    pack_size_id: '',
    strength_id: '',
    pts: '',
    ptr: '',
    mrp: '',
    nrv: '',
    launch_date: '',
    status: 'active',
    // Legacy fields
    description: '',
    composition: '',
    indications: '',
    dosage: '',
    packSize: '',
    hsnCode: '',
    gstRate: '18',
    schedule: 'H',
    therapeuticClass: ''
  })

  useEffect(() => {
    loadProducts()
    loadMasterData()
    checkUserRole()
  }, [])

  const checkUserRole = () => {
    const userStr = localStorage.getItem('adminUser')
    if (userStr) {
      const user = JSON.parse(userStr)
      setCurrentUser(user)
    }
  }

  const canEdit = () => {
    return currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'MARKETING')
  }

  const canDelete = () => {
    return currentUser && currentUser.role === 'ADMIN'
  }

  const loadMasterData = async () => {
    try {
      const [divisionsRes, categoriesRes, packSizesRes, brandGroupsRes, strengthsRes] = await Promise.all([
        adminAPI.getDivisions(),
        adminAPI.getProductCategories(),
        adminAPI.getPackSizes(),
        adminAPI.getBrandGroups(),
        adminAPI.getStrengths()
      ])
      
      setDivisions(divisionsRes || [])
      setCategories(categoriesRes || [])
      setPackSizes(packSizesRes || [])
      setBrandGroups(brandGroupsRes || [])
      setStrengths(strengthsRes || [])
    } catch (err) {
      console.error('Error loading master data:', err)
    }
  }

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
      unique_id: '',
      name: '',
      short_name: '',
      code: '',
      division_id: '',
      brand_group_id: '',
      category_id: '',
      pack_size_id: '',
      strength_id: '',
      pts: '',
      ptr: '',
      mrp: '',
      nrv: '',
      launch_date: '',
      status: 'active',
      // Legacy fields
      description: '',
      composition: '',
      indications: '',
      dosage: '',
      packSize: '',
      hsnCode: '',
      gstRate: '18',
      schedule: 'H',
      therapeuticClass: ''
    })
    setEditingProduct(null)
    setPriceHistory([])
  }

  const showAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const showEditModal = async (product) => {
    setFormData({
      unique_id: product.unique_id || '',
      name: product.name || '',
      short_name: product.short_name || '',
      code: product.code || '',
      division_id: product.division_id || '',
      brand_group_id: product.brand_group_id || '',
      category_id: product.category_id || '',
      pack_size_id: product.pack_size_id || '',
      strength_id: product.strength_id || '',
      pts: product.pts || '',
      ptr: product.ptr || '',
      mrp: product.mrp || '',
      nrv: product.nrv || '',
      launch_date: product.launch_date || '',
      status: product.status || 'active',
      // Legacy fields
      description: product.description || '',
      composition: product.composition || '',
      indications: product.indications || '',
      dosage: product.dosage || '',
      packSize: product.packSize || '',
      hsnCode: product.hsnCode || '',
      gstRate: product.gstRate || '18',
      schedule: product.schedule || 'H',
      therapeuticClass: product.therapeuticClass || ''
    })
    setEditingProduct(product)
    setShowModal(true)
    
    // Load price history
    try {
      const historyRes = await adminAPI.getProductPriceHistory(product.id)
      setPriceHistory(historyRes.priceHistory || [])
    } catch (err) {
      console.error('Error loading price history:', err)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setShowPriceHistory(false)
    resetForm()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const submitData = {
        ...formData,
        pts: formData.pts ? parseFloat(formData.pts) : null,
        ptr: formData.ptr ? parseFloat(formData.ptr) : null,
        mrp: formData.mrp ? parseFloat(formData.mrp) : null,
        nrv: formData.nrv ? parseFloat(formData.nrv) : null,
        division_id: formData.division_id ? parseInt(formData.division_id) : null,
        brand_group_id: formData.brand_group_id ? parseInt(formData.brand_group_id) : null,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        pack_size_id: formData.pack_size_id ? parseInt(formData.pack_size_id) : null,
        strength_id: formData.strength_id ? parseInt(formData.strength_id) : null
      }

      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct.id, submitData)
      } else {
        await adminAPI.createProduct(submitData)
      }

      closeModal()
      loadProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      setError(error.message || 'Failed to save product')
    }
  }

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminAPI.deleteProduct(productId)
        loadProducts()
      } catch (error) {
        console.error('Error deleting product:', error)
        setError(error.message || 'Failed to delete product')
      }
    }
  }

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.short_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.unique_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Helper to get display values
  const getDivisionName = (id) => {
    const division = divisions.find(d => d.id === id)
    return division ? division.division_name : '-'
  }

  const getCategoryName = (id) => {
    const category = categories.find(c => c.id === id)
    return category ? category.category_name : '-'
  }

  const getStrengthDisplay = (id) => {
    const strength = strengths.find(s => s.id === id)
    return strength ? `${strength.strength_value}${strength.unit || 'mg'}` : '-'
  }

  const getPackSizeDisplay = (id) => {
    const pack = packSizes.find(p => p.id === id)
    return pack ? pack.pack_size : '-'
  }

  const getBrandGroupName = (id) => {
    const group = brandGroups.find(g => g.id === id)
    return group ? group.brand_group_name : '-'
  }

  if (loading) {
    return (
      <div className="section-content">
        <h2>Product Master</h2>
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i> Loading products...
        </div>
      </div>
    )
  }

  return (
    <div className="section-content">
      <h2>Product Master</h2>

      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search products by name, short name, or unique ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-secondary">
          <i className="fas fa-search"></i> Search
        </button>
      </div>

      <div className="management-actions mb-4 d-flex gap-3">
        {canEdit() && (
          <button className="btn btn-primary" onClick={showAddModal}>
            <i className="fas fa-plus"></i> Add Product
          </button>
        )}
        <button className="btn btn-info" onClick={loadProducts}>
          <i className="fas fa-sync"></i> Refresh
        </button>
      </div>

      <div className="management-table">
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th>Unique ID</th>
              <th>Product Name</th>
              <th>Short Name</th>
              <th>Division</th>
              <th>Brand Group</th>
              <th>Category</th>
              <th>Strength</th>
              <th>Pack Size</th>
              <th>PTS</th>
              <th>PTR</th>
              <th>MRP</th>
              <th>Status</th>
              {canEdit() && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={canEdit() ? 13 : 12} className="text-center">
                  {products.length === 0 ? 'No products found.' : 'No products match your search.'}
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.unique_id || '-'}</td>
                  <td>{product.name}</td>
                  <td>{product.short_name || '-'}</td>
                  <td>{product.divisionData?.division_name || getDivisionName(product.division_id) || '-'}</td>
                  <td>{product.brandGroupData?.brand_group_name || getBrandGroupName(product.brand_group_id) || '-'}</td>
                  <td>{product.categoryData?.category_name || getCategoryName(product.category_id) || '-'}</td>
                  <td>{product.strengthData ? `${product.strengthData.strength_value}${product.strengthData.unit || 'mg'}` : getStrengthDisplay(product.strength_id) || '-'}</td>
                  <td>{product.packSizeData?.pack_size || getPackSizeDisplay(product.pack_size_id) || '-'}</td>
                  <td>₹{product.pts || '-'}</td>
                  <td>₹{product.ptr || '-'}</td>
                  <td>₹{product.mrp || '-'}</td>
                  <td>
                    <span className={`badge ${product.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {product.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {canEdit() && (
                    <td>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => showEditModal(product)}
                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      {canDelete() && (
                        <button
                          className="btn btn-outline-danger btn-sm ml-1"
                          onClick={() => handleDelete(product.id)}
                          style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                        >
                          <i className="fas fa-trash" style={{ fontSize: '0.75rem' }}></i>
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '900px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button className="close-btn" onClick={closeModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {/* Basic Info Section */}
                  <h5 className="mb-3" style={{ color: '#2c3e50', borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
                    Basic Information
                  </h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label htmlFor="unique_id">Unique ID</label>
                      <input
                        type="text"
                        id="unique_id"
                        name="unique_id"
                        className="form-control"
                        value={formData.unique_id}
                        onChange={handleInputChange}
                        placeholder="e.g., 00123"
                      />
                    </div>
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
                        placeholder="e.g., Osteoswift"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="short_name">Short Name *</label>
                      <input
                        type="text"
                        id="short_name"
                        name="short_name"
                        className="form-control"
                        value={formData.short_name}
                        onChange={handleInputChange}
                        placeholder="e.g., Ostf"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="code">Product Code</label>
                      <input
                        type="text"
                        id="code"
                        name="code"
                        className="form-control"
                        value={formData.code}
                        onChange={handleInputChange}
                        placeholder="Internal product code"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="division_id">Division</label>
                      <select
                        id="division_id"
                        name="division_id"
                        className="form-control"
                        value={formData.division_id}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Division</option>
                        {divisions.filter(d => d.status === 'active').map(div => (
                          <option key={div.id} value={div.id}>{div.division_name} ({div.short_name})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="brand_group_id">Brand Group</label>
                      <select
                        id="brand_group_id"
                        name="brand_group_id"
                        className="form-control"
                        value={formData.brand_group_id}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Brand Group</option>
                        {brandGroups.filter(bg => bg.status === 'active').map(bg => (
                          <option key={bg.id} value={bg.id}>{bg.brand_group_name} ({bg.short_name})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Product Details Section */}
                  <h5 className="mb-3 mt-4" style={{ color: '#2c3e50', borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
                    Product Details
                  </h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label htmlFor="category_id">Category</label>
                      <select
                        id="category_id"
                        name="category_id"
                        className="form-control"
                        value={formData.category_id}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Category</option>
                        {categories.filter(c => c.status === 'active').map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.category_name} ({cat.short_name})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="strength_id">Strength</label>
                      <select
                        id="strength_id"
                        name="strength_id"
                        className="form-control"
                        value={formData.strength_id}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Strength</option>
                        {strengths.filter(s => s.status === 'active').map(str => (
                          <option key={str.id} value={str.id}>{str.strength_value} {str.unit || 'mg'}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="pack_size_id">Pack Size</label>
                      <select
                        id="pack_size_id"
                        name="pack_size_id"
                        className="form-control"
                        value={formData.pack_size_id}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Pack Size</option>
                        {packSizes.filter(ps => ps.status === 'active').map(ps => (
                          <option key={ps.id} value={ps.id}>{ps.pack_size}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Pricing Section */}
                  <h5 className="mb-3 mt-4" style={{ color: '#2c3e50', borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
                    Pricing Information
                  </h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label htmlFor="pts">PTS (₹)</label>
                      <input
                        type="number"
                        id="pts"
                        name="pts"
                        className="form-control"
                        value={formData.pts}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        placeholder="Price to Stockist"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="ptr">PTR (₹)</label>
                      <input
                        type="number"
                        id="ptr"
                        name="ptr"
                        className="form-control"
                        value={formData.ptr}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        placeholder="Price to Retailer"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="mrp">MRP (₹)</label>
                      <input
                        type="number"
                        id="mrp"
                        name="mrp"
                        className="form-control"
                        value={formData.mrp}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        placeholder="Maximum Retail Price"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="nrv">NRV (₹)</label>
                      <input
                        type="number"
                        id="nrv"
                        name="nrv"
                        className="form-control"
                        value={formData.nrv}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        placeholder="Net Realizing Value"
                      />
                    </div>
                  </div>

                  {/* Additional Info Section */}
                  <h5 className="mb-3 mt-4" style={{ color: '#2c3e50', borderBottom: '1px solid #dee2e6', paddingBottom: '8px' }}>
                    Additional Information
                  </h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label htmlFor="launch_date">Launch Date</label>
                      <input
                        type="date"
                        id="launch_date"
                        name="launch_date"
                        className="form-control"
                        value={formData.launch_date}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="status">Status</label>
                      <select
                        id="status"
                        name="status"
                        className="form-control"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
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
                    <div className="form-group">
                      <label htmlFor="therapeuticClass">Therapeutic Class</label>
                      <input
                        type="text"
                        id="therapeuticClass"
                        name="therapeuticClass"
                        className="form-control"
                        value={formData.therapeuticClass}
                        onChange={handleInputChange}
                        placeholder="e.g., Antibiotic, Analgesic"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="hsnCode">HSN Code</label>
                      <input
                        type="text"
                        id="hsnCode"
                        name="hsnCode"
                        className="form-control"
                        value={formData.hsnCode}
                        onChange={handleInputChange}
                        placeholder="HSN code for tax"
                      />
                    </div>
                  </div>

                  {/* Description Fields */}
                  <div className="form-group mt-3">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      className="form-control"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="2"
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

                  {/* Price History Section - Only show when editing */}
                  {editingProduct && priceHistory.length > 0 && (
                    <>
                      <div className="d-flex justify-content-between align-items-center mt-4 mb-2">
                        <h5 className="mb-0" style={{ color: '#2c3e50' }}>
                          Price History
                        </h5>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setShowPriceHistory(!showPriceHistory)}
                        >
                          {showPriceHistory ? 'Hide' : 'Show'} History
                        </button>
                      </div>
                      {showPriceHistory && (
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          <table className="table table-sm table-bordered">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>PTS</th>
                                <th>PTR</th>
                                <th>MRP</th>
                                <th>NRV</th>
                                <th>Changed By</th>
                              </tr>
                            </thead>
                            <tbody>
                              {priceHistory.map((history, idx) => (
                                <tr key={idx}>
                                  <td>{new Date(history.effective_from).toLocaleDateString()}</td>
                                  <td>₹{history.pts || '-'}</td>
                                  <td>₹{history.ptr || '-'}</td>
                                  <td>₹{history.mrp || '-'}</td>
                                  <td>₹{history.nrv || '-'}</td>
                                  <td>{history.changedByUser?.name || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
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