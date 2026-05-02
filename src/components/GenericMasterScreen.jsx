import React, { useEffect, useMemo, useState } from 'react'
import adminAPI from '../services/apiService'

const emptyOption = { value: '', label: 'Select' }
const today = () => new Date().toISOString().slice(0, 10)
const asArray = (value, key) => Array.isArray(value) ? value : (Array.isArray(value?.[key]) ? value[key] : [])

const GenericMasterScreen = ({ masterKey }) => {
  const [records, setRecords] = useState([])
  const [support, setSupport] = useState({ doctors: [], patches: [], headquarters: [], users: [], inputs: [], products: [], samples: [] })
  const [form, setForm] = useState({})
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const options = useMemo(() => ({
    doctors: [emptyOption, ...support.doctors.map((item) => ({ value: item.id, label: `${item.firstName || ''} ${item.lastName || ''}`.trim() || `Doctor ${item.id}` }))],
    patches: [emptyOption, ...support.patches.map((item) => ({ value: item.id, label: item.patch_name || `Patch ${item.id}` }))],
    headquarters: [emptyOption, ...support.headquarters.map((item) => ({ value: item.id, label: item.name || `HQ ${item.id}` }))],
    users: [emptyOption, ...support.users.map((item) => ({ value: item.id, label: item.fullName || `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.email || `User ${item.id}` }))],
    inputs: [emptyOption, ...support.inputs.map((item) => ({ value: item.id, label: item.input_name || `Input ${item.id}` }))],
    products: [emptyOption, ...support.products.map((item) => ({ value: item.id, label: item.name || `Product ${item.id}` }))],
    samples: [emptyOption, ...support.samples.map((item) => ({ value: item.id, label: item.sample_name || `Sample ${item.id}` }))]
  }), [support])

  const configs = useMemo(() => ({
    doctors: {
      title: 'Doctor Master',
      load: () => adminAPI.getDoctors(),
      listKey: 'doctors',
      create: (data) => adminAPI.createDoctor(data),
      update: (id, data) => adminAPI.updateDoctor(id, data),
      remove: (id) => adminAPI.deleteDoctor(id),
      name: (item) => `${item.firstName || ''} ${item.lastName || ''}`.trim(),
      fields: [
        ['firstName', 'Doctor Name', 'text', true],
        ['lastName', 'Surname', 'text', true],
        ['registration_number', 'Registration Number'],
        ['mobile_number', 'Mobile Number', 'tel', true],
        ['specialty', 'Specialty', 'text', true],
        ['qualification_id', 'Qualification ID', 'number'],
        ['hq_id', 'HQ', 'select', true, options.headquarters],
        ['state', 'State', 'text', true],
        ['patch_id', 'Patch', 'select', true, options.patches],
        ['full_address', 'Full Address', 'textarea', true],
        ['visit_time', 'Visit Time', 'text', true],
        ['visit_day', 'Visit Day', 'text', true],
        ['category_id', 'Category ID', 'number'],
        ['class_id', 'Class ID', 'number'],
        ['patients_per_week', 'No. of Patients/Week', 'number', true],
        ['dob', 'DOB', 'date'],
        ['anniversary', 'Anniversary', 'date']
      ]
    },
    chemists: {
      title: 'Chemist Master',
      load: () => adminAPI.getChemists(),
      listKey: 'chemists',
      create: (data) => adminAPI.createChemist(data),
      update: (id, data) => adminAPI.updateChemist(id, data),
      remove: (id) => adminAPI.deleteChemist(id),
      name: (item) => item.name,
      defaults: { visit_time: 'Any time' },
      fields: [
        ['name', 'Chemist Name', 'text', true],
        ['phone', 'Phone Number', 'tel', true],
        ['contact_person', 'Contact Person'],
        ['owner_name', 'Owner Name', 'text', true],
        ['dl_number', 'DL Number'],
        ['state', 'State', 'text', true],
        ['hq_id', 'HQ', 'select', true, options.headquarters],
        ['patch_id', 'Patch', 'select', true, options.patches],
        ['location', 'Location', 'text', true],
        ['visit_time', 'Visit Time', 'text', true],
        ['address', 'Address', 'textarea']
      ]
    },
    stockists: {
      title: 'Stockist Master',
      load: () => adminAPI.getStockists(),
      create: (data) => adminAPI.createStockist(data),
      update: (id, data) => adminAPI.updateStockist(id, data),
      remove: (id) => adminAPI.deleteStockist(id),
      name: (item) => item.stockist_name,
      fields: [
        ['stockist_name', 'Stockist Name', 'text', true],
        ['mobile', 'Mobile', 'tel'],
        ['contact_person', 'Contact Person'],
        ['hq_id', 'HQ', 'select', false, options.headquarters],
        ['state', 'State'],
        ['patch_id', 'Patch', 'select', false, options.patches],
        ['address', 'Address', 'textarea']
      ]
    },
    hospitals: {
      title: 'Hospital Master',
      load: () => adminAPI.getHospitals(),
      create: (data) => adminAPI.createHospital(data),
      update: (id, data) => adminAPI.updateHospital(id, data),
      remove: (id) => adminAPI.deleteHospital(id),
      name: (item) => item.hospital_name,
      fields: [
        ['hospital_name', 'Hospital Name', 'text', true],
        ['mobile', 'Mobile', 'tel'],
        ['contact_person', 'Contact Person'],
        ['hq_id', 'HQ', 'select', false, options.headquarters],
        ['state', 'State'],
        ['patch_id', 'Patch', 'select', false, options.patches],
        ['address', 'Address', 'textarea']
      ]
    },
    svl: {
      title: 'Standard Visiting List',
      load: () => adminAPI.getSVL(),
      create: (data) => adminAPI.createSVL(data),
      remove: (id) => adminAPI.deleteSVL(id),
      name: (item) => item.doctor ? `${item.doctor.firstName || ''} ${item.doctor.lastName || ''}`.trim() : `SVL ${item.id}`,
      defaults: { visit_frequency: 'Weekly', priority: 1, year: new Date().getFullYear() },
      fields: [
        ['doctor_id', 'Doctor', 'select', true, options.doctors],
        ['hq_id', 'HQ', 'select', true, options.headquarters],
        ['visit_frequency', 'Visit Frequency'],
        ['priority', 'Priority', 'number'],
        ['year', 'Revision Year', 'number']
      ]
    },
    inputAllocations: {
      title: 'Input Allocation',
      load: () => adminAPI.getInputAllocations(),
      create: (data) => adminAPI.createInputAllocation(data),
      update: (id, data) => adminAPI.updateInputAllocation(id, data),
      remove: (id) => adminAPI.deleteInputAllocation(id),
      name: (item) => item.product_input || item.input?.input_name || `Allocation ${item.id}`,
      defaults: { allocation_type: 'monthly', start_date: today(), end_date: today() },
      fields: [
        ['user_id', 'User', 'select', true, options.users],
        ['input_id', 'Input', 'select', true, options.inputs],
        ['product_input', 'Product Input'],
        ['qty', 'Qty', 'number', true],
        ['start_date', 'Start Date', 'date', true],
        ['end_date', 'End Date', 'date', true],
        ['allocation_type', 'Allocation Type', 'select', false, [{ value: 'monthly', label: 'Monthly' }, { value: 'quarterly', label: 'Quarterly' }]]
      ]
    },
    notices: {
      title: 'Notice Upload',
      load: () => adminAPI.getNotices(),
      create: (data) => adminAPI.createNotice(data),
      update: (id, data) => adminAPI.updateNotice(id, data),
      remove: (id) => adminAPI.deleteNotice(id),
      name: (item) => item.title,
      defaults: { audience: 'all', effective_date: today() },
      fields: [
        ['notice_id', 'Notice ID', 'text', true],
        ['title', 'Title', 'text', true],
        ['notice_document', 'Notice Document URL/Path', 'text', true],
        ['effective_date', 'Effective Date', 'date', true],
        ['audience', 'Audience', 'select', false, [{ value: 'all', label: 'All' }, { value: 'mr', label: 'MR' }, { value: 'abm', label: 'ABM' }, { value: 'admin', label: 'Admin' }, { value: 'field_force', label: 'Field Force' }]]
      ]
    },
    sopPolicies: {
      title: 'SOP / Policy Master',
      load: () => adminAPI.getSOPPolicies(),
      create: (data) => adminAPI.createSOPPolicy(data),
      update: (id, data) => adminAPI.updateSOPPolicy(id, data),
      remove: (id) => adminAPI.deleteSOPPolicy(id),
      name: (item) => item.designation,
      defaults: { start_date: today() },
      fields: [
        ['designation', 'Designation', 'text', true],
        ['sop_document', 'SOP Document URL/Path'],
        ['probation_policy', 'Probation Policy', 'textarea'],
        ['regular_policy', 'Regular Policy', 'textarea'],
        ['whistle_blower_policy', 'Whistle Blower Policy', 'textarea'],
        ['start_date', 'Start Date', 'date', true],
        ['end_date', 'End Date', 'date']
      ]
    },
    rateFixations: {
      title: 'Rate Fixation',
      load: () => adminAPI.getRateFixations(),
      create: (data) => adminAPI.createRateFixation(data),
      update: (id, data) => adminAPI.updateRateFixation(id, data),
      remove: (id) => adminAPI.deleteRateFixation(id),
      name: (item) => `${item.state} - ${item.product?.name || item.product_id}`,
      defaults: { effective_from: today() },
      fields: [
        ['state', 'State', 'text', true],
        ['product_id', 'Product', 'select', true, options.products],
        ['sample_id', 'Sample', 'select', false, options.samples],
        ['input_id', 'Input', 'select', false, options.inputs],
        ['pts', 'PTS', 'number'],
        ['ptr', 'PTR', 'number'],
        ['mrp', 'MRP', 'number'],
        ['nrv', 'NRV', 'number'],
        ['effective_from', 'Start Date', 'date', true],
        ['effective_to', 'End Date', 'date']
      ]
    }
  }), [options])

  const config = configs[masterKey] || configs.chemists

  useEffect(() => {
    loadSupport()
  }, [])

  useEffect(() => {
    loadRecords()
  }, [masterKey])

  const loadSupport = async () => {
    const [doctorRes, patchRes, hqRes, userRes, inputRes, productRes, sampleRes] = await Promise.all([
      adminAPI.getDoctors().catch(() => []),
      adminAPI.getPatches().catch(() => []),
      adminAPI.getHeadquarters().catch(() => []),
      adminAPI.getUsers().catch(() => []),
      adminAPI.getInputs().catch(() => []),
      adminAPI.getProducts().catch(() => []),
      adminAPI.getSamples().catch(() => [])
    ])
    setSupport({
      doctors: asArray(doctorRes, 'doctors'),
      patches: asArray(patchRes, 'patches'),
      headquarters: asArray(hqRes, 'headquarters'),
      users: asArray(userRes, 'users'),
      inputs: asArray(inputRes, 'inputs'),
      products: asArray(productRes, 'products'),
      samples: asArray(sampleRes, 'samples')
    })
  }

  const loadRecords = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await config.load()
      setRecords(asArray(response, config.listKey))
      setForm(config.defaults || {})
      setEditing(null)
    } catch (err) {
      setError(err.message || 'Failed to load records')
    } finally {
      setLoading(false)
    }
  }

  const sanitize = (data) => Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value === '' ? null : value]))

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payload = sanitize(form)
    if (editing && config.update) await config.update(editing.id, payload)
    else await config.create(payload)
    await loadRecords()
    await loadSupport()
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Inactivate ${config.name(item) || config.title}?`)) return
    await config.remove(item.id)
    await loadRecords()
  }

  const renderField = ([key, label, type = 'text', required = false, fieldOptions = []]) => {
    const value = form[key] ?? ''
    if (type === 'textarea') {
      return (
        <label className="form-group" key={key}>
          <span>{label}{required ? ' *' : ''}</span>
          <textarea value={value} required={required} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
        </label>
      )
    }
    if (type === 'select') {
      return (
        <label className="form-group" key={key}>
          <span>{label}{required ? ' *' : ''}</span>
          <select value={value} required={required} onChange={(e) => setForm({ ...form, [key]: e.target.value })}>
            {fieldOptions.map((option) => <option key={`${key}-${option.value}`} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      )
    }
    return (
      <label className="form-group" key={key}>
        <span>{label}{required ? ' *' : ''}</span>
        <input type={type} value={value} required={required} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
      </label>
    )
  }

  return (
    <div className="section-content">
      <div className="page-header">
        <h2>{config.title}</h2>
        <button type="button" className="btn btn-secondary" onClick={loadRecords}>Refresh</button>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <form className="master-admin-form" onSubmit={handleSubmit}>
        {config.fields.map(renderField)}
        <div className="master-admin-actions">
          <button type="submit" className="btn btn-primary">{editing ? 'Save Changes' : `Add ${config.title}`}</button>
          {editing && <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setForm(config.defaults || {}) }}>Cancel</button>}
        </div>
      </form>
      <table className="table table-striped table-bordered">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan="5" className="text-center">Loading...</td></tr>}
          {!loading && records.length === 0 && <tr><td colSpan="5" className="text-center">No records found.</td></tr>}
          {!loading && records.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{config.name(item)}</td>
              <td>{item.isActive === false || item.status === 'inactive' ? 'Inactive' : 'Active'}</td>
              <td>{item.updatedAt || item.updated_at || '-'}</td>
              <td>
                {config.update && <button type="button" className="btn btn-outline-primary btn-sm me-1" onClick={() => { setEditing(item); setForm({ ...(config.defaults || {}), ...item }) }}>Edit</button>}
                <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(item)}>Inactivate</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default GenericMasterScreen
