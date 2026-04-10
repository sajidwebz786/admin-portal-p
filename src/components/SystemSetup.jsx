import React, { useState, useEffect } from 'react'
import adminAPI from '../services/apiService'

const SystemSetup = () => {
  const [activeTab, setActiveTab] = useState('call-average')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const tabs = [
    { id: 'call-average', label: 'Call Average Setup', icon: 'fas fa-phone-alt' },
    { id: 'coverage', label: 'Coverage Setup', icon: 'fas fa-percentage' },
    { id: 'work-type', label: 'Work Type Setup', icon: 'fas fa-briefcase' },
    { id: 'leave-policy', label: 'Leave Policy', icon: 'fas fa-calendar-minus' }
  ]

  return (
    <div className="section-content">
      <h2><i className="fas fa-cogs"></i> System Setup (Rule Engine)</h2>
      {message && <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>{message}</div>}
      
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            {tabs.map(tab => (
              <li key={tab.id} className="nav-item">
                <button 
                  className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={tab.icon}></i> {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-body">
          {activeTab === 'call-average' && <CallAverageSetupForm loading={loading} setLoading={setLoading} setMessage={setMessage} />}
          {activeTab === 'coverage' && <CoverageSetupForm loading={loading} setLoading={setLoading} setMessage={setMessage} />}
          {activeTab === 'work-type' && <WorkTypeSetupForm loading={loading} setLoading={setLoading} setMessage={setMessage} />}
          {activeTab === 'leave-policy' && <LeavePolicyForm loading={loading} setLoading={setLoading} setMessage={setMessage} />}
        </div>
      </div>
    </div>
  )
}

const CallAverageSetupForm = ({ loading, setLoading, setMessage }) => {
  const [setups, setSetups] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    designation: 'MR',
    min_field_working_days: 20,
    daily_calls: 11,
    monthly_calls: 220,
    quarterly_calls: 660,
    yearly_calls: 2640,
    warning_threshold: 90,
    alert_threshold: 70,
    effective_from: new Date().toISOString().split('T')[0]
  })

  const designations = ['MR', 'TBM', 'ABM', 'RBM', 'ZBM', 'NSM', 'Admin', 'HR']

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await adminAPI.getCallAverageSetups()
      setSetups(data || [])
    } catch (error) {
      setMessage('Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = { ...prev, [name]: value }
      if (['min_field_working_days', 'daily_calls'].includes(name)) {
        const days = parseInt(newData.min_field_working_days) || 0
        const daily = parseInt(newData.daily_calls) || 0
        newData.monthly_calls = days * daily
        newData.quarterly_calls = newData.monthly_calls * 3
        newData.yearly_calls = newData.monthly_calls * 12
      }
      return newData
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingItem) {
        await adminAPI.updateCallAverageSetup(editingItem.id, formData)
        setMessage('Updated successfully')
      } else {
        await adminAPI.createCallAverageSetup(formData)
        setMessage('Created successfully')
      }
      setShowModal(false)
      loadData()
    } catch (error) {
      setMessage('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Deactivate this setup?')) {
      setLoading(true)
      try {
        await adminAPI.deleteCallAverageSetup(id)
        loadData()
        setMessage('Deactivated successfully')
      } catch (error) {
        setMessage('Error: ' + error.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const openEdit = (item) => {
    setFormData({
      designation: item.designation,
      min_field_working_days: item.min_field_working_days,
      daily_calls: item.daily_calls,
      monthly_calls: item.monthly_calls,
      quarterly_calls: item.quarterly_calls,
      yearly_calls: item.yearly_calls,
      warning_threshold: item.warning_threshold,
      alert_threshold: item.alert_threshold,
      effective_from: item.effective_from || ''
    })
    setEditingItem(item)
    setShowModal(true)
  }

  return (
    <div>
      <div className="mb-3">
        <button className="btn btn-primary" onClick={() => { setEditingItem(null); setFormData({
          designation: 'MR', min_field_working_days: 20, daily_calls: 11, monthly_calls: 220,
          quarterly_calls: 660, yearly_calls: 2640, warning_threshold: 90, alert_threshold: 70,
          effective_from: new Date().toISOString().split('T')[0]
        }); setShowModal(true); }}>
          <i className="fas fa-plus"></i> Add Call Average Setup
        </button>
      </div>
      
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Designation</th>
              <th>Min Working Days</th>
              <th>Daily</th>
              <th>Monthly</th>
              <th>Quarterly</th>
              <th>Yearly</th>
              <th>Warning %</th>
              <th>Alert %</th>
              <th>Effective From</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {setups.map(item => (
              <tr key={item.id}>
                <td><strong>{item.designation}</strong></td>
                <td>{item.min_field_working_days}</td>
                <td>{item.daily_calls}</td>
                <td>{item.monthly_calls}</td>
                <td>{item.quarterly_calls}</td>
                <td>{item.yearly_calls}</td>
                <td>{item.warning_threshold}%</td>
                <td className="text-danger">{item.alert_threshold}%</td>
                <td>{item.effective_from}</td>
                <td>
                  <button className="btn btn-sm btn-info mr-1" onClick={() => openEdit(item)}><i className="fas fa-edit"></i></button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
            {setups.length === 0 && <tr><td colSpan="10" className="text-center">No data found</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingItem ? 'Edit' : 'Add'} Call Average Setup</h5>
                <button className="close" onClick={() => setShowModal(false)}>&times;</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Designation</label>
                    <select name="designation" value={formData.designation} onChange={handleInputChange} className="form-control" required>
                      {designations.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Min Field Working Days</label>
                        <input type="number" name="min_field_working_days" value={formData.min_field_working_days} onChange={handleInputChange} className="form-control" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Daily Calls</label>
                        <input type="number" name="daily_calls" value={formData.daily_calls} onChange={handleInputChange} className="form-control" />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Monthly Calls (Auto)</label>
                        <input type="number" value={formData.monthly_calls} className="form-control" readOnly />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Warning Threshold %</label>
                        <input type="number" name="warning_threshold" value={formData.warning_threshold} onChange={handleInputChange} className="form-control" />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Alert Threshold %</label>
                        <input type="number" name="alert_threshold" value={formData.alert_threshold} onChange={handleInputChange} className="form-control" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Effective From</label>
                        <input type="date" name="effective_from" value={formData.effective_from} onChange={handleInputChange} className="form-control" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const CoverageSetupForm = ({ loading, setLoading, setMessage }) => {
  const [setups, setSetups] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    designation: 'MR',
    doctor_list_type: 'Core',
    monthly_coverage: 90,
    quarterly_coverage: 100,
    yearly_coverage: 100,
    effective_from: new Date().toISOString().split('T')[0]
  })

  const designations = ['MR', 'TBM', 'ABM', 'RBM', 'ZBM', 'NSM']

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    setMessage('')
    try {
      const data = await adminAPI.getCoverageSetups()
      setSetups(data || [])
    } catch (error) {
      console.log('Coverage load error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingItem) {
        await adminAPI.updateCoverageSetup(editingItem.id, formData)
        setMessage('Updated successfully')
      } else {
        await adminAPI.createCoverageSetup(formData)
        setMessage('Created successfully')
      }
      setShowModal(false)
      loadData()
    } catch (error) {
      setMessage('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Deactivate this setup?')) {
      setLoading(true)
      try {
        await adminAPI.deleteCoverageSetup(id)
        loadData()
        setMessage('Deactivated successfully')
      } catch (error) {
        setMessage('Error: ' + error.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const openEdit = (item) => {
    setFormData({
      designation: item.designation,
      doctor_list_type: item.doctor_list_type,
      monthly_coverage: item.monthly_coverage,
      quarterly_coverage: item.quarterly_coverage,
      yearly_coverage: item.yearly_coverage,
      effective_from: item.effective_from || ''
    })
    setEditingItem(item)
    setShowModal(true)
  }

  return (
    <div>
      <div className="mb-3">
        <button className="btn btn-primary" onClick={() => { setEditingItem(null); setFormData({
          designation: 'MR', doctor_list_type: 'Core', monthly_coverage: 90, quarterly_coverage: 100,
          yearly_coverage: 100, effective_from: new Date().toISOString().split('T')[0]
        }); setShowModal(true); }}>
          <i className="fas fa-plus"></i> Add Coverage Setup
        </button>
      </div>
      
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Designation</th>
              <th>Doctor List Type</th>
              <th>Monthly %</th>
              <th>Quarterly %</th>
              <th>Yearly %</th>
              <th>Effective From</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {setups.map(item => (
              <tr key={item.id}>
                <td><strong>{item.designation}</strong></td>
                <td>{item.doctor_list_type}</td>
                <td className={item.monthly_coverage < 90 ? 'text-danger' : ''}>{item.monthly_coverage}%</td>
                <td>{item.quarterly_coverage}%</td>
                <td>{item.yearly_coverage}%</td>
                <td>{item.effective_from}</td>
                <td>
                  <button className="btn btn-sm btn-info mr-1" onClick={() => openEdit(item)}><i className="fas fa-edit"></i></button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
            {setups.length === 0 && <tr><td colSpan="7" className="text-center">No data found</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingItem ? 'Edit' : 'Add'} Coverage Setup</h5>
                <button className="close" onClick={() => setShowModal(false)}>&times;</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Designation</label>
                    <select name="designation" value={formData.designation} onChange={handleInputChange} className="form-control" required>
                      {designations.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Doctor List Type</label>
                    <select name="doctor_list_type" value={formData.doctor_list_type} onChange={handleInputChange} className="form-control">
                      <option value="Core">Core</option>
                      <option value="Secondary">Secondary</option>
                    </select>
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Monthly %</label>
                        <input type="number" name="monthly_coverage" value={formData.monthly_coverage} onChange={handleInputChange} className="form-control" />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Quarterly %</label>
                        <input type="number" name="quarterly_coverage" value={formData.quarterly_coverage} onChange={handleInputChange} className="form-control" />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Yearly %</label>
                        <input type="number" name="yearly_coverage" value={formData.yearly_coverage} onChange={handleInputChange} className="form-control" />
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Effective From</label>
                    <input type="date" name="effective_from" value={formData.effective_from} onChange={handleInputChange} className="form-control" />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const WorkTypeSetupForm = ({ loading, setLoading, setMessage }) => {
  const [setups, setSetups] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    designation: 'MR',
    field_work_days: 24,
    office_work_days: 4,
    mandatory_field_days: true,
    effective_from: new Date().toISOString().split('T')[0]
  })

  const designations = ['MR', 'TBM', 'ABM', 'RBM', 'ZBM', 'NSM']

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    setMessage('')
    try {
      const data = await adminAPI.getWorkTypeSetups()
      setSetups(data || [])
    } catch (error) {
      console.log('WorkType load error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingItem) {
        await adminAPI.updateWorkTypeSetup(editingItem.id, formData)
        setMessage('Updated successfully')
      } else {
        await adminAPI.createWorkTypeSetup(formData)
        setMessage('Created successfully')
      }
      setShowModal(false)
      loadData()
    } catch (error) {
      setMessage('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Deactivate this setup?')) {
      setLoading(true)
      try {
        await adminAPI.deleteWorkTypeSetup(id)
        loadData()
        setMessage('Deactivated successfully')
      } catch (error) {
        setMessage('Error: ' + error.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const openEdit = (item) => {
    setFormData({
      designation: item.designation,
      field_work_days: item.field_work_days,
      office_work_days: item.office_work_days,
      mandatory_field_days: item.mandatory_field_days,
      effective_from: item.effective_from || ''
    })
    setEditingItem(item)
    setShowModal(true)
  }

  return (
    <div>
      <div className="mb-3">
        <button className="btn btn-primary" onClick={() => { setEditingItem(null); setFormData({
          designation: 'MR', field_work_days: 24, office_work_days: 4, mandatory_field_days: true,
          effective_from: new Date().toISOString().split('T')[0]
        }); setShowModal(true); }}>
          <i className="fas fa-plus"></i> Add Work Type Setup
        </button>
      </div>
      
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Designation</th>
              <th>Field Work Days</th>
              <th>Office Work Days</th>
              <th>Total Days</th>
              <th>Mandatory Field</th>
              <th>Effective From</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {setups.map(item => (
              <tr key={item.id}>
                <td><strong>{item.designation}</strong></td>
                <td>{item.field_work_days}</td>
                <td>{item.office_work_days}</td>
                <td>{item.total_working_days || item.field_work_days + item.office_work_days}</td>
                <td>{item.mandatory_field_days ? <span className="badge badge-success">Yes</span> : <span className="badge badge-warning">No</span>}</td>
                <td>{item.effective_from}</td>
                <td>
                  <button className="btn btn-sm btn-info mr-1" onClick={() => openEdit(item)}><i className="fas fa-edit"></i></button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
            {setups.length === 0 && <tr><td colSpan="7" className="text-center">No data found</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingItem ? 'Edit' : 'Add'} Work Type Setup</h5>
                <button className="close" onClick={() => setShowModal(false)}>&times;</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Designation</label>
                    <select name="designation" value={formData.designation} onChange={handleInputChange} className="form-control" required>
                      {designations.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Field Work Days</label>
                        <input type="number" name="field_work_days" value={formData.field_work_days} onChange={handleInputChange} className="form-control" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Office Work Days</label>
                        <input type="number" name="office_work_days" value={formData.office_work_days} onChange={handleInputChange} className="form-control" />
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="form-check">
                      <input type="checkbox" name="mandatory_field_days" checked={formData.mandatory_field_days} onChange={handleInputChange} className="form-check-input" id="mandatoryField" />
                      <label className="form-check-label" htmlFor="mandatoryField">Mandatory Field Work</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Effective From</label>
                    <input type="date" name="effective_from" value={formData.effective_from} onChange={handleInputChange} className="form-control" />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const LeavePolicyForm = ({ loading, setLoading, setMessage }) => {
  const [policies, setPolicies] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    leave_type: 'CL',
    leave_type_name: 'Casual Leave',
    probation_allowed: false,
    regular_allowed: true,
    max_days_per_month: 2,
    max_days_per_year: 12,
    carry_forward: true,
    approval_required: true
  })

  const leaveTypes = [
    { code: 'CL', name: 'Casual Leave' },
    { code: 'SL', name: 'Sick Leave' },
    { code: 'EL', name: 'Earned Leave' },
    { code: 'ML', name: 'Maternity Leave' },
    { code: 'PL', name: 'Paternity Leave' },
    { code: 'UL', name: 'Unpaid Leave' }
  ]

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    setMessage('')
    try {
      const data = await adminAPI.getLeavePolicies()
      setPolicies(data || [])
    } catch (error) {
      console.log('Leave policy load error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingItem) {
        await adminAPI.updateLeavePolicy(editingItem.id, formData)
        setMessage('Updated successfully')
      } else {
        await adminAPI.createLeavePolicy(formData)
        setMessage('Created successfully')
      }
      setShowModal(false)
      loadData()
    } catch (error) {
      setMessage('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Deactivate this policy?')) {
      setLoading(true)
      try {
        await adminAPI.deleteLeavePolicy(id)
        loadData()
        setMessage('Deactivated successfully')
      } catch (error) {
        setMessage('Error: ' + error.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const openEdit = (item) => {
    setFormData({
      leave_type: item.leave_type,
      leave_type_name: item.leave_type_name,
      probation_allowed: item.probation_allowed,
      regular_allowed: item.regular_allowed,
      max_days_per_month: item.max_days_per_month,
      max_days_per_year: item.max_days_per_year,
      carry_forward: item.carry_forward,
      approval_required: item.approval_required
    })
    setEditingItem(item)
    setShowModal(true)
  }

  return (
    <div>
      <div className="mb-3">
        <button className="btn btn-primary" onClick={() => { setEditingItem(null); setFormData({
          leave_type: 'CL', leave_type_name: 'Casual Leave', probation_allowed: false, regular_allowed: true,
          max_days_per_month: 2, max_days_per_year: 12, carry_forward: false, approval_required: true
        }); setShowModal(true); }}>
          <i className="fas fa-plus"></i> Add Leave Policy
        </button>
      </div>
      
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Max/Month</th>
              <th>Max/Year</th>
              <th>Probation</th>
              <th>Regular</th>
              <th>Carry Forward</th>
              <th>Approval</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.map(item => (
              <tr key={item.id}>
                <td><strong>{item.leave_type}</strong> - {item.leave_type_name}</td>
                <td>{item.max_days_per_month}</td>
                <td>{item.max_days_per_year}</td>
                <td>{item.probation_allowed ? <span className="badge badge-success">Yes</span> : <span className="badge badge-danger">No</span>}</td>
                <td>{item.regular_allowed ? <span className="badge badge-success">Yes</span> : <span className="badge badge-danger">No</span>}</td>
                <td>{item.carry_forward ? <span className="badge badge-success">Yes</span> : <span className="badge badge-danger">No</span>}</td>
                <td>{item.approval_required ? <span className="badge badge-warning">Required</span> : <span className="badge badge-info">Not Required</span>}</td>
                <td>
                  <button className="btn btn-sm btn-info mr-1" onClick={() => openEdit(item)}><i className="fas fa-edit"></i></button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
            {policies.length === 0 && <tr><td colSpan="8" className="text-center">No data found</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingItem ? 'Edit' : 'Add'} Leave Policy</h5>
                <button className="close" onClick={() => setShowModal(false)}>&times;</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Leave Type</label>
                        <select name="leave_type" value={formData.leave_type} onChange={handleInputChange} className="form-control" required>
                          {leaveTypes.map(t => <option key={t.code} value={t.code}>{t.code} - {t.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Leave Type Name</label>
                        <input type="text" name="leave_type_name" value={formData.leave_type_name} onChange={handleInputChange} className="form-control" />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Max Days/Month</label>
                        <input type="number" name="max_days_per_month" value={formData.max_days_per_month} onChange={handleInputChange} className="form-control" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Max Days/Year</label>
                        <input type="number" name="max_days_per_year" value={formData.max_days_per_year} onChange={handleInputChange} className="form-control" />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-check">
                        <input type="checkbox" name="probation_allowed" checked={formData.probation_allowed} onChange={handleInputChange} className="form-check-input" id="probation" />
                        <label className="form-check-label" htmlFor="probation">Allowed During Probation</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check">
                        <input type="checkbox" name="regular_allowed" checked={formData.regular_allowed} onChange={handleInputChange} className="form-check-input" id="regular" />
                        <label className="form-check-label" htmlFor="regular">Allowed After Regular</label>
                      </div>
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-md-6">
                      <div className="form-check">
                        <input type="checkbox" name="carry_forward" checked={formData.carry_forward} onChange={handleInputChange} className="form-check-input" id="carryForward" />
                        <label className="form-check-label" htmlFor="carryForward">Carry Forward</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check">
                        <input type="checkbox" name="approval_required" checked={formData.approval_required} onChange={handleInputChange} className="form-check-input" id="approval" />
                        <label className="form-check-label" htmlFor="approval">Approval Required</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SystemSetup