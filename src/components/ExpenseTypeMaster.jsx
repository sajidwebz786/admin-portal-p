import React, { useState, useEffect } from 'react'
import adminAPI from '../services/apiService'

const ExpenseTypeMaster = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    expense_type: '',
    short_name: '',
    description: '',
    status: 'active'
  })

  useEffect(() => { loadItems() }, [])

  const loadItems = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await adminAPI.getExpenseTypes()
      setItems(response || [])
    } catch (error) {
      console.error('Error loading expense types:', error)
      setError('Failed to load expense types')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({ expense_type: '', short_name: '', description: '', status: 'active' })
    setEditingItem(null)
  }

  const showAddModal = () => { resetForm(); setShowModal(true) }

  const showEditModal = (item) => {
    setFormData({
      expense_type: item.expense_type || '',
      short_name: item.short_name || '',
      description: item.description || '',
      status: item.status || 'active'
    })
    setEditingItem(item)
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); resetForm() }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await adminAPI.updateExpenseType(editingItem.id, formData)
      } else {
        await adminAPI.createExpenseType(formData)
      }
      closeModal()
      loadItems()
    } catch (error) {
      console.error('Error saving:', error)
      setError('Failed to save expense type')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense type?')) {
      try {
        await adminAPI.deleteExpenseType(id)
        loadItems()
      } catch (error) {
        setError(error.message || 'Failed to delete')
      }
    }
  }

  const filtered = items.filter(item =>
    item.expense_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.short_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="section-content"><h2>Expense Type Master</h2><div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i> Loading...</div></div>
  }

  return (
    <div className="section-content">
      <h2>Expense Type Master</h2>
      {error && <div className="alert alert-danger"><i className="fas fa-exclamation-triangle"></i> {error}</div>}
      <div className="search-bar">
        <input type="text" placeholder="Search expense types..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <button className="btn btn-secondary"><i className="fas fa-search"></i> Search</button>
      </div>
      <div className="management-actions mb-4 d-flex gap-3">
        <button className="btn btn-primary" onClick={showAddModal}><i className="fas fa-plus"></i> Add Expense Type</button>
        <button className="btn btn-info" onClick={loadItems}><i className="fas fa-sync"></i> Refresh</button>
      </div>
      <div className="management-table">
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th>Expense Type</th>
              <th>Short Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="5" className="text-center">{items.length === 0 ? 'No expense types found.' : 'No matches.'}</td></tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id}>
                  <td>{item.expense_type}</td>
                  <td>{item.short_name || '-'}</td>
                  <td>{item.description || '-'}</td>
                  <td><span className={`badge ${item.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{item.status === 'active' ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <button className="btn btn-outline-primary btn-sm" onClick={() => showEditModal(item)}><i className="fas fa-edit"></i> Edit</button>
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
          <div className="modal-dialog" style={{ maxWidth: '500px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editingItem ? 'Edit Expense Type' : 'Add Expense Type'}</h3>
                <button className="close-btn" onClick={closeModal}><i className="fas fa-times"></i></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Expense Type *</label>
                    <input type="text" name="expense_type" className="form-control" value={formData.expense_type} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label>Short Name *</label>
                    <input type="text" name="short_name" className="form-control" value={formData.short_name} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" className="form-control" value={formData.description} onChange={handleInputChange} rows="2" />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" className="form-control" value={formData.status} onChange={handleInputChange}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
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

export default ExpenseTypeMaster
