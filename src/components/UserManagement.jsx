import React, { useState, useEffect } from 'react'
import adminAPI from '../services/apiService'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [headquarters, setHeadquarters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    mobileNumber: '',
    password: '',
    role: 'Field Representative',
    employeeId: '',
    employeeType: 'MR',
    hq_id: '',
    reportingTo: '',
    assigned_manager_id: '',
    status: 'active'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const [usersResponse, hqResponse] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getHeadquarters()
      ])
      const usersData = usersResponse.users || usersResponse || []
      setUsers(usersData)
      const hqData = hqResponse.headquarters || hqResponse || []
      setHeadquarters(Array.isArray(hqData) ? hqData : [])
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load data. Please ensure you are logged in.')
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
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      mobileNumber: '',
      password: '',
      role: 'Field Representative',
      employeeId: '',
      employeeType: 'MR',
      hq_id: '',
      reportingTo: '',
      assigned_manager_id: '',
      status: 'active'
    })
    setEditingUser(null)
  }

  const showAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  const showEditModal = (user) => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      username: user.username || '',
      email: user.email || '',
      mobileNumber: user.mobileNumber || '',
      password: '',
      role: user.role || 'Field Representative',
      employeeId: user.employeeId || '',
      employeeType: user.employeeType || 'MR',
      hq_id: user.hq_id || '',
      reportingTo: user.reportingTo || '',
      assigned_manager_id: user.assigned_manager_id || '',
      status: user.isActive ? 'active' : 'inactive'
    })
    setEditingUser(user)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: `${formData.firstName} ${formData.lastName}`,
        username: formData.username,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        role: formData.role,
        employeeId: formData.employeeId,
        employeeType: formData.employeeType,
        hq_id: formData.hq_id || null,
        reportingTo: formData.reportingTo || null,
        assigned_manager_id: formData.assigned_manager_id || null,
        isActive: formData.status === 'active'
      }
      if (formData.password) {
        userData.password = formData.password
      }

      if (editingUser) {
        await adminAPI.updateUser(editingUser.id, userData)
      } else {
        await adminAPI.createUser(userData)
      }
      closeModal()
      loadData()
    } catch (error) {
      console.error('Error saving user:', error)
      setError('Failed to save user')
    }
  }

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId)
        loadData()
      } catch (error) {
        console.error('Error deleting user:', error)
        setError('Failed to delete user')
      }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="section-content">
        <h2>User Master</h2>
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i> Loading users...
        </div>
      </div>
    )
  }

  return (
    <div className="section-content">
      <h2>User Master</h2>
      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      )}

      <div className="management-actions mb-4 d-flex gap-3">
        <button className="btn btn-primary" onClick={showAddModal}>
          <i className="fas fa-plus"></i> Add New User
        </button>
        <button className="btn btn-info">
          <i className="fas fa-download"></i> Export Users
        </button>
      </div>

      <div className="management-table" style={{ overflowX: 'auto' }}>
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Role</th>
              <th>Employee ID</th>
              <th>HQ</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="10" className="text-center">No users found.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.username || '-'}</td>
                  <td>{user.email}</td>
                  <td>{user.mobileNumber || '-'}</td>
                  <td>{user.role}</td>
                  <td>{user.employeeId || '-'}</td>
                  <td>{user.hq || '-'}</td>
                  <td>
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{formatDate(user.lastLogin)}</td>
                  <td>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => showEditModal(user)}
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                    >
                      <i className="fas fa-edit" style={{ fontSize: '0.75rem' }}></i> Edit
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm ml-1"
                      onClick={() => handleDelete(user.id)}
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                    >
                      <i className="fas fa-trash" style={{ fontSize: '0.75rem' }}></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '600px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
                <button className="close-btn" onClick={closeModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="firstName">First Name *</label>
                        <input type="text" id="firstName" name="firstName" className="form-control" value={formData.firstName} onChange={handleInputChange} required />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="lastName">Last Name *</label>
                        <input type="text" id="lastName" name="lastName" className="form-control" value={formData.lastName} onChange={handleInputChange} required />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="username">Username (Login ID)</label>
                        <input type="text" id="username" name="username" className="form-control" value={formData.username} onChange={handleInputChange} />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input type="email" id="email" name="email" className="form-control" value={formData.email} onChange={handleInputChange} required />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="mobileNumber">Mobile Number</label>
                        <input type="text" id="mobileNumber" name="mobileNumber" className="form-control" value={formData.mobileNumber} onChange={handleInputChange} />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="password">Password {editingUser ? '(leave blank to keep)' : '*'}</label>
                        <input type="password" id="password" name="password" className="form-control" value={formData.password} onChange={handleInputChange} required={!editingUser} />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="employeeId">Employee ID</label>
                        <input type="text" id="employeeId" name="employeeId" className="form-control" value={formData.employeeId} onChange={handleInputChange} />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="employeeType">Employee Type</label>
                        <select id="employeeType" name="employeeType" className="form-control" value={formData.employeeType} onChange={handleInputChange}>
                          <option value="MR">MR (Medical Representative)</option>
                          <option value="TBM">TBM (Territory Business Manager)</option>
                          <option value="ABM">ABM (Area Business Manager)</option>
                          <option value="RBM">RBM (Regional Business Manager)</option>
                          <option value="ZBM">ZBM (Zonal Business Manager)</option>
                          <option value="NSM">NSM (National Sales Manager)</option>
                          <option value="Billing User">Billing User</option>
                          <option value="HR">HR</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="role">Role *</label>
                        <select id="role" name="role" className="form-control" value={formData.role} onChange={handleInputChange} required>
                          <option value="Field Representative">Field Representative</option>
                          <option value="Area Manager">Area Manager</option>
                          <option value="Regional Manager">Regional Manager</option>
                          <option value="Zonal Manager">Zonal Manager</option>
                          <option value="National Manager">National Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="hq_id">HQ (Headquarter)</label>
                        <select id="hq_id" name="hq_id" className="form-control" value={formData.hq_id} onChange={handleInputChange}>
                          <option value="">-- Select HQ --</option>
                          {headquarters.map(hq => (
                            <option key={hq.id} value={hq.id}>{hq.name} ({hq.type})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="assigned_manager_id">Assign Manager</label>
                        <select id="assigned_manager_id" name="assigned_manager_id" className="form-control" value={formData.assigned_manager_id} onChange={handleInputChange}>
                          <option value="">-- Select Manager --</option>
                          {users.filter(u => u.id !== editingUser?.id).map(u => (
                            <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <input type="radio" name="status" value="active" checked={formData.status === 'active'} onChange={handleInputChange} /> Active
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <input type="radio" name="status" value="inactive" checked={formData.status === 'inactive'} onChange={handleInputChange} /> Inactive
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingUser ? 'Update User' : 'Save User'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
