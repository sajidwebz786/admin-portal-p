import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';

const ApprovalDashboard = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/approvals/all-pending');
      setPendingApprovals(response.data);
    } catch (err) {
      setError('Failed to fetch pending approvals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/approvals/${id}/approve`, { comments });
      setSuccess('Approved successfully');
      setError('');
      fetchPendingApprovals();
      setSelectedApproval(null);
      setComments('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    if (!comments) {
      setError('Please provide a reason for rejection');
      return;
    }
    try {
      await api.post(`/approvals/${id}/reject`, { comments });
      setSuccess('Rejected successfully');
      setError('');
      fetchPendingApprovals();
      setSelectedApproval(null);
      setComments('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject');
    }
  };

  const getEntityTypeLabel = (type) => {
    const labels = {
      doctor: 'Doctor',
      chemist: 'Chemist',
      territory: 'Territory',
      headquarter: 'Headquarter',
      hospital: 'Hospital'
    };
    return labels[type] || type;
  };

  const getActionTypeLabel = (type) => {
    const labels = {
      create: 'New Entry',
      update: 'Update',
      delete: 'Deletion'
    };
    return labels[type] || type;
  };

  const getCurrentLevelLabel = (level) => {
    const labels = {
      0: 'Admin/Head Office',
      1: 'TBM',
      2: 'ABM',
      3: 'RSM/RBM',
      4: 'ZSM/ZBM',
      5: 'NSM'
    };
    return labels[level] || `Level ${level}`;
  };

  return (
    <div className="approval-dashboard">
      <div className="page-header">
        <h2>Approval Dashboard</h2>
        <button className="btn btn-refresh" onClick={fetchPendingApprovals}>
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="approval-summary">
        <div className="summary-card">
          <h3>Pending Approvals</h3>
          <p className="count">{pendingApprovals.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : pendingApprovals.length === 0 ? (
        <div className="empty-state">
          <p>No pending approvals</p>
        </div>
      ) : (
        <div className="approvals-list">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Entity Type</th>
                <th>Action</th>
                <th>Submitted By</th>
                <th>Role</th>
                <th>Current Level</th>
                <th>Submitted Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingApprovals.map((approval) => (
                <tr key={approval.id}>
                  <td>{approval.id}</td>
                  <td>{getEntityTypeLabel(approval.entity_type)}</td>
                  <td>
                    <span className={`action-badge ${approval.action_type}`}>
                      {getActionTypeLabel(approval.action_type)}
                    </span>
                  </td>
                  <td>
                    {approval.submitter ? 
                      `${approval.submitter.firstName} ${approval.submitter.lastName}` 
                      : 'Unknown'}
                  </td>
                  <td>{approval.submitted_by_role}</td>
                  <td>{getCurrentLevelLabel(approval.current_level)}</td>
                  <td>{new Date(approval.submitted_date).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-view"
                      onClick={() => setSelectedApproval(approval)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedApproval && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3>Approval Details</h3>
              <button className="close-btn" onClick={() => {
                setSelectedApproval(null);
                setComments('');
                setError('');
              }}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>Entity Type:</label>
                <span>{getEntityTypeLabel(selectedApproval.entity_type)}</span>
              </div>
              <div className="detail-row">
                <label>Action:</label>
                <span>{getActionTypeLabel(selectedApproval.action_type)}</span>
              </div>
              <div className="detail-row">
                <label>Submitted By:</label>
                <span>
                  {selectedApproval.submitter ? 
                    `${selectedApproval.submitter.firstName} ${selectedApproval.submitter.lastName}` 
                    : 'Unknown'}
                  </span>
              </div>
              <div className="detail-row">
                <label>Role:</label>
                <span>{selectedApproval.submitted_by_role}</span>
              </div>
              <div className="detail-row">
                <label>Current Approval Level:</label>
                <span>{getCurrentLevelLabel(selectedApproval.current_level)}</span>
              </div>
              <div className="detail-row">
                <label>Submitted Date:</label>
                <span>{new Date(selectedApproval.submitted_date).toLocaleString()}</span>
              </div>
              
              {selectedApproval.data_snapshot && (
                <div className="data-snapshot">
                  <h4>Data Details:</h4>
                  <pre>{JSON.stringify(selectedApproval.data_snapshot, null, 2)}</pre>
                </div>
              )}
              
              <div className="form-group">
                <label>Comments (Required for rejection):</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter your comments here..."
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-danger"
                onClick={() => handleReject(selectedApproval.id)}
              >
                Reject
              </button>
              <button 
                className="btn btn-success"
                onClick={() => handleApprove(selectedApproval.id)}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalDashboard;
