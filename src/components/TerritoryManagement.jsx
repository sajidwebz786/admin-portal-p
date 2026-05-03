import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import adminAPI from '../services/apiService'

const TerritoryManagement = ({ mode = 'management' }) => {
  const [territories, setTerritories] = useState([])
  const [headquarters, setHeadquarters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTerritory, setEditingTerritory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    hq_id: '',
    region: '',
    state: '',
    stateType: 'State',
    zone: '',
    district: '',
    description: '',
    isActive: true
  })
  const isAdditionMode = mode === 'addition'
  const isDeletionMode = mode === 'deletion'
  const title = isAdditionMode ? 'Patch / Route Addition' : isDeletionMode ? 'Patch / Route Deletion' : 'Patch/Route Master'
  const subtitle = isAdditionMode
    ? 'Create only new patch or route records from this screen.'
    : isDeletionMode
      ? 'Search existing patch or route records and submit only deletion requests.'
      : ''

  useEffect(() => {
    loadTerritories()
    loadHeadquarters()
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

  const loadHeadquarters = async () => {
    try {
      const response = await adminAPI.getHeadquarters()
      const hqData = response.headquarters || response || []
      setHeadquarters(hqData.filter(hq => hq.isActive))
    } catch (error) {
      console.error('Error loading headquarters:', error)
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
      hq_id: '',
      region: '',
      state: '',
      stateType: 'State',
      zone: '',
      district: '',
      description: '',
      isActive: true
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
      hq_id: territory.hq_id || '',
      region: territory.region,
      state: territory.state,
      stateType: territory.stateType || 'State',
      zone: territory.zone || '',
      district: territory.district,
      description: territory.description || '',
      isActive: territory.isActive !== false
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
      loadTerritories()
    } catch (error) {
      console.error('Error saving territory:', error)
      setError('Failed to save territory: ' + (error.message || 'Unknown error'))
    }
  }

  const handleDelete = async (territoryId) => {
    if (window.confirm('Are you sure you want to delete this territory?')) {
      try {
        await adminAPI.deleteTerritory(territoryId)
        loadTerritories()
      } catch (error) {
        console.error('Error deleting territory:', error)
        setError('Failed to delete territory: ' + (error.message || 'Unknown error'))
      }
    }
  }

  const filteredTerritories = territories.filter(territory =>
    territory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    territory.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (territory.region && territory.region.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (territory.state && territory.state.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (territory.headquarter && territory.headquarter.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="section-content">
        <h2>{title}</h2>
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i> Loading territories...
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
          <button className="btn btn-secondary" type="button" onClick={loadTerritories}>Refresh</button>
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
          placeholder="Search territories by name, code, region, state or HQ..."
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
            <i className="fas fa-plus"></i> Add New Patch/Route
          </button>
        </div>
      )}

      <div className="management-table">
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>HQ</th>
              <th>Region</th>
              <th>State/UT</th>
              <th>Zone</th>
              <th>District</th>
              <th>Status</th>
              {!isAdditionMode && <th>{isDeletionMode ? 'Deletion Action' : 'Actions'}</th>}
            </tr>
          </thead>
          <tbody>
            {filteredTerritories.length === 0 ? (
              <tr>
                <td colSpan={isAdditionMode ? '8' : '9'} className="text-center">
                  {territories.length === 0 ? 'No territories found.' : 'No territories match your search.'}
                </td>
              </tr>
            ) : (
              filteredTerritories.map((territory) => (
                <tr key={territory.id}>
                  <td>{territory.name}</td>
                  <td>{territory.code}</td>
                  <td>{territory.headquarter?.name || '-'}</td>
                  <td>{territory.region}</td>
                  <td>
                    {territory.state}
                    {territory.stateType && territory.stateType !== 'State' && (
                      <span className="badge badge-info" style={{ marginLeft: '3px', fontSize: '0.6rem' }}>
                        UT
                      </span>
                    )}
                  </td>
                  <td>{territory.zone || '-'}</td>
                  <td>{territory.district}</td>
                  <td>
                    <span className={`badge ${territory.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {territory.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {!isAdditionMode && (
                    <td>
                      {!isDeletionMode && (
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => showEditModal(territory)}
                          style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      )}
                      <button
                        className="btn btn-outline-danger btn-sm ml-1"
                        onClick={() => handleDelete(territory.id)}
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}
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

      {/* Territory Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '700px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editingTerritory ? 'Edit Patch/Route' : 'Add New Patch/Route'}</h3>
                <button className="close-btn" onClick={closeModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label htmlFor="name">Patch/Route Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Bhubaneswar East"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="code">Patch/Route Code *</label>
                      <input
                        type="text"
                        id="code"
                        name="code"
                        className="form-control"
                        value={formData.code}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. BBSR-EST-01"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="hq_id">Head Quarter *</label>
                      <select
                        id="hq_id"
                        name="hq_id"
                        className="form-control"
                        value={formData.hq_id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select HQ</option>
                        {headquarters.map(hq => (
                          <option key={hq.id} value={hq.id}>
                            {hq.name} ({hq.code})
                          </option>
                        ))}
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
                        placeholder="e.g. East Region"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="zone">Zone</label>
                      <select
                        id="zone"
                        name="zone"
                        className="form-control"
                        value={formData.zone}
                        onChange={handleInputChange}
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
                      <label htmlFor="state">State/Union Territory *</label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        className="form-control"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Odisha"
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
                      <label htmlFor="stateType">State Type</label>
                      <select
                        id="stateType"
                        name="stateType"
                        className="form-control"
                        value={formData.stateType}
                        onChange={handleInputChange}
                      >
                        <option value="State">State</option>
                        <option value="Union Territory">Union Territory</option>
                      </select>
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
                        placeholder="e.g. Khordha"
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '12px' }}>
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
                  <div className="form-group" style={{ marginTop: '8px' }}>
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
                    {editingTerritory ? 'Update' : 'Save'}
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
