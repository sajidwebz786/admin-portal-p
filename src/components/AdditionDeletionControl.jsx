import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/apiService'
import adminAPI from '../services/apiService'

const labels = {
  doctor: 'Doctor',
  chemist: 'Chemist',
  territory: 'Patch / Territory',
  headquarter: 'HQ',
  patch: 'Patch',
  stockist: 'Stockist',
  hospital: 'Hospital',
  svl: 'SVL',
  input_allocation: 'Input Allocation',
  notice: 'Notice',
  sop_policy: 'SOP / Policy',
  rate_fixation: 'Rate Fixation'
}

const actionLabels = {
  create: 'Addition',
  update: 'Edit',
  delete: 'Deletion'
}

const quickActionSections = [
  {
    title: 'Customer Masters',
    actions: [
      { label: 'Doctor Addition / Deletion', path: '/doctor-master', icon: 'fas fa-user-md' },
      { label: 'Chemist Addition / Deletion', path: '/chemist-master', icon: 'fas fa-clinic-medical' },
      { label: 'Stockist Addition / Deletion', path: '/stockist-master', icon: 'fas fa-warehouse' },
      { label: 'Hospital Addition / Deletion', path: '/hospital-master', icon: 'fas fa-hospital' },
      { label: 'SVL Addition / Deletion', path: '/svl-master', icon: 'fas fa-list-check' }
    ]
  },
  {
    title: 'Product & Input',
    actions: [
      { label: 'Input Master Addition / Deletion', path: '/input-master?open=add', icon: 'fas fa-gift' },
      { label: 'Sample Master Addition / Deletion', path: '/sample-master?open=add', icon: 'fas fa-vial' },
      { label: 'Input Allocation Addition / Deletion', path: '/input-allocation', icon: 'fas fa-calendar-check' },
      { label: 'Rate Fixation Addition / Deletion', path: '/rate-fixation', icon: 'fas fa-tags' }
    ]
  },
  {
    title: 'Policy & Control',
    actions: [
      { label: 'Notice Addition / Deletion', path: '/notice-upload', icon: 'fas fa-bullhorn' },
      { label: 'SOP Addition / Deletion', path: '/sop-master', icon: 'fas fa-file-shield' }
    ]
  }
]

