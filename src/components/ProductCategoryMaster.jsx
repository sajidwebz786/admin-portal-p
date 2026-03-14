import React, { useState, useEffect } from 'react'
import adminAPI from '../services/apiService'

const ProductCategoryMaster = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    category_name: '',
    short_name: '',
    description: '',
    category_type: 'form',
    status: 'active'
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await adminAPI.getProductCategories()
      setCategories(response || [])
    } catch (error) {
      console.error('Error loading categories:', error)
      setError('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      category_name: '',
      short_name: '',
      description: '',
      category_type: 'form',
      status: 'active'
    })
    setEditingItem(null)
  }

  const showAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const showEditModal = (item) => {
    setFormData({
      category_name: item.category_name || '',
      short_name: item.short_name || '',
      description: item.description || '',
      category_type: item.category_type || 'form',
      status: item.status || 'active'
    })
    setEditingItem(item)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await adminAPI.updateProductCategory(editingItem.id, formData)
      } else {
        await adminAPI.createProductCategory(formData)
      }
      closeModal()
      loadCategories()
    } catch (error) {
      console.error('Error saving category:', error)
      setError('Failed to save category')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await adminAPI.deleteProductCategory(id)
        loadCategories()
      } catch (error) {
        console.error('Error deleting category:', error)
        setError(error.message || 'Failed to delete category')
      }
    }
  }

  const filteredItems = categories.filter(item =>
    item.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.short_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="section-content">
        <h2>Product Category Master</h2>
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i> Loading categories...
        </div>
      </div>
    )
  }

  return (
    <div className="section-content">
      <h2>Product Category Master</h2>

      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-secondary">
          <i className="fas fa-search"></i> Search
        </button>
      </div>

      <div className="management-actions mb-4 d-flex gap-3">
        <button className="btn btn-primary" onClick={showAddModal}>
          <i className="fas fa-plus"></i> Add Category
        </button>
        <button className="btn btn-info" onClick={loadCategories}>
          <i className="fas fa-sync"></i> Refresh
        </button>
      </div>

      <div className="management-table">
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th>Category Name</th>
              <th>Short Name</th>
              <th>Type</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  {categories.length === 0 ? 'No categories found.' : 'No categories match your search.'}
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.category_name}</td>
                  <td>{item.short_name || '-'}</td>
                  <td>{item.category_type || '-'}</td>
                  <td>{item.description || '-'}</td>
                  <td>
                    <span className={`badge ${item.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {item.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => showEditModal(item)}
                    >
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm ml-1"
                      onClick={() => handleDelete(item.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '500px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editingItem ? 'Edit Category' : 'Add New Category'}</h3>
                <button className="close-btn" onClick={closeModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="category_name">Category Name *</label>
                    <input
                      type="text"
                      id="category_name"
                      name="category_name"
                      className="form-control"
                      value={formData.category_name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Tablet, Capsule, Syrup, Injection"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="short_name">Short Name</label>
                    <input
                      type="text"
                      id="short_name"
                      name="short_name"
                      className="form-control"
                      value={formData.short_name}
                      onChange={handleInputChange}
                      placeholder="e.g., Tab, Cap, Syr, Inj"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="category_type">Category Type</label>
                    <select
                      id="category_type"
                      name="category_type"
                      className="form-control"
                      value={formData.category_type}
                      onChange={handleInputChange}
                    >
                      <option value="form">Form (Tablet, Syrup, etc.)</option>
                      <option value="therapeutic">Therapeutic</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
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
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingItem ? 'Update' : 'Save'}
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

export default ProductCategoryMaster