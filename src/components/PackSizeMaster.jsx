import React, { useState, useEffect } from 'react'
import adminAPI from '../services/apiService'

const PackSizeMaster = () => {
  const [packSizes, setPackSizes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    pack_size: '',
    short_name: '',
    display_order: 0,
    status: 'active'
  })

  useEffect(() => {
    loadPackSizes()
  }, [])

  const loadPackSizes = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await adminAPI.getPackSizes()
      setPackSizes(response || [])
    } catch (error) {
      console.error('Error loading pack sizes:', error)
      setError('Failed to load pack sizes')
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
      pack_size: '',
      short_name: '',
      display_order: 0,
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
      pack_size: item.pack_size || '',
      short_name: item.short_name || '',
      display_order: item.display_order || 0,
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
      const data = {
        ...formData,
        display_order: parseInt(formData.display_order) || 0
      }
      if (editingItem) {
        await adminAPI.updatePackSize(editingItem.id, data)
      } else {
        await adminAPI.createPackSize(data)
      }
      closeModal()
      loadPackSizes()
    } catch (error) {
      console.error('Error saving pack size:', error)
      setError('Failed to save pack size')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this pack size?')) {
      try {
        await adminAPI.deletePackSize(id)
        loadPackSizes()
      } catch (error) {
        console.error('Error deleting pack size:', error)
        setError(error.message || 'Failed to delete pack size')
      }
    }
  }

  const filteredItems = packSizes.filter(item =>
    item.pack_size?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.short_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="section-content">
        <h2>Pack Size Master</h2>
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i> Loading pack sizes...
        </div>
      </div>
    )
  }

  return (
    <div className="section-content">
      <h2>Pack Size Master</h2>

      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search pack sizes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-secondary">
          <i className="fas fa-search"></i> Search
        </button>
      </div>

      <div className="management-actions mb-4 d-flex gap-3">
        <button className="btn btn-primary" onClick={showAddModal}>
          <i className="fas fa-plus"></i> Add Pack Size
        </button>
        <button className="btn btn-info" onClick={loadPackSizes}>
          <i className="fas fa-sync"></i> Refresh
        </button>
      </div>

      <div className="management-table">
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th>Pack Size</th>
              <th>Short Name</th>
              <th>Display Order</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">
                  {packSizes.length === 0 ? 'No pack sizes found.' : 'No pack sizes match your search.'}
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.pack_size}</td>
                  <td>{item.short_name || '-'}</td>
                  <td>{item.display_order || 0}</td>
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
                <h3>{editingItem ? 'Edit Pack Size' : 'Add New Pack Size'}</h3>
                <button className="close-btn" onClick={closeModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="pack_size">Pack Size *</label>
                    <input
                      type="text"
                      id="pack_size"
                      name="pack_size"
                      className="form-control"
                      value={formData.pack_size}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., 10 tablets, 100ml, 5 strips"
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
                      placeholder="e.g., 10tab, 100ml"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="display_order">Display Order</label>
                    <input
                      type="number"
                      id="display_order"
                      name="display_order"
                      className="form-control"
                      value={formData.display_order}
                      onChange={handleInputChange}
                      min="0"
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

export default PackSizeMaster