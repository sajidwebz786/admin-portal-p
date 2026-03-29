import React, { useState, useEffect } from 'react'
import adminAPI from '../services/apiService'

const ActivityApprovals = () => {
  const [approvals, setApprovals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('pending')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    loadApprovals()
  }, [])

  const loadApprovals = async () => {
    try {
      setLoading(true)
      setError('')

      // Load activities for approvals
      const activitiesResponse = await adminAPI.getActivities()

      // Handle different response formats
      const activities = activitiesResponse.activities || activitiesResponse || []

      // Transform activities data for display
      const transformedApprovals = activities.map(activity => ({
        id: activity.id,
        title: activity.title,
        user: `User ${activity.userId}`,
        reason: activity.description || 'No description provided',
        date: activity.date,
        type: activity.type || 'activity',
        status: activity.status,
        notes: activity.notes,
        doctor: activity.doctor,
        doctorClass: activity.doctorClass,
        callProducts: activity.callProducts || []
      }))

      setApprovals(transformedApprovals)
    } catch (error) {
      console.error('Error loading approvals:', error)
      setError('Failed to load approvals')
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (id, action) => {
    try {
      if (action === 'approve') {
        await adminAPI.approveActivity(id)
      } else {
        await adminAPI.rejectActivity(id, 'Rejected by admin')
      }
      
      // Remove from list or update status
      setApprovals(approvals.filter(approval => approval.id !== id))
    } catch (error) {
      console.error('Error processing approval:', error)
      setError(`Failed to ${action} activity`)
    }
  }

  const filteredApprovals = approvals.filter(approval => {
    if (filterType !== 'all' && approval.type !== filterType) return false
    if (filterStatus !== 'all' && approval.status !== filterStatus) return false
    return true
  })

  if (loading) {
    return (
      <div className="section-content">
        <h2>Activity Approvals</h2>
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i> Loading approvals...
        </div>
      </div>
    )
  }

  return (
    <div className="section-content">
      <h2>Activity Approvals</h2>
      
      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      )}

      <div className="approval-filters">
        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="doctor_call">Doctor Call</option>
          <option value="chemist_call">Chemist Call</option>
          <option value="general">General Activity</option>
          <option value="activity">Activity Exception</option>
          <option value="daycall">Day Call Exception</option>
          <option value="sales">Sales Entry</option>
        </select>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      
      <div className="approval-list">
        {filteredApprovals.map((approval) => (
          <div key={approval.id} className="approval-item">
            <div className="approval-details">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>{approval.title}</h3>
                <span className={`status-badge status-${approval.status}`}>
                  {approval.status}
                </span>
              </div>
              <p><strong>User:</strong> {approval.user}</p>
              <p><strong>Date:</strong> {approval.date}</p>
              <p><strong>Type:</strong> {approval.type === 'doctor_call' ? 'Doctor Call' : approval.type === 'chemist_call' ? 'Chemist Call' : 'General Activity'}</p>
              {approval.reason && <p><strong>Description:</strong> {approval.reason}</p>}
              
              {approval.type === 'doctor_call' && (
                <>
                  {approval.doctor && (
                    <p><strong>Doctor:</strong> Dr. {approval.doctor.firstName} {approval.doctor.lastName}
                      {approval.doctor.specialty && ` (${approval.doctor.specialty})`}
                    </p>
                  )}
                  {approval.doctorClass && (
                    <p><strong>Doctor Class:</strong> {approval.doctorClass.category_name} ({approval.doctorClass.short_name})</p>
                  )}
                </>
              )}
              
              {approval.notes && <p><strong>Notes:</strong> {approval.notes}</p>}

              {/* Expandable product entries for doctor calls */}
              {approval.callProducts.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <button
                    className="btn btn-sm"
                    style={{ background: 'none', border: '1px solid #ccc', cursor: 'pointer', padding: '4px 12px' }}
                    onClick={() => setExpandedId(expandedId === approval.id ? null : approval.id)}
                  >
                    {expandedId === approval.id ? '▼ Hide' : '▶ Show'} Products ({approval.callProducts.length})
                  </button>
                  
                  {expandedId === approval.id && (
                    <table style={{ width: '100%', marginTop: '8px', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ background: '#f5f5f5' }}>
                          <th style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'left' }}>Product</th>
                          <th style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'left' }}>Sample</th>
                          <th style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'left' }}>Input</th>
                          <th style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center' }}>Rx/Week</th>
                        </tr>
                      </thead>
                      <tbody>
                        {approval.callProducts.map((cp, idx) => (
                          <tr key={idx}>
                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                              {cp.product?.name || 'N/A'}
                            </td>
                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                              {cp.sample ? `${cp.sample.sample_name} (${cp.sample.sample_qty} ${cp.sample.unit})` : '-'}
                            </td>
                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                              {cp.input ? `${cp.input.input_name} (${cp.input.short_name})` : '-'}
                            </td>
                            <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center' }}>
                              {cp.rxPerWeek || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
            <div className="approval-actions">
              <button
                className="btn btn-primary"
                onClick={() => handleApproval(approval.id, 'approve')}
              >
                Approve
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleApproval(approval.id, 'reject')}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="approval-stats">
        <div className="stat-card">
          <h3>Pending Approvals</h3>
          <p className="stat-value">{filteredApprovals.length}</p>
        </div>
        <div className="stat-card">
          <h3>Approved Today</h3>
          <p className="stat-value">12</p>
        </div>
        <div className="stat-card">
          <h3>Rejected Today</h3>
          <p className="stat-value">3</p>
        </div>
      </div>
    </div>
  )
}

export default ActivityApprovals