import React, { useState, useEffect } from 'react'
import adminAPI from '../services/apiService'

const DivisionMaster = () => {
  const [divisions, setDivisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    division_name: '',
    short_name: '',
    description: '',
    code: '',
    status: 'active'
  })

  useEffect(() => {
    loadDivisions()
  }, [])

  const loadDivisions = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await adminAPI.getDivisions()
      setDivisions(response || [])
    } catch (error) {
      console.error('Error loading divisions:', error)
      setError('Failed to load divisions')
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
      division_name: '',
      short_name: '',
      description: '',
      code: '',
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
      division_name: item.division_name || '',
      short_name: item.short_name || '',
      description: item.description || '',
      code: item.code || '',
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
        await adminAPI.updateDivision(editingItem.id, formData)
      } else {
        await adminAPI.createDivision(formData)
      }
      closeModal()
      loadDivisions()
    } catch (error) {
      console.error('Error saving division:', error)
      setError('Failed to save division')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this division?')) {
      try {
        await adminAPI.deleteDivision(id)
        loadDivisions()
      } catch (error) {
        console.error('Error deleting division:', error)
        setError(error.message || 'Failed to delete division')
      }
    }
  }

  const filteredItems = divisions.filter(item =>
    item.division_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.short_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="section-content">
        <h2>Division Master</h2>
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i> Loading divisions...
        </div>
      </div>
    )
  }

  return (
    <div className="section-content">
      <h2>Division Master</h2>

      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search divisions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-secondary">
          <i className="fas fa-search"></i> Search
        </button>
      </div>

      <div className="management-actions mb-4 d-flex gap-3">
        <button className="btn btn-primary" onClick={showAddModal}>
          <i className="fas fa-plus"></i> Add Division
        </button>
        <button className="btn btn-info" onClick={loadDivisions}>
          <i className="fas fa-sync"></i> Refresh
        </button>
      </div>

      <div className="management-table">
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th>Division Name</th>
              <th>Short Name</th>
              <th>Code</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  {divisions.length === 0 ? 'No divisions found.' : 'No divisions match your search.'}
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.division_name}</td>
                  <td>{item.short_name || '-'}</td>
                  <td>{item.code || '-'}</td>
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
                <h3>{editingItem ? 'Edit Division' : 'Add New Division'}</h3>
                <button className="close-btn" onClick={closeModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="division_name">Division Name *</label>
                    <input
                      type="text"
                      id="division_name"
                      name="division_name"
                      className="form-control"
                      value={formData.division_name}
                      onChange={handleInputChange}
                      required
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
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="code">Code</label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      className="form-control"
                      value={formData.code}
                      onChange={handleInputChange}
                    />
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

export default DivisionMaster