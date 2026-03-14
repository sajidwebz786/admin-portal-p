import React, { useState, useEffect } from 'react'
import adminAPI from '../services/apiService'

const BrandGroupMaster = () => {
  const [brandGroups, setBrandGroups] = useState([])
  const [divisions, setDivisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    brand_group_name: '',
    short_name: '',
    description: '',
    division_id: '',
    status: 'active'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const [groupsRes, divisionsRes] = await Promise.all([
        adminAPI.getBrandGroups(),
        adminAPI.getDivisions()
      ])
      setBrandGroups(groupsRes || [])
      setDivisions(divisionsRes || [])
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load data')
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
      brand_group_name: '',
      short_name: '',
      description: '',
      division_id: '',
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
      brand_group_name: item.brand_group_name || '',
      short_name: item.short_name || '',
      description: item.description || '',
      division_id: item.division_id || '',
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
        division_id: formData.division_id ? parseInt(formData.division_id) : null
      }
      if (editingItem) {
        await adminAPI.updateBrandGroup(editingItem.id, data)
      } else {
        await adminAPI.createBrandGroup(data)
      }
      closeModal()
      loadData()
    } catch (error) {
      console.error('Error saving brand group:', error)
      setError('Failed to save brand group')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this brand group?')) {
      try {
        await adminAPI.deleteBrandGroup(id)
        loadData()
      } catch (error) {
        console.error('Error deleting brand group:', error)
        setError(error.message || 'Failed to delete brand group')
      }
    }
  }

  const filteredItems = brandGroups.filter(item =>
    item.brand_group_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.short_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getDivisionName = (divisionId) => {
    const division = divisions.find(d => d.id === divisionId)
    return division ? division.division_name : '-'
  }

  if (loading) {
    return (
      <div className="section-content">
        <h2>Brand Group Master</h2>
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i> Loading brand groups...
        </div>
      </div>
    )
  }

  return (
    <div className="section-content">
      <h2>Brand Group Master</h2>

      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search brand groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-secondary">
          <i className="fas fa-search"></i> Search
        </button>
      </div>

      <div className="management-actions mb-4 d-flex gap-3">
        <button className="btn btn-primary" onClick={showAddModal}>
          <i className="fas fa-plus"></i> Add Brand Group
        </button>
        <button className="btn btn-info" onClick={loadData}>
          <i className="fas fa-sync"></i> Refresh
        </button>
      </div>

      <div className="management-table">
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th>Brand Group Name</th>
              <th>Short Name</th>
              <th>Division</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  {brandGroups.length === 0 ? 'No brand groups found.' : 'No brand groups match your search.'}
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.brand_group_name}</td>
                  <td>{item.short_name || '-'}</td>
                  <td>{item.division?.division_name || getDivisionName(item.division_id) || '-'}</td>
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
                <h3>{editingItem ? 'Edit Brand Group' : 'Add New Brand Group'}</h3>
                <button className="close-btn" onClick={closeModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="brand_group_name">Brand Group Name *</label>
                    <input
                      type="text"
                      id="brand_group_name"
                      name="brand_group_name"
                      className="form-control"
                      value={formData.brand_group_name}
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
                        <option key={div.id} value={div.id}>{div.division_name}</option>
                      ))}
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

export default BrandGroupMaster