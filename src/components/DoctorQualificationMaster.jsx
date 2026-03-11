import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';

const DoctorQualificationMaster = () => {
  const [qualifications, setQualifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQualification, setEditingQualification] = useState(null);
  const [formData, setFormData] = useState({
    qualification_name: '',
    short_name: '',
    status: 'active'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQualifications();
  }, []);

  const fetchQualifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/master/doctor-qualifications');
      setQualifications(response.data);
    } catch (err) {
      setError('Failed to fetch doctor qualifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQualification) {
        await api.put(`/master/doctor-qualifications/${editingQualification.qualification_id}`, formData);
      } else {
        await api.post('/master/doctor-qualifications', formData);
      }
      fetchQualifications();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save doctor qualification');
    }
  };

  const handleEdit = (qualification) => {
    setEditingQualification(qualification);
    setFormData({
      qualification_name: qualification.qualification_name,
      short_name: qualification.short_name,
      status: qualification.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor qualification?')) {
      try {
        await api.delete(`/master/doctor-qualifications/${id}`);
        fetchQualifications();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete doctor qualification');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingQualification(null);
    setFormData({
      qualification_name: '',
      short_name: '',
      status: 'active'
    });
    setError('');
  };

  return (
    <div className="doctor-qualification-master">
      <div className="page-header">
        <h2>Doctor Qualification Master</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Qualification
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Qualification Name</th>
                <th>Short Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {qualifications.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">No records found</td>
                </tr>
              ) : (
                qualifications.map((qualification) => (
                  <tr key={qualification.qualification_id}>
                    <td>{qualification.qualification_name}</td>
                    <td>{qualification.short_name}</td>
                    <td>
                      <span className={`status-badge ${qualification.status}`}>
                        {qualification.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-edit"
                        onClick={() => handleEdit(qualification)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-delete"
                        onClick={() => handleDelete(qualification.qualification_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingQualification ? 'Edit Doctor Qualification' : 'Add Doctor Qualification'}</h3>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Qualification Name *</label>
                <input
                  type="text"
                  name="qualification_name"
                  value={formData.qualification_name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Master in Orthopedic Surgery"
                />
              </div>
              <div className="form-group">
                <label>Short Name *</label>
                <input
                  type="text"
                  name="short_name"
                  value={formData.short_name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., MS, Ortho"
                  maxLength="20"
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingQualification ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorQualificationMaster;
