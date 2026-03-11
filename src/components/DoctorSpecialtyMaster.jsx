import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';

const DoctorSpecialtyMaster = () => {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState(null);
  const [formData, setFormData] = useState({
    specialty_name: '',
    short_name: '',
    status: 'active'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      setLoading(true);
      const response = await api.get('/master/doctor-specialties');
      setSpecialties(response.data);
    } catch (err) {
      setError('Failed to fetch doctor specialties');
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
      if (editingSpecialty) {
        await api.put(`/master/doctor-specialties/${editingSpecialty.specialty_id}`, formData);
      } else {
        await api.post('/master/doctor-specialties', formData);
      }
      fetchSpecialties();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save doctor specialty');
    }
  };

  const handleEdit = (specialty) => {
    setEditingSpecialty(specialty);
    setFormData({
      specialty_name: specialty.specialty_name,
      short_name: specialty.short_name,
      status: specialty.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor specialty?')) {
      try {
        await api.delete(`/master/doctor-specialties/${id}`);
        fetchSpecialties();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete doctor specialty');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSpecialty(null);
    setFormData({
      specialty_name: '',
      short_name: '',
      status: 'active'
    });
    setError('');
  };

  return (
    <div className="doctor-specialty-master">
      <div className="page-header">
        <h2>Doctor Specialty Master</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Specialty
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
                <th>Specialty Name</th>
                <th>Short Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {specialties.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">No records found</td>
                </tr>
              ) : (
                specialties.map((specialty) => (
                  <tr key={specialty.specialty_id}>
                    <td>{specialty.specialty_name}</td>
                    <td>{specialty.short_name}</td>
                    <td>
                      <span className={`status-badge ${specialty.status}`}>
                        {specialty.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-edit"
                        onClick={() => handleEdit(specialty)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-delete"
                        onClick={() => handleDelete(specialty.specialty_id)}
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
              <h3>{editingSpecialty ? 'Edit Doctor Specialty' : 'Add Doctor Specialty'}</h3>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Specialty Name *</label>
                <input
                  type="text"
                  name="specialty_name"
                  value={formData.specialty_name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., General Surgeon, Cardiologist"
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
                  placeholder="e.g., GS, CARD"
                  maxLength="10"
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
                  {editingSpecialty ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSpecialtyMaster;
