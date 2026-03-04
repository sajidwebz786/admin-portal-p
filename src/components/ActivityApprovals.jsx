import React, { useState, useEffect } from 'react'
import adminAPI from '../services/apiService'

const ActivityApprovals = () => {
  const [approvals, setApprovals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('pending')

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
        title: `${activity.title} - Exception Request`,
        user: `User ${activity.userId}`, // Since we don't have user details in activities
        reason: activity.description || 'No description provided',
        date: activity.date,
        type: 'activity',
        status: activity.status
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
              <h3>{approval.title}</h3>
              <p><strong>User:</strong> {approval.user}</p>
              <p><strong>Reason:</strong> {approval.reason}</p>
              <p><strong>Date:</strong> {approval.date}</p>
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