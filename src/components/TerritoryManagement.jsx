import React, { useState, useEffect } from 'react'
import adminAPI from '../services/apiService'

const TerritoryManagement = () => {
  const [territories, setTerritories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTerritory, setEditingTerritory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    region: '',
    state: '',
    district: '',
    description: ''
  })

  useEffect(() => {
    loadTerritories()
  }, [])

  const loadTerritories = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await adminAPI.getTerritories()
      const territoriesData = response.territories || response || []
      setTerritories(territoriesData)
    } catch (error) {
      console.error('Error loading territories:', error)
      setError('Failed to load territories. Please ensure you are logged in.')
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
      region: '',
      state: '',
      district: '',
      description: ''
    })
    setEditingTerritory(null)
  }

  const showAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const showEditModal = (territory) => {
    setFormData({
      name: territory.name,
      code: territory.code,
      region: territory.region,
      state: territory.state,
      district: territory.district,
      description: territory.description || ''
    })
    setEditingTerritory(territory)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingTerritory) {
        await adminAPI.updateTerritory(editingTerritory.id, formData)
      } else {
        await adminAPI.createTerritory(formData)
      }

      closeModal()
      loadTerritories() // Refresh the territories list
    } catch (error) {
      console.error('Error saving territory:', error)
      setError('Failed to save territory')
    }
  }

  const handleDelete = async (territoryId) => {
    if (window.confirm('Are you sure you want to delete this territory?')) {
      try {
        await adminAPI.deleteTerritory(territoryId)
        loadTerritories() // Refresh the territories list
      } catch (error) {
        console.error('Error deleting territory:', error)
        setError('Failed to delete territory')
      }
    }
  }

  const filteredTerritories = territories.filter(territory =>
    territory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    territory.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    territory.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    territory.state.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="section-content">
        <h2>Territory Management</h2>
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i> Loading territories...
        </div>
      </div>
    )
  }

  return (
    <div className="section-content">
      <h2>Territory Management</h2>

      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search territories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-secondary">
          <i className="fas fa-search"></i> Search
        </button>
      </div>

      <div className="management-actions mb-4 d-flex gap-3">
        <button className="btn btn-primary" onClick={showAddModal}>
          <i className="fas fa-plus"></i> Add New Territory
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
              <th>Region</th>
              <th>State</th>
              <th>District</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTerritories.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  {territories.length === 0 ? 'No territories found.' : 'No territories match your search.'}
                </td>
              </tr>
            ) : (
              filteredTerritories.map((territory) => (
                <tr key={territory.id}>
                  <td>{territory.name}</td>
                  <td>{territory.code}</td>
                  <td>{territory.region}</td>
                  <td>{territory.state}</td>
                  <td>{territory.district}</td>
                  <td>
                    <span className={`badge ${territory.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {territory.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => showEditModal(territory)}
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                    >
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm ml-1"
                      onClick={() => handleDelete(territory.id)}
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

      {/* Territory Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editingTerritory ? 'Edit Territory' : 'Add New Territory'}</h3>
                <button className="close-btn" onClick={closeModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="name">Territory Name *</label>
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
                    <label htmlFor="code">Territory Code *</label>
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
                    <label htmlFor="region">Region *</label>
                    <input
                      type="text"
                      id="region"
                      name="region"
                      className="form-control"
                      value={formData.region}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="state">State *</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      className="form-control"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="district">District *</label>
                    <input
                      type="text"
                      id="district"
                      name="district"
                      className="form-control"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
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
                      rows="3"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingTerritory ? 'Update Territory' : 'Save Territory'}
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

export default TerritoryManagement