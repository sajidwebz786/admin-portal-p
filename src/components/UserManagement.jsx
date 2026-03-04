import React, { useState, useEffect } from 'react'
import adminAPI from '../services/apiService'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Field Representative',
    status: 'active'
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError('')
      const usersResponse = await adminAPI.getUsers()

      // Handle different response formats
      const usersData = usersResponse.users || usersResponse || []
      setUsers(usersData)
    } catch (error) {
      console.error('Error loading users:', error)
      setError('Failed to load users. Please ensure you are logged in.')
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
      email: '',
      role: 'Field Representative',
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
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
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
        email: formData.email,
        role: formData.role,
        isActive: formData.status === 'active'
      }

      if (editingUser) {
        await adminAPI.updateUser(editingUser.id, userData)
      } else {
        await adminAPI.createUser(userData)
      }

      closeModal()
      loadUsers() // Refresh the users list
    } catch (error) {
      console.error('Error saving user:', error)
      setError('Failed to save user')
    }
  }

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId)
        loadUsers() // Refresh the users list
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
        <h2>User Management</h2>
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i> Loading users...
        </div>
      </div>
    )
  }

  return (
    <div className="section-content">
      <h2>User Management</h2>
      
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

      <div className="management-table">
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
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
                    <i className="fas fa-trash" style={{ fontSize: '0.75rem' }}></i> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
                <button className="close-btn" onClick={closeModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="form-control"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="form-control"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
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
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <select
                      id="role"
                      name="role"
                      className="form-control"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Field Representative">Field Representative</option>
                      <option value="Area Manager">Area Manager</option>
                      <option value="Regional Manager">Regional Manager</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      className="form-control"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingUser ? 'Update User' : 'Save User'}
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

export default UserManagement