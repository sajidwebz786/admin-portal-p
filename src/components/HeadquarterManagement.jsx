import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import adminAPI from '../services/apiService'

const HeadquarterManagement = ({ mode = 'management' }) => {
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
    stateType: 'State',
    pincode: '',
    phone: '',
    email: '',
    manager: '',
    region: '',
    zone: '',
    territoryCount: 0,
    employeeCount: 0,
    isActive: true
  })
  const isAdditionMode = mode === 'addition'
  const isDeletionMode = mode === 'deletion'
  const title = isAdditionMode ? 'HQ Addition' : isDeletionMode ? 'HQ Deletion' : 'Headquarter Master'
  const subtitle = isAdditionMode
    ? 'Create only new headquarters from this screen.'
    : isDeletionMode
      ? 'Search existing headquarters and submit only deletion requests.'
      : ''

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
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      stateType: 'State',
      pincode: '',
      phone: '',
      email: '',
      manager: '',
      region: '',
      zone: '',
      reason: '',
      territoryCount: 0,
      employeeCount: 0,
      isActive: true
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
      type: headquarter.type || 'Branch Office',
      address: headquarter.address || '',
      city: headquarter.city || '',
      state: headquarter.state,
      stateType: headquarter.stateType || 'State',
      pincode: headquarter.pincode || '',
      phone: headquarter.phone || '',
      email: headquarter.email || '',
      manager: headquarter.manager || '',
      region: headquarter.region,
      zone: headquarter.zone,
      territoryCount: headquarter.territoryCount || 0,
      employeeCount: headquarter.employeeCount || 0,
      isActive: headquarter.isActive !== false
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
      loadHeadquarters()
    } catch (error) {
      console.error('Error saving headquarter:', error)
      setError('Failed to save headquarter: ' + (error.message || 'Unknown error'))
    }
  }

  const handleDelete = async (headquarterId) => {
    if (window.confirm('Are you sure you want to delete this headquarter?')) {
      try {
        await adminAPI.deleteHeadquarter(headquarterId)
        loadHeadquarters()
      } catch (error) {
        console.error('Error deleting headquarter:', error)
        setError('Failed to delete headquarter: ' + (error.message || 'Unknown error'))
      }
    }
  }

  const filteredHeadquarters = headquarters.filter(headquarter =>
    headquarter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    headquarter.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (headquarter.state && headquarter.state.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (headquarter.zone && headquarter.zone.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (headquarter.region && headquarter.region.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="section-content">
        <h2>{title}</h2>
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i> Loading headquarters...
        </div>
      </div>
    )
  }

  return (
    <div className="section-content">
      <div className={`operation-mode-header ${isDeletionMode ? 'deletion' : isAdditionMode ? 'addition' : ''}`}>
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="operation-header-actions">
          {(isAdditionMode || isDeletionMode) && <Link to="/addition-deletion-control" className="btn btn-light">Back</Link>}
          <button className="btn btn-secondary" type="button" onClick={loadHeadquarters}>Refresh</button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search headquarters by name, code, state, zone or region..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-secondary">
          <i className="fas fa-search"></i> Search
        </button>
      </div>

      {isAdditionMode && (
        <div className="management-actions mb-4 d-flex gap-3">
          <button className="btn btn-primary" onClick={showAddModal}>
            <i className="fas fa-plus"></i> Add New HQ
          </button>
        </div>
      )}

      <div className="management-table">
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th>HQ Name</th>
              <th>Code</th>
              <th>Type</th>
              <th>State/UT</th>
              <th>Zone</th>
              <th>Region</th>
              <th>Territories</th>
              <th>Status</th>
              {!isAdditionMode && <th>{isDeletionMode ? 'Deletion Action' : 'Actions'}</th>}
            </tr>
          </thead>
          <tbody>
            {filteredHeadquarters.length === 0 ? (
              <tr>
                <td colSpan={isAdditionMode ? '8' : '9'} className="text-center">
                  {headquarters.length === 0 ? 'No headquarters found.' : 'No headquarters match your search.'}
                </td>
              </tr>
            ) : (
              filteredHeadquarters.map((headquarter) => (
                <tr key={headquarter.id}>
                  <td>{headquarter.name}</td>
                  <td>{headquarter.code}</td>
                  <td>{headquarter.type}</td>
                  <td>
                    {headquarter.state}
                    {headquarter.stateType && headquarter.stateType !== 'State' && (
                      <span className="badge badge-info" style={{ marginLeft: '5px', fontSize: '0.65rem' }}>
                        {headquarter.stateType}
                      </span>
                    )}
                  </td>
                  <td>{headquarter.zone}</td>
                  <td>{headquarter.region}</td>
                  <td>{headquarter.territories?.length || headquarter.territoryCount || 0}</td>
                  <td>
                    <span className={`badge ${headquarter.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {headquarter.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {!isAdditionMode && (
                    <td>
                      {!isDeletionMode && (
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => showEditModal(headquarter)}
                          style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                      )}
                      <button
                        className="btn btn-outline-danger btn-sm ml-1"
                        onClick={() => handleDelete(headquarter.id)}
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                      >
                        <i className="fas fa-trash"></i>{' '}{isDeletionMode ? 'Delete' : ''}
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Headquarter Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '850px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editingHeadquarter ? 'Edit Headquarter' : 'Add New Headquarter'}</h3>
                <button className="close-btn" onClick={closeModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label htmlFor="name">HQ Name *</label>
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
                      <label htmlFor="code">HQ Code *</label>
                      <input
                        type="text"
                        id="code"
                        name="code"
                        className="form-control"
                        value={formData.code}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. BBSR, DEL-CEN"
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
                        <option value="Metro">Metro</option>
                        <option value="Non Metro">Non Metro</option>
                        <option value="Hill Station">Hill Station</option>
                        <option value="Semi Metro">Semi Metro</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="zone">Zone *</label>
                      <select
                        id="zone"
                        name="zone"
                        className="form-control"
                        value={formData.zone}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Zone</option>
                        <option value="North">North</option>
                        <option value="South">South</option>
                        <option value="East">East</option>
                        <option value="West">West</option>
                        <option value="Central">Central</option>
                        <option value="North-East">North-East</option>
                      </select>
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
                        placeholder="e.g. East Region, West Region"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="state">State/Union Territory *</label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        className="form-control"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Odisha, Delhi"
                        list="states-list"
                      />
                      <datalist id="states-list">
                        <option value="Andhra Pradesh" />
                        <option value="Arunachal Pradesh" />
                        <option value="Assam" />
                        <option value="Bihar" />
                        <option value="Chhattisgarh" />
                        <option value="Goa" />
                        <option value="Gujarat" />
                        <option value="Haryana" />
                        <option value="Himachal Pradesh" />
                        <option value="Jharkhand" />
                        <option value="Karnataka" />
                        <option value="Kerala" />
                        <option value="Madhya Pradesh" />
                        <option value="Maharashtra" />
                        <option value="Manipur" />
                        <option value="Meghalaya" />
                        <option value="Mizoram" />
                        <option value="Nagaland" />
                        <option value="Odisha" />
                        <option value="Punjab" />
                        <option value="Rajasthan" />
                        <option value="Sikkim" />
                        <option value="Tamil Nadu" />
                        <option value="Telangana" />
                        <option value="Tripura" />
                        <option value="Uttar Pradesh" />
                        <option value="Uttarakhand" />
                        <option value="West Bengal" />
                        <option value="Delhi" />
                        <option value="Jammu & Kashmir" />
                        <option value="Ladakh" />
                        <option value="Chandigarh" />
                        <option value="Puducherry" />
                        <option value="Andaman & Nicobar Islands" />
                        <option value="Dadra & Nagar Haveli and Daman & Diu" />
                        <option value="Lakshadweep" />
                      </datalist>
                    </div>
                    <div className="form-group">
                      <label htmlFor="stateType">State Type *</label>
                      <select
                        id="stateType"
                        name="stateType"
                        className="form-control"
                        value={formData.stateType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="State">State</option>
                        <option value="Union Territory">Union Territory</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <label htmlFor="address">Address</label>
                    <textarea
                      id="address"
                      name="address"
                      className="form-control"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
                    <div className="form-group">
                      <label htmlFor="city">City</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        className="form-control"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="pincode">Pincode</label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        className="form-control"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        maxLength="6"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="manager">Manager</label>
                      <input
                        type="text"
                        id="manager"
                        name="manager"
                        className="form-control"
                        value={formData.manager}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                    <div className="form-group">
                      <label htmlFor="phone">Phone</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="form-control"
                        value={formData.phone}
                        onChange={handleInputChange}
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
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

                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <label>
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        style={{ marginRight: '8px' }}
                      />
                      Active
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingHeadquarter ? 'Update HQ' : 'Save HQ'}
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
