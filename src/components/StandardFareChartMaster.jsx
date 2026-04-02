import React, { useState, useEffect } from 'react'
import adminAPI from '../services/apiService'

const StandardFareChartMaster = () => {
  const [items, setItems] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    employee_name: '',
    employee_id: '',
    designation: 'MR',
    hq_type: 'Non-Metro',
    employee_status: 'Confirmed',
    da: '0',
    ex_allowance: '0',
    outstation_allowance: '0',
    hill_station_allowance: '0',
    meeting_allowance: '0',
    accommodation: '0',
    fare_per_km: '0',
    fare_0_to_70km: '0',
    fare_70_to_100km: '0',
    fare_above_100km: '0',
    mobile_allowance: '0',
    stationary_allowance: '0',
    effective_from: '',
    is_active: true
  })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const [chartResponse, usersResponse] = await Promise.all([
        adminAPI.getFareCharts(),
        adminAPI.getUsers()
      ])
      setItems(chartResponse || [])
      setUsers(usersResponse.users || usersResponse || [])
    } catch (error) {
      console.error('Error loading fare charts:', error)
      setError('Failed to load fare charts')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const resetForm = () => {
    setFormData({
      employee_name: '', employee_id: '', designation: 'MR', hq_type: 'Non-Metro',
      employee_status: 'Confirmed', da: '0', ex_allowance: '0', outstation_allowance: '0',
      hill_station_allowance: '0', meeting_allowance: '0', accommodation: '0',
      fare_per_km: '0', fare_0_to_70km: '0', fare_70_to_100km: '0', fare_above_100km: '0',
      mobile_allowance: '0', stationary_allowance: '0', effective_from: '', is_active: true
    })
    setEditingItem(null)
  }

  const showAddModal = () => { resetForm(); setShowModal(true) }

  const showEditModal = (item) => {
    setFormData({
      employee_name: item.employee_name || '',
      employee_id: item.employee_id || '',
      designation: item.designation || 'MR',
      hq_type: item.hq_type || 'Non-Metro',
      employee_status: item.employee_status || 'Confirmed',
      da: String(item.da || '0'),
      ex_allowance: String(item.ex_allowance || '0'),
      outstation_allowance: String(item.outstation_allowance || '0'),
      hill_station_allowance: String(item.hill_station_allowance || '0'),
      meeting_allowance: String(item.meeting_allowance || '0'),
      accommodation: String(item.accommodation || '0'),
      fare_per_km: String(item.fare_per_km || '0'),
      fare_0_to_70km: String(item.fare_0_to_70km || '0'),
      fare_70_to_100km: String(item.fare_70_to_100km || '0'),
      fare_above_100km: String(item.fare_above_100km || '0'),
      mobile_allowance: String(item.mobile_allowance || '0'),
      stationary_allowance: String(item.stationary_allowance || '0'),
      effective_from: item.effective_from || '',
      is_active: item.is_active !== false
    })
    setEditingItem(item)
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); resetForm() }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        da: parseFloat(formData.da) || 0,
        ex_allowance: parseFloat(formData.ex_allowance) || 0,
        outstation_allowance: parseFloat(formData.outstation_allowance) || 0,
        hill_station_allowance: parseFloat(formData.hill_station_allowance) || 0,
        meeting_allowance: parseFloat(formData.meeting_allowance) || 0,
        accommodation: parseFloat(formData.accommodation) || 0,
        fare_per_km: parseFloat(formData.fare_per_km) || 0,
        fare_0_to_70km: parseFloat(formData.fare_0_to_70km) || 0,
        fare_70_to_100km: parseFloat(formData.fare_70_to_100km) || 0,
        fare_above_100km: parseFloat(formData.fare_above_100km) || 0,
        mobile_allowance: parseFloat(formData.mobile_allowance) || 0,
        stationary_allowance: parseFloat(formData.stationary_allowance) || 0,
        employee_id: formData.employee_id || null
      }
      if (editingItem) {
        await adminAPI.updateFareChart(editingItem.id, data)
      } else {
        await adminAPI.createFareChart(data)
      }
      closeModal()
      loadData()
    } catch (error) {
      console.error('Error saving fare chart:', error)
      setError('Failed to save fare chart')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this fare chart?')) {
      try {
        await adminAPI.deleteFareChart(id)
        loadData()
      } catch (error) {
        setError(error.message || 'Failed to delete')
      }
    }
  }

  if (loading) {
    return <div className="section-content"><h2>Standard Fare Chart</h2><div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i> Loading...</div></div>
  }

  return (
    <div className="section-content">
      <h2>Standard Fare Chart</h2>
      {error && <div className="alert alert-danger"><i className="fas fa-exclamation-triangle"></i> {error}</div>}
      <div className="management-actions mb-4 d-flex gap-3">
        <button className="btn btn-primary" onClick={showAddModal}><i className="fas fa-plus"></i> Add Fare Chart</button>
        <button className="btn btn-info" onClick={loadData}><i className="fas fa-sync"></i> Refresh</button>
      </div>
      <div className="management-table" style={{ overflowX: 'auto' }}>
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th>Employee</th>
              <th>Designation</th>
              <th>HQ Type</th>
              <th>Status</th>
              <th>DA</th>
              <th>Fare/KM</th>
              <th>Fare 0-70</th>
              <th>Fare 70-100</th>
              <th>Fare &gt;100</th>
              <th>Mobile</th>
              <th>Stationary</th>
              <th>Effective From</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="13" className="text-center">No fare charts found.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} style={{ opacity: item.is_active ? 1 : 0.5 }}>
                  <td>{item.employee_name}</td>
                  <td>{item.designation}</td>
                  <td>{item.hq_type}</td>
                  <td><span className={`badge ${item.employee_status === 'Confirmed' ? 'badge-success' : 'badge-warning'}`}>{item.employee_status}</span></td>
                  <td>{item.da}</td>
                  <td>{item.fare_per_km}</td>
                  <td>{item.fare_0_to_70km}</td>
                  <td>{item.fare_70_to_100km}</td>
                  <td>{item.fare_above_100km}</td>
                  <td>{item.mobile_allowance}</td>
                  <td>{item.stationary_allowance}</td>
                  <td>{item.effective_from}</td>
                  <td>
                    <button className="btn btn-outline-primary btn-sm" onClick={() => showEditModal(item)}><i className="fas fa-edit"></i></button>
                    <button className="btn btn-outline-danger btn-sm ml-1" onClick={() => handleDelete(item.id)}><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '800px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editingItem ? 'Edit Fare Chart' : 'Add Fare Chart'}</h3>
                <button className="close-btn" onClick={closeModal}><i className="fas fa-times"></i></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Employee Name *</label>
                        <input type="text" name="employee_name" className="form-control" value={formData.employee_name} onChange={handleInputChange} required />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Employee (User)</label>
                        <select name="employee_id" className="form-control" value={formData.employee_id} onChange={handleInputChange}>
                          <option value="">-- Select Employee --</option>
                          {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.employeeId || u.email})</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Designation *</label>
                        <select name="designation" className="form-control" value={formData.designation} onChange={handleInputChange} required>
                          <option value="MR">MR</option>
                          <option value="TBM">TBM</option>
                          <option value="ABM">ABM</option>
                          <option value="RBM">RBM</option>
                          <option value="ZBM">ZBM</option>
                          <option value="NSM">NSM</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>HQ Type *</label>
                        <select name="hq_type" className="form-control" value={formData.hq_type} onChange={handleInputChange} required>
                          <option value="Metro">Metro</option>
                          <option value="Non-Metro">Non-Metro</option>
                          <option value="Semi Metro">Semi Metro</option>
                          <option value="Hill Station">Hill Station</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Employee Status *</label>
                        <select name="employee_status" className="form-control" value={formData.employee_status} onChange={handleInputChange} required>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Probation">Probation</option>
                          <option value="Notice">Notice</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <hr />
                  <h6>Allowances</h6>
                  <div className="row">
                    <div className="col-md-3"><div className="form-group"><label>DA (Daily)</label><input type="number" step="0.01" name="da" className="form-control" value={formData.da} onChange={handleInputChange} /></div></div>
                    <div className="col-md-3"><div className="form-group"><label>Ex-Allowance</label><input type="number" step="0.01" name="ex_allowance" className="form-control" value={formData.ex_allowance} onChange={handleInputChange} /></div></div>
                    <div className="col-md-3"><div className="form-group"><label>Outstation</label><input type="number" step="0.01" name="outstation_allowance" className="form-control" value={formData.outstation_allowance} onChange={handleInputChange} /></div></div>
                    <div className="col-md-3"><div className="form-group"><label>Hill Station</label><input type="number" step="0.01" name="hill_station_allowance" className="form-control" value={formData.hill_station_allowance} onChange={handleInputChange} /></div></div>
                  </div>
                  <div className="row">
                    <div className="col-md-3"><div className="form-group"><label>Meeting</label><input type="number" step="0.01" name="meeting_allowance" className="form-control" value={formData.meeting_allowance} onChange={handleInputChange} /></div></div>
                    <div className="col-md-3"><div className="form-group"><label>Accommodation</label><input type="number" step="0.01" name="accommodation" className="form-control" value={formData.accommodation} onChange={handleInputChange} /></div></div>
                    <div className="col-md-3"><div className="form-group"><label>Mobile</label><input type="number" step="0.01" name="mobile_allowance" className="form-control" value={formData.mobile_allowance} onChange={handleInputChange} /></div></div>
                    <div className="col-md-3"><div className="form-group"><label>Stationary</label><input type="number" step="0.01" name="stationary_allowance" className="form-control" value={formData.stationary_allowance} onChange={handleInputChange} /></div></div>
                  </div>
                  <hr />
                  <h6>Fare Rates</h6>
                  <div className="row">
                    <div className="col-md-3"><div className="form-group"><label>Fare/KM</label><input type="number" step="0.01" name="fare_per_km" className="form-control" value={formData.fare_per_km} onChange={handleInputChange} /></div></div>
                    <div className="col-md-3"><div className="form-group"><label>Fare 0-70km</label><input type="number" step="0.01" name="fare_0_to_70km" className="form-control" value={formData.fare_0_to_70km} onChange={handleInputChange} /></div></div>
                    <div className="col-md-3"><div className="form-group"><label>Fare 70-100km</label><input type="number" step="0.01" name="fare_70_to_100km" className="form-control" value={formData.fare_70_to_100km} onChange={handleInputChange} /></div></div>
                    <div className="col-md-3"><div className="form-group"><label>Fare &gt;100km</label><input type="number" step="0.01" name="fare_above_100km" className="form-control" value={formData.fare_above_100km} onChange={handleInputChange} /></div></div>
                  </div>
                  <hr />
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Effective From *</label>
                        <input type="date" name="effective_from" className="form-control" value={formData.effective_from} onChange={handleInputChange} required />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group" style={{ paddingTop: '2rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} />
                          Active
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingItem ? 'Update' : 'Save'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StandardFareChartMaster
