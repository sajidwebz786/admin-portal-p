import React, { useState, useEffect } from 'react'
import adminAPI from '../services/apiService'

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([])
  const [users, setUsers] = useState([])
  const [headquarters, setHeadquarters] = useState([])
  const [travelModes, setTravelModes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterUser, setFilterUser] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [formData, setFormData] = useState({
    user_id: '',
    month: '',
    year: '',
    date: '',
    working_status: 'Working',
    hq_id: '',
    territory_id: '',
    doctor_calls: '0',
    chemist_calls: '0',
    business_amount: '0',
    allowance: '0',
    from_place: '',
    to_place: '',
    travel_mode_id: '',
    travel_entry_amount: '0',
    distance_km: '0',
    ta: '0',
    miscellaneous: '0',
    remarks: ''
  })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const [expRes, usrRes, hqRes, tmRes] = await Promise.all([
        adminAPI.getExpenses(),
        adminAPI.getUsers(),
        adminAPI.getHeadquarters(),
        adminAPI.getTravelModes()
      ])
      setExpenses(expRes || [])
      setUsers(usrRes.users || usrRes || [])
      setHeadquarters(hqRes.headquarters || hqRes || [])
      setTravelModes(tmRes || [])
    } catch (error) {
      console.error('Error loading expenses:', error)
      setError('Failed to load expenses')
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
      user_id: '', month: '', year: '', date: '', working_status: 'Working',
      hq_id: '', territory_id: '', doctor_calls: '0', chemist_calls: '0',
      business_amount: '0', allowance: '0', from_place: '', to_place: '',
      travel_mode_id: '', travel_entry_amount: '0', distance_km: '0', ta: '0',
      miscellaneous: '0', remarks: ''
    })
    setEditingItem(null)
  }

  const showAddModal = () => { resetForm(); setShowModal(true) }

  const showEditModal = (item) => {
    setFormData({
      user_id: item.user_id || '',
      month: item.month || '',
      year: item.year || '',
      date: item.date || '',
      working_status: item.working_status || 'Working',
      hq_id: item.hq_id || '',
      territory_id: item.territory_id || '',
      doctor_calls: String(item.doctor_calls || '0'),
      chemist_calls: String(item.chemist_calls || '0'),
      business_amount: String(item.business_amount || '0'),
      allowance: String(item.allowance || '0'),
      from_place: item.from_place || '',
      to_place: item.to_place || '',
      travel_mode_id: item.travel_mode_id || '',
      travel_entry_amount: String(item.travel_entry_amount || '0'),
      distance_km: String(item.distance_km || '0'),
      ta: String(item.ta || '0'),
      miscellaneous: String(item.miscellaneous || '0'),
      remarks: item.remarks || ''
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
        doctor_calls: parseInt(formData.doctor_calls) || 0,
        chemist_calls: parseInt(formData.chemist_calls) || 0,
        business_amount: parseFloat(formData.business_amount) || 0,
        allowance: parseFloat(formData.allowance) || 0,
        travel_entry_amount: parseFloat(formData.travel_entry_amount) || 0,
        distance_km: parseFloat(formData.distance_km) || 0,
        ta: parseFloat(formData.ta) || 0,
        miscellaneous: parseFloat(formData.miscellaneous) || 0,
        user_id: formData.user_id || undefined,
        hq_id: formData.hq_id || null,
        territory_id: formData.territory_id || null,
        travel_mode_id: formData.travel_mode_id || null
      }
      if (editingItem) {
        await adminAPI.updateExpense(editingItem.id, data)
      } else {
        await adminAPI.createExpense(data)
      }
      closeModal()
      loadData()
    } catch (error) {
      console.error('Error saving expense:', error)
      setError('Failed to save expense')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await adminAPI.deleteExpense(id)
        loadData()
      } catch (error) {
        setError(error.message || 'Failed to delete')
      }
    }
  }

  const handleSubmitExpense = async (id) => {
    try {
      await adminAPI.submitExpense(id)
      loadData()
    } catch (error) {
      setError(error.message || 'Failed to submit')
    }
  }

  const handleApproveExpense = async (id) => {
    try {
      await adminAPI.approveExpense(id)
      loadData()
    } catch (error) {
      setError(error.message || 'Failed to approve')
    }
  }

  const handleRejectExpense = async (id) => {
    const reason = window.prompt('Rejection reason:')
    if (reason) {
      try {
        await adminAPI.rejectExpense(id, reason)
        loadData()
      } catch (error) {
        setError(error.message || 'Failed to reject')
      }
    }
  }

  const loadReport = async () => {
    if (!filterUser || !filterMonth || !filterYear) {
      setError('Please select user, month and year for report')
      return
    }
    try {
      const data = await adminAPI.getExpenseReport({ user_id: filterUser, month: filterMonth, year: filterYear })
      setReportData(data)
      setShowReportModal(true)
    } catch (error) {
      setError(error.message || 'Failed to load report')
    }
  }

  const filtered = expenses.filter(e => {
    if (filterMonth && e.month !== filterMonth) return false
    if (filterYear && e.year !== filterYear) return false
    if (filterUser && e.user_id !== parseInt(filterUser)) return false
    return true
  })

  const statusColors = { draft: 'badge-secondary', submitted: 'badge-info', approved: 'badge-success', rejected: 'badge-danger' }

  if (loading) {
    return <div className="section-content"><h2>Expense Management</h2><div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i> Loading...</div></div>
  }

  return (
    <div className="section-content">
      <h2>Expense Management</h2>
      {error && <div className="alert alert-danger"><i className="fas fa-exclamation-triangle"></i> {error}</div>}

      <div className="management-actions mb-4 d-flex gap-3 align-items-end" style={{ flexWrap: 'wrap' }}>
        <div className="form-group mb-0">
          <label style={{ fontSize: '0.8rem' }}>Month</label>
          <select className="form-control form-control-sm" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
            <option value="">All Months</option>
            {[...Array(12)].map((_, i) => <option key={i+1} value={String(i+1).padStart(2, '0')}>{new Date(2026, i).toLocaleString('default', { month: 'long' })}</option>)}
          </select>
        </div>
        <div className="form-group mb-0">
          <label style={{ fontSize: '0.8rem' }}>Year</label>
          <select className="form-control form-control-sm" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
            <option value="">All Years</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
        <div className="form-group mb-0">
          <label style={{ fontSize: '0.8rem' }}>Employee</label>
          <select className="form-control form-control-sm" value={filterUser} onChange={e => setFilterUser(e.target.value)}>
            <option value="">All Employees</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
          </select>
        </div>
        <button className="btn btn-success btn-sm" onClick={loadReport}><i className="fas fa-chart-bar"></i> View Report</button>
        <button className="btn btn-primary btn-sm" onClick={showAddModal}><i className="fas fa-plus"></i> Add Entry</button>
        <button className="btn btn-info btn-sm" onClick={loadData}><i className="fas fa-sync"></i> Refresh</button>
      </div>

      <div className="management-table" style={{ overflowX: 'auto' }}>
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th>Date</th>
              <th>Employee</th>
              <th>Working</th>
              <th>Dr Calls</th>
              <th>Chem Calls</th>
              <th>Business</th>
              <th>DA</th>
              <th>From</th>
              <th>To</th>
              <th>Travel Mode</th>
              <th>Distance</th>
              <th>TA</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="14" className="text-center">No expense entries found.</td></tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td>{item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : '-'}</td>
                  <td>{item.working_status}</td>
                  <td>{item.doctor_calls}</td>
                  <td>{item.chemist_calls}</td>
                  <td>{item.business_amount}</td>
                  <td>{item.allowance}</td>
                  <td>{item.from_place || '-'}</td>
                  <td>{item.to_place || '-'}</td>
                  <td>{item.travelMode?.short_name || '-'}</td>
                  <td>{item.distance_km}</td>
                  <td>{item.ta}</td>
                  <td><span className={`badge ${statusColors[item.approval_status] || 'badge-secondary'}`}>{item.approval_status}</span></td>
                  <td>
                    {item.approval_status === 'draft' && (
                      <>
                        <button className="btn btn-outline-primary btn-sm" onClick={() => showEditModal(item)} title="Edit"><i className="fas fa-edit"></i></button>
                        <button className="btn btn-outline-success btn-sm ml-1" onClick={() => handleSubmitExpense(item.id)} title="Submit"><i className="fas fa-paper-plane"></i></button>
                        <button className="btn btn-outline-danger btn-sm ml-1" onClick={() => handleDelete(item.id)} title="Delete"><i className="fas fa-trash"></i></button>
                      </>
                    )}
                    {item.approval_status === 'submitted' && (
                      <>
                        <button className="btn btn-outline-success btn-sm" onClick={() => handleApproveExpense(item.id)} title="Approve"><i className="fas fa-check"></i></button>
                        <button className="btn btn-outline-danger btn-sm ml-1" onClick={() => handleRejectExpense(item.id)} title="Reject"><i className="fas fa-times"></i></button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Entry Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '700px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editingItem ? 'Edit Expense Entry' : 'Add Expense Entry'}</h3>
                <button className="close-btn" onClick={closeModal}><i className="fas fa-times"></i></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                  <div className="row">
                    <div className="col-md-4"><div className="form-group"><label>Employee *</label><select name="user_id" className="form-control" value={formData.user_id} onChange={handleInputChange} required><option value="">-- Select --</option>{users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}</select></div></div>
                    <div className="col-md-4"><div className="form-group"><label>Date *</label><input type="date" name="date" className="form-control" value={formData.date} onChange={handleInputChange} required /></div></div>
                    <div className="col-md-4"><div className="form-group"><label>Working Status</label><select name="working_status" className="form-control" value={formData.working_status} onChange={handleInputChange}><option value="Working">Working</option><option value="Leave">Leave</option><option value="Holiday">Holiday</option><option value="Sunday">Sunday</option></select></div></div>
                  </div>
                  <div className="row">
                    <div className="col-md-4"><div className="form-group"><label>Month *</label><select name="month" className="form-control" value={formData.month} onChange={handleInputChange} required><option value="">-- Month --</option>{[...Array(12)].map((_, i) => <option key={i+1} value={String(i+1).padStart(2, '0')}>{new Date(2026, i).toLocaleString('default', { month: 'long' })}</option>)}</select></div></div>
                    <div className="col-md-4"><div className="form-group"><label>Year *</label><select name="year" className="form-control" value={formData.year} onChange={handleInputChange} required><option value="">-- Year --</option><option value="2025">2025</option><option value="2026">2026</option></select></div></div>
                    <div className="col-md-4"><div className="form-group"><label>HQ</label><select name="hq_id" className="form-control" value={formData.hq_id} onChange={handleInputChange}><option value="">-- HQ --</option>{headquarters.map(hq => <option key={hq.id} value={hq.id}>{hq.name}</option>)}</select></div></div>
                  </div>
                  <hr />
                  <div className="row">
                    <div className="col-md-3"><div className="form-group"><label>Dr Calls</label><input type="number" name="doctor_calls" className="form-control" value={formData.doctor_calls} onChange={handleInputChange} /></div></div>
                    <div className="col-md-3"><div className="form-group"><label>Chem Calls</label><input type="number" name="chemist_calls" className="form-control" value={formData.chemist_calls} onChange={handleInputChange} /></div></div>
                    <div className="col-md-3"><div className="form-group"><label>Business</label><input type="number" step="0.01" name="business_amount" className="form-control" value={formData.business_amount} onChange={handleInputChange} /></div></div>
                    <div className="col-md-3"><div className="form-group"><label>Allowance (DA)</label><input type="number" step="0.01" name="allowance" className="form-control" value={formData.allowance} onChange={handleInputChange} /></div></div>
                  </div>
                  <hr />
                  <h6>Travel Details</h6>
                  <div className="row">
                    <div className="col-md-4"><div className="form-group"><label>From</label><input type="text" name="from_place" className="form-control" value={formData.from_place} onChange={handleInputChange} /></div></div>
                    <div className="col-md-4"><div className="form-group"><label>To</label><input type="text" name="to_place" className="form-control" value={formData.to_place} onChange={handleInputChange} /></div></div>
                    <div className="col-md-4"><div className="form-group"><label>Travel Mode</label><select name="travel_mode_id" className="form-control" value={formData.travel_mode_id} onChange={handleInputChange}><option value="">-- Mode --</option>{travelModes.map(tm => <option key={tm.id} value={tm.id}>{tm.travel_type}</option>)}</select></div></div>
                  </div>
                  <div className="row">
                    <div className="col-md-3"><div className="form-group"><label>Entry Amt</label><input type="number" step="0.01" name="travel_entry_amount" className="form-control" value={formData.travel_entry_amount} onChange={handleInputChange} /></div></div>
                    <div className="col-md-3"><div className="form-group"><label>Distance (KM)</label><input type="number" step="0.01" name="distance_km" className="form-control" value={formData.distance_km} onChange={handleInputChange} /></div></div>
                    <div className="col-md-3"><div className="form-group"><label>TA</label><input type="number" step="0.01" name="ta" className="form-control" value={formData.ta} onChange={handleInputChange} /></div></div>
                    <div className="col-md-3"><div className="form-group"><label>Misc</label><input type="number" step="0.01" name="miscellaneous" className="form-control" value={formData.miscellaneous} onChange={handleInputChange} /></div></div>
                  </div>
                  <div className="form-group"><label>Remarks</label><textarea name="remarks" className="form-control" value={formData.remarks} onChange={handleInputChange} rows="2" /></div>
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

      {/* Report Modal */}
      {showReportModal && reportData && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '900px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>Expense Report - {reportData.employee?.firstName} {reportData.employee?.lastName} ({reportData.month}/{reportData.year})</h3>
                <button className="close-btn" onClick={() => setShowReportModal(false)}><i className="fas fa-times"></i></button>
              </div>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <table className="table table-sm table-bordered">
                  <thead><tr><th>Date</th><th>Working</th><th>HQ</th><th>Patch</th><th>Dr Call</th><th>Chem Call</th><th>Business</th><th>DA</th><th>From</th><th>To</th><th>Mode</th><th>Dist</th><th>TA</th></tr></thead>
                  <tbody>
                    {(reportData.entries || []).map(e => (
                      <tr key={e.id}>
                        <td>{e.date}</td>
                        <td>{e.working_status}</td>
                        <td>{e.headquarter?.name || '-'}</td>
                        <td>{e.territory?.name || '-'}</td>
                        <td>{e.doctor_calls}</td>
                        <td>{e.chemist_calls}</td>
                        <td>{e.business_amount}</td>
                        <td>{e.allowance}</td>
                        <td>{e.from_place || '-'}</td>
                        <td>{e.to_place || '-'}</td>
                        <td>{e.travelMode?.short_name || '-'}</td>
                        <td>{e.distance_km}</td>
                        <td>{e.ta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reportData.summary && (
                  <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '4px' }}>
                    <h6>Summary</h6>
                    <div className="row">
                      <div className="col-md-3"><strong>Total DA:</strong> {reportData.summary.totalDA}</div>
                      <div className="col-md-3"><strong>Total TA:</strong> {reportData.summary.totalTA}</div>
                      <div className="col-md-3"><strong>Total Misc:</strong> {reportData.summary.totalMisc}</div>
                      <div className="col-md-3"><strong>Total Business:</strong> {reportData.summary.totalBusiness}</div>
                    </div>
                    <div className="row mt-2">
                      <div className="col-md-3"><strong>Dr Calls:</strong> {reportData.summary.totalDoctorCalls}</div>
                      <div className="col-md-3"><strong>Chem Calls:</strong> {reportData.summary.totalChemistCalls}</div>
                      <div className="col-md-3"><strong>Additions:</strong> {reportData.summary.totalAdditions}</div>
                      <div className="col-md-3"><strong>Deductions:</strong> {reportData.summary.totalDeductions}</div>
                    </div>
                    <div className="row mt-2">
                      <div className="col-md-4"><strong>Fixed Mobile:</strong> {reportData.summary.fixedMobile}</div>
                      <div className="col-md-4"><strong>Fixed Stationary:</strong> {reportData.summary.fixedStationary}</div>
                      <div className="col-md-4"><strong>Grand Total:</strong> {reportData.summary.grandTotal}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExpenseManagement
