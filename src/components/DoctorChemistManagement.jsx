import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import adminAPI from '../services/apiService'
// import 'bootstrap/dist/css/bootstrap.min.css'

// ✅ Reusable Modal Component
const Modal = ({ show, onClose, title, children }) => {
  useEffect(() => {
    if (!show) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [show, onClose])

  if (!show) return null

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflowY: 'auto'
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '8px',
          padding: '20px',
          width: '90%',
          maxWidth: '500px',
          margin: '40px auto',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}
        >
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>,
    document.body
  )
}

// ✅ Main Component
const DoctorChemistManagement = () => {
  const [doctors, setDoctors] = useState([])
  const [chemists, setChemists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  // filter dropdowns
  const [filterSpecialty, setFilterSpecialty] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterTerritory, setFilterTerritory] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('doctor')
  const [editingItem, setEditingItem] = useState(null)

  // support masters for doctor form
  const [doctorCategories, setDoctorCategories] = useState([])
  const [doctorSpecialties, setDoctorSpecialties] = useState([])
  const [doctorQualifications, setDoctorQualifications] = useState([])
  const [territories, setTerritories] = useState([])
  const [headquarters, setHeadquarters] = useState([])

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialty_id: null,
    category_id: null,
    qualification_id: null,
    territory_id: null,
    hq_id: null,
    location: '',
    address: '',
    phone: '',
    email: ''
  })

  useEffect(() => {
    loadData()
    loadSupportingData()
  }, [])

  // ✅ Fetch doctors & chemists
  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const doctorsResponse = await adminAPI.getDoctors()
      const chemistsResponse = await adminAPI.getChemists()

      const doctorsArray = Array.isArray(doctorsResponse)
        ? doctorsResponse
        : doctorsResponse.doctors || []
      const chemistsArray = Array.isArray(chemistsResponse)
        ? chemistsResponse
        : chemistsResponse.chemists || []

      setDoctors(doctorsArray)
      setChemists(chemistsArray)
    } catch (err) {
      console.error(err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Fetch supporting master lists (categories, specialties, qualifications, territories, HQ)
  const loadSupportingData = async () => {
    try {
      const [cats, specs, quals, terrs, hqs] = await Promise.all([
        adminAPI.getDoctorCategories(),
        adminAPI.getDoctorSpecialties(),
        adminAPI.getDoctorQualifications(),
        adminAPI.getTerritories(),
        adminAPI.getHeadquarters()
      ])
      setDoctorCategories(Array.isArray(cats) ? cats : cats.categories || [])
      setDoctorSpecialties(Array.isArray(specs) ? specs : specs.specialties || [])
      setDoctorQualifications(Array.isArray(quals) ? quals : quals.qualifications || [])
      setTerritories(Array.isArray(terrs) ? terrs : terrs.territories || [])
      setHeadquarters(Array.isArray(hqs) ? hqs : hqs.headquarters || [])
    } catch (err) {
      console.error('failed to load supporting data', err)
    }
  }

  // ✅ Filtered lists
  const filteredDoctors = doctors.filter((d) => {
    let ok = true
    if (searchTerm) {
      ok =
        d.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.specialtyData?.specialty_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    }
    if (ok && filterSpecialty) {
      ok = d.specialty_id === parseInt(filterSpecialty)
    }
    if (ok && filterCategory) {
      ok = d.category_id === parseInt(filterCategory)
    }
    if (ok && filterTerritory) {
      ok = d.territory_id === parseInt(filterTerritory)
    }
    return ok
  })
  const filteredChemists = chemists.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // ✅ Handle Add / Edit button click
  const handleOpenModal = (type, item = null) => {
    setModalType(type)
    setEditingItem(item)
    if (item) {
      // Prefill form for edit
      if (type === 'doctor') {
        setFormData({
          firstName: item.firstName,
          lastName: item.lastName,
          specialty_id: item.specialty_id || item.specialtyData?.specialty_id || null,
          category_id: item.category_id || item.categoryData?.category_id || null,
          qualification_id: item.qualification_id || item.qualificationData?.qualification_id || null,
          territory_id: item.territory_id,
          hq_id: item.hq_id,
          location: item.location,
          address: item.address,
          phone: item.phone,
          email: item.email
        })
      } else {
        setFormData({
          firstName: item.name,
          lastName: '',
          specialty_id: null,
          category_id: null,
          qualification_id: null,
          territory_id: null,
          hq_id: null,
          location: item.location,
          address: item.address,
          phone: item.phone,
          email: item.email
        })
      }
    } else {
      // Clear form for add
      setFormData({
        firstName: '',
        lastName: '',
        specialty_id: null,
        category_id: null,
        qualification_id: null,
        territory_id: null,
        hq_id: null,
        location: '',
        address: '',
        phone: '',
        email: ''
      })
    }
    setShowModal(true)
  }

  // ✅ Handle form change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // ✅ Handle Add / Update submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (modalType === 'doctor') {
        if (editingItem) {
          await adminAPI.updateDoctor(editingItem.id, formData)
          alert('Doctor updated successfully!')
        } else {
          await adminAPI.createDoctor(formData)
          alert('Doctor added successfully!')
        }
      } else {
        const chemistData = {
          name: formData.firstName,
          location: formData.location,
          address: formData.address,
          phone: formData.phone,
          email: formData.email
        }
        if (editingItem) {
          await adminAPI.updateChemist(editingItem.id, chemistData)
          alert('Chemist updated successfully!')
        } else {
          await adminAPI.createChemist(chemistData)
          alert('Chemist added successfully!')
        }
      }
      setShowModal(false)
      setEditingItem(null)
      loadData()
    } catch (err) {
      console.error(err)
      alert('Failed to save data')
    }
  }

  // ✅ Handle Delete
  const handleDelete = async (type, item) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return
    try {
      if (type === 'doctor') await adminAPI.deleteDoctor(item.id)
      else await adminAPI.deleteChemist(item.id)
      alert('Record deleted successfully!')
      loadData()
    } catch (err) {
      console.error(err)
      alert('Failed to delete record')
    }
  }

  if (loading)
    return (
      <div className="section-content">
        <h2>Doctor & Chemist Management</h2>
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i> Loading data...
        </div>
      </div>
    )

  return (
    <div className="section-content">
      <h2>Doctor & Chemist Management</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Search + filters */}
      <div className="mb-3 d-flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control"
          style={{ minWidth: '200px' }}
        />
        <select
          className="form-control"
          value={filterSpecialty}
          onChange={(e) => setFilterSpecialty(e.target.value)}
          style={{ minWidth: '180px' }}
        >
          <option value="">All Specialties</option>
          {doctorSpecialties.map((s) => (
            <option key={s.specialty_id} value={s.specialty_id}>
              {s.specialty_name}
            </option>
          ))}
        </select>
        <select
          className="form-control"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ minWidth: '180px' }}
        >
          <option value="">All Categories</option>
          {doctorCategories.map((c) => (
            <option key={c.category_id} value={c.category_id}>
              {c.category_name}
            </option>
          ))}
        </select>
        <select
          className="form-control"
          value={filterTerritory}
          onChange={(e) => setFilterTerritory(e.target.value)}
          style={{ minWidth: '180px' }}
        >
          <option value="">All Territories</option>
          {territories.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="mb-4 d-flex gap-3">
        <button
          className="btn btn-primary"
          onClick={() => handleOpenModal('doctor')}
        >
          <i className="fas fa-plus"></i> Add Doctor
        </button>
        <button
          className="btn btn-primary"
          onClick={() => handleOpenModal('chemist')}
        >
          <i className="fas fa-plus"></i> Add Chemist
        </button>
        <button className="btn btn-secondary" onClick={loadData}>
          <i className="fas fa-refresh"></i> Refresh
        </button>
      </div>

      {/* Doctors Table */}
      <h4>Doctors</h4>
      <table className="table table-striped table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Specialty</th>
            <th>Category</th>
            <th>Qualification</th>
            <th>Territory</th>
            <th>HQ</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDoctors.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                No doctors found.
              </td>
            </tr>
          ) : (
            filteredDoctors.map((d) => (
              <tr key={d.id}>
                <td>{d.firstName} {d.lastName}</td>
                <td>{d.specialtyData?.specialty_name || '-'}</td>
                <td>{d.categoryData?.category_name || '-'}</td>
                <td>{d.qualificationData?.qualification_name || '-'}</td>
                <td>{territories.find(t=>t.id===d.territory_id)?.name || '-'}</td>
                <td>{headquarters.find(h=>h.id===d.hq_id)?.name || '-'}</td>
                <td>{d.location}</td>
                <td>
                  <span className={`badge ${d.isActive ? 'bg-success' : 'bg-danger'}`}>
                    {d.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-outline-primary btn-sm me-1"
                    onClick={() => handleOpenModal('doctor', d)}
                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                  >
                    <i className="fas fa-edit" style={{ fontSize: '0.75rem' }}></i> Edit
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete('doctor', d)}
                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                  >
                    <i className="fas fa-trash" style={{ fontSize: '0.75rem' }}></i> Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Chemists Table */}
      <h4>Chemists</h4>
      <table className="table table-striped table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredChemists.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">
                No chemists found.
              </td>
            </tr>
          ) : (
            filteredChemists.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.location}</td>
                <td>
                  <span className={`badge ${c.isActive ? 'bg-success' : 'bg-danger'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-outline-primary btn-sm me-1"
                    onClick={() => handleOpenModal('chemist', c)}
                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                  >
                    <i className="fas fa-edit" style={{ fontSize: '0.75rem' }}></i> Edit
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete('chemist', c)}
                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                  >
                    <i className="fas fa-trash" style={{ fontSize: '0.75rem' }}></i> Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ✅ Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={`${editingItem ? 'Edit' : 'Add'} ${
          modalType === 'doctor' ? 'Doctor' : 'Chemist'
        }`}
      >
        <form onSubmit={handleSubmit}>
          {modalType === 'doctor' && (
            <>
              <div className="mb-2">
                <label>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-2">
                <label>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </div>

              <div className="mb-2">
                <label>Specialty</label>
                <select
                  name="specialty_id"
                  value={formData.specialty_id || ''}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">-- Select --</option>
                  {doctorSpecialties.map((s) => (
                    <option key={s.specialty_id} value={s.specialty_id}>
                      {s.specialty_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-2">
                <label>Category</label>
                <select
                  name="category_id"
                  value={formData.category_id || ''}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">-- Select --</option>
                  {doctorCategories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-2">
                <label>Qualification</label>
                <select
                  name="qualification_id"
                  value={formData.qualification_id || ''}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">-- Select --</option>
                  {doctorQualifications.map((q) => (
                    <option key={q.qualification_id} value={q.qualification_id}>
                      {q.qualification_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-2">
                <label>Territory</label>
                <select
                  name="territory_id"
                  value={formData.territory_id || ''}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">-- Select --</option>
                  {territories.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-2">
                <label>Headquarter</label>
                <select
                  name="hq_id"
                  value={formData.hq_id || ''}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">-- Select --</option>
                  {headquarters.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          {modalType === 'chemist' && (
            <div className="mb-2">
              <label>Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="form-control"
              />
            </div>
          )}
          <div className="mb-2">
            <label>Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              className="form-control"
            />
          </div>
          <div className="mb-2">
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="form-control"
              rows={3}
            ></textarea>
          </div>
          <div className="mb-2">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="mb-2">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingItem ? 'Update' : 'Add'} {modalType === 'doctor' ? 'Doctor' : 'Chemist'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default DoctorChemistManagement