const AdditionDeletionControl = () => {
  const [pendingApprovals, setPendingApprovals] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [selectedApproval, setSelectedApproval] = useState(null)
  const [comments, setComments] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadControlData()
  }, [])

  const loadControlData = async () => {
    try {
      setLoading(true)
      setError('')
      const [approvalRes, auditRes] = await Promise.all([
        api.get('/approvals/all-pending').catch(() => ({ data: [] })),
        adminAPI.getAuditLogs({ limit: 50 }).catch(() => [])
      ])
      setPendingApprovals(Array.isArray(approvalRes.data) ? approvalRes.data : [])
      setAuditLogs(Array.isArray(auditRes) ? auditRes : [])
    } catch (err) {
      setError('Failed to load addition/deletion control data')
    } finally {
      setLoading(false)
    }
  }

  const approvalStats = useMemo(() => {
    const stats = { create: 0, update: 0, delete: 0 }
    pendingApprovals.forEach((item) => {
      stats[item.action_type] = (stats[item.action_type] || 0) + 1
    })
    return stats
  }, [pendingApprovals])

  const recentDeletes = auditLogs.filter((log) => ['SOFT_DELETE', 'DELETE'].includes(log.action)).length
  const recentUpdates = auditLogs.filter((log) => log.action === 'UPDATE').length

  const handleApprove = async (id) => {
    try {
      await api.post(`/approvals/${id}/approve`, { comments })
      setSuccess('Change request approved')
      setSelectedApproval(null)
      setComments('')
      await loadControlData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve request')
    }
  }

  const handleReject = async (id) => {
    if (!comments.trim()) {
      setError('Please enter a rejection reason')
      return
    }
    try {
      await api.post(`/approvals/${id}/reject`, { comments })
      setSuccess('Change request rejected')
      setSelectedApproval(null)
      setComments('')
      await loadControlData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject request')
    }
  }

  const levelLabel = (level) => {
    const levels = { 0: 'Admin / HO', 1: 'MR / TBM', 2: 'ABM', 3: 'RSM / RBM', 4: 'ZSM / ZBM', 5: 'NSM' }
    return levels[level] || `Level ${level}`
  }

  return (
    <div className="section-content addition-control">
      <div className="page-header">
        <h2>Addition / Deletion Control</h2>
        <button className="btn btn-secondary" type="button" onClick={loadControlData}>Refresh</button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="approval-summary">
        <div className="summary-card">
          <h3>Pending Requests</h3>
          <p className="count">{pendingApprovals.length}</p>
        </div>
        <div className="summary-card">
          <h3>Additions</h3>
          <p className="count">{approvalStats.create || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Edits</h3>
          <p className="count">{approvalStats.update || 0}</p>
        </div>
        <div className="summary-card">
          <h3>Deletion Requests</h3>
          <p className="count">{approvalStats.delete || 0}</p>
        </div>
      </div>

      <div className="box quick-actions-box">
        <div className="box-header with-border">
          <h3 className="box-title">Addition / Deletion Quick Actions</h3>
        </div>
        <div className="quick-actions-grid">
          {quickActionSections.map((section) => (
            <div className="quick-action-section" key={section.title}>
              <h4>{section.title}</h4>
              <div className="quick-action-buttons">
                {section.actions.map((action) => (
                  <Link className="quick-action-btn" to={action.path} key={action.path}>
                    <i className={action.icon} aria-hidden="true" />
                    <span>{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="control-grid">
        <div className="box">
          <div className="box-header with-border">
            <h3 className="box-title">Authorized Change Requests</h3>
          </div>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : pendingApprovals.length === 0 ? (
            <div className="empty-state">No pending change requests.</div>
          ) : (
            <table className="table table-striped table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Master</th>
                  <th>Action</th>
                  <th>Submitted By</th>
                  <th>Level</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingApprovals.map((approval) => (
                  <tr key={approval.id}>
                    <td>{approval.id}</td>
                    <td>{labels[approval.entity_type] || approval.entity_type}</td>
                    <td>{actionLabels[approval.action_type] || approval.action_type}</td>
                    <td>{approval.submitter ? `${approval.submitter.firstName || ''} ${approval.submitter.lastName || ''}`.trim() : '-'}</td>
                    <td>{levelLabel(approval.current_level)}</td>
                    <td><button className="btn btn-sm btn-info" type="button" onClick={() => setSelectedApproval(approval)}>Review</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="box">
          <div className="box-header with-border">
            <h3 className="box-title">Audit Trail</h3>
          </div>
          <div className="audit-mini-summary">
            <span>Recent edits: {recentUpdates}</span>
            <span>Recent inactivations: {recentDeletes}</span>
          </div>
          <table className="table table-striped table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Date</th>
                <th>Master</th>
                <th>Record</th>
                <th>Action</th>
                <th>Changed By</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 && <tr><td colSpan="5" className="text-center">No audit entries found.</td></tr>}
              {auditLogs.slice(0, 20).map((log) => (
                <tr key={log.id}>
                  <td>{log.change_date ? new Date(log.change_date).toLocaleString() : '-'}</td>
                  <td>{log.table_name}</td>
                  <td>{log.record_id}</td>
                  <td>{log.action}</td>
                  <td>{log.user ? `${log.user.firstName || ''} ${log.user.lastName || ''}`.trim() : log.changed_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="box governance-note">
        <h3>Control Coverage</h3>
        <div className="governance-list">
          <span>Doctor transfer and inactivation</span>
          <span>Chemist additions and inactivation</span>
          <span>Patch to multiple HQ mapping</span>
          <span>SVL yearly revision</span>
          <span>Input allocation effective dating</span>
          <span>Notice and SOP publication control</span>
          <span>Rate fixation history</span>
        </div>
      </div>

      {selectedApproval && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3>Review Change Request</h3>
              <button className="close-btn" type="button" onClick={() => setSelectedApproval(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-row"><label>Master:</label><span>{labels[selectedApproval.entity_type] || selectedApproval.entity_type}</span></div>
              <div className="detail-row"><label>Action:</label><span>{actionLabels[selectedApproval.action_type] || selectedApproval.action_type}</span></div>
              <div className="detail-row"><label>Approval Level:</label><span>{levelLabel(selectedApproval.current_level)}</span></div>
              {selectedApproval.data_snapshot && (
                <div className="data-snapshot">
                  <h4>Submitted Data</h4>
                  <pre>{JSON.stringify(selectedApproval.data_snapshot, null, 2)}</pre>
                </div>
              )}
              <div className="form-group">
                <label>Comments</label>
                <textarea value={comments} onChange={(event) => setComments(event.target.value)} rows="3" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger" type="button" onClick={() => handleReject(selectedApproval.id)}>Reject</button>
              <button className="btn btn-success" type="button" onClick={() => handleApprove(selectedApproval.id)}>Approve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdditionDeletionControl
