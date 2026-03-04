import React, { useState, useEffect } from 'react'
import adminAPI from '../services/apiService'

const HeadquarterManagement = () => {
  const [headquarters, setHeadquarters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingHeadquarter, setEditingHeadquarter] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'Branch Office',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    manager: '',
    region: '',
    zone: '',
    territoryCount: 0,
    employeeCount: 0
  })

  useEffect(() => {
    loadHeadquarters()
  }, [])

  const loadHeadquarters = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await adminAPI.getHeadquarters()
      const headquartersData = response.headquarters || response || []
      setHeadquarters(headquartersData)
    } catch (error) {
      console.error('Error loading headquarters:', error)
      setError('Failed to load headquarters. Please ensure you are logged in.')
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
      type: 'Branch Office',
      address: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      email: '',
      manager: '',
      region: '',
      zone: '',
      territoryCount: 0,
      employeeCount: 0
    })
    setEditingHeadquarter(null)
  }

  const showAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const showEditModal = (headquarter) => {
    setFormData({
      name: headquarter.name,
      code: headquarter.code,
      type: headquarter.type,
      address: headquarter.address,
      city: headquarter.city,
      state: headquarter.state,
      pincode: headquarter.pincode,
      phone: headquarter.phone,
      email: headquarter.email || '',
      manager: headquarter.manager,
      region: headquarter.region,
      zone: headquarter.zone,
      territoryCount: headquarter.territoryCount || 0,
      employeeCount: headquarter.employeeCount || 0
    })
    setEditingHeadquarter(headquarter)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingHeadquarter) {
        await adminAPI.updateHeadquarter(editingHeadquarter.id, formData)
      } else {
        await adminAPI.createHeadquarter(formData)
      }

      closeModal()
      loadHeadquarters() // Refresh the headquarters list
    } catch (error) {
      console.error('Error saving headquarter:', error)
      setError('Failed to save headquarter')
    }
  }

  const handleDelete = async (headquarterId) => {
    if (window.confirm('Are you sure you want to delete this headquarter?')) {
      try {
        await adminAPI.deleteHeadquarter(headquarterId)
        loadHeadquarters() // Refresh the headquarters list
      } catch (error) {
        console.error('Error deleting headquarter:', error)
        setError('Failed to delete headquarter')
      }
    }
  }

  const filteredHeadquarters = headquarters.filter(headquarter =>
    headquarter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    headquarter.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    headquarter.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    headquarter.region.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="section-content">
        <h2>Headquarter Management</h2>
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i> Loading headquarters...
        </div>
      </div>
    )
  }

  return (
    <div className="section-content">
      <h2>Headquarter Management</h2>

      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search headquarters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-secondary">
          <i className="fas fa-search"></i> Search
        </button>
      </div>

      <div className="management-actions mb-4 d-flex gap-3">
        <button className="btn btn-primary" onClick={showAddModal}>
          <i className="fas fa-plus"></i> Add New Headquarter
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
              <th>Type</th>
              <th>City</th>
              <th>State</th>
              <th>Manager</th>
              <th>Region</th>
              <th>Territories</th>
              <th>Employees</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHeadquarters.length === 0 ? (
              <tr>
                <td colSpan="11" className="text-center">
                  {headquarters.length === 0 ? 'No headquarters found.' : 'No headquarters match your search.'}
                </td>
              </tr>
            ) : (
              filteredHeadquarters.map((headquarter) => (
                <tr key={headquarter.id}>
                  <td>{headquarter.name}</td>
                  <td>{headquarter.code}</td>
                  <td>{headquarter.type}</td>
                  <td>{headquarter.city}</td>
                  <td>{headquarter.state}</td>
                  <td>{headquarter.manager}</td>
                  <td>{headquarter.region}</td>
                  <td>{headquarter.territoryCount}</td>
                  <td>{headquarter.employeeCount}</td>
                  <td>
                    <span className={`badge ${headquarter.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {headquarter.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => showEditModal(headquarter)}
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                    >
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm ml-1"
                      onClick={() => handleDelete(headquarter.id)}
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                    >
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Headquarter Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '800px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editingHeadquarter ? 'Edit Headquarter' : 'Add New Headquarter'}</h3>
                <button className="close-btn" onClick={closeModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label htmlFor="name">Headquarter Name *</label>
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
                      <label htmlFor="code">Headquarter Code *</label>
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
                      <label htmlFor="type">Type *</label>
                      <select
                        id="type"
                        name="type"
                        className="form-control"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Head Office">Head Office</option>
                        <option value="Regional Office">Regional Office</option>
                        <option value="Zonal Office">Zonal Office</option>
                        <option value="Branch Office">Branch Office</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="manager">Manager *</label>
                      <input
                        type="text"
                        id="manager"
                        name="manager"
                        className="form-control"
                        value={formData.manager}
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
                      <label htmlFor="zone">Zone *</label>
                      <input
                        type="text"
                        id="zone"
                        name="zone"
                        className="form-control"
                        value={formData.zone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '15px' }}>
                    <label htmlFor="address">Address *</label>
                    <textarea
                      id="address"
                      name="address"
                      className="form-control"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      rows="3"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '15px' }}>
                    <div className="form-group">
                      <label htmlFor="city">City *</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        className="form-control"
                        value={formData.city}
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
                      <label htmlFor="pincode">Pincode *</label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        className="form-control"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        required
                        pattern="[0-9]{6}"
                        maxLength="6"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                    <div className="form-group">
                      <label htmlFor="phone">Phone *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="form-control"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                    <div className="form-group">
                      <label htmlFor="territoryCount">Territory Count</label>
                      <input
                        type="number"
                        id="territoryCount"
                        name="territoryCount"
                        className="form-control"
                        value={formData.territoryCount}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="employeeCount">Employee Count</label>
                      <input
                        type="number"
                        id="employeeCount"
                        name="employeeCount"
                        className="form-control"
                        value={formData.employeeCount}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingHeadquarter ? 'Update Headquarter' : 'Save Headquarter'}
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

export default HeadquarterManagement