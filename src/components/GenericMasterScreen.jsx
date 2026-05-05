import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import adminAPI from '../services/apiService'
import BulkUploadPanel from './BulkUploadPanel'

const emptyOption = { value: '', label: 'Select' }
const today = () => new Date().toISOString().slice(0, 10)
const asArray = (value, key) => Array.isArray(value) ? value : (Array.isArray(value?.[key]) ? value[key] : [])
const uniqueOptions = (values) => [emptyOption, ...Array.from(new Set(values.filter(Boolean))).sort().map((value) => ({ value, label: value }))]

const GenericMasterScreen = ({ masterKey, mode = 'addition' }) => {
  const [records, setRecords] = useState([])
  const [support, setSupport] = useState({
    doctors: [],
    patches: [],
    territories: [],
    headquarters: [],
    users: [],
    inputs: [],
    products: [],
    samples: [],
    doctorClasses: [],
    doctorCategories: [],
    doctorSpecialties: [],
    doctorQualifications: []
  })
  const [form, setForm] = useState({})
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const options = useMemo(() => {
    const filteredTerritories = support.territories.filter((item) => {
      const matchesHq = !form.hq_id || String(item.hq_id) === String(form.hq_id)
      const matchesState = !form.state || item.state === form.state
      return matchesHq && matchesState
    })
    return {
      doctors: [emptyOption, ...support.doctors.map((item) => ({ value: item.id, label: `${item.firstName || ''} ${item.lastName || ''}`.trim() || `Doctor ${item.id}` }))],
      patches: [emptyOption, ...support.patches.map((item) => ({ value: item.id, label: item.patch_name || `Patch ${item.id}` }))],
      territoriesAll: [emptyOption, ...support.territories.map((item) => ({ value: item.id, label: `${item.name || `Patch/Route ${item.id}`}${item.code ? ` (${item.code})` : ''}` }))],
      territories: [emptyOption, ...filteredTerritories.map((item) => ({ value: item.id, label: `${item.name || `Patch/Route ${item.id}`}${item.code ? ` (${item.code})` : ''}` }))],
      headquarters: [emptyOption, ...support.headquarters.map((item) => ({ value: item.id, label: `${item.name || `HQ ${item.id}`}${item.code ? ` (${item.code})` : ''}` }))],
      states: uniqueOptions([
        ...support.headquarters.map((item) => item.state),
        ...support.territories.map((item) => item.state),
        ...support.patches.map((item) => item.state)
      ]),
      users: [emptyOption, ...support.users.map((item) => ({ value: item.id, label: item.fullName || `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.email || `User ${item.id}` }))],
      inputs: [emptyOption, ...support.inputs.map((item) => ({ value: item.id, label: item.input_name || `Input ${item.id}` }))],
      products: [emptyOption, ...support.products.map((item) => ({ value: item.id, label: item.name || `Product ${item.id}` }))],
      samples: [emptyOption, ...support.samples.map((item) => ({ value: item.id, label: item.sample_name || `Sample ${item.id}` }))],
      doctorClasses: [emptyOption, ...support.doctorClasses.map((item) => ({ value: item.id, label: `${item.class_name || `Class ${item.id}`}${item.short_name ? ` (${item.short_name})` : ''}` }))],
      doctorCategories: [emptyOption, ...support.doctorCategories.map((item) => ({ value: item.id, label: `${item.category_name || `Category ${item.id}`}${item.short_name ? ` (${item.short_name})` : ''}` }))],
      doctorSpecialties: [emptyOption, ...support.doctorSpecialties.map((item) => ({ value: item.id, label: `${item.specialty_name || `Specialty ${item.id}`}${item.short_name ? ` (${item.short_name})` : ''}` }))],
      doctorQualifications: [emptyOption, ...support.doctorQualifications.map((item) => ({ value: item.id, label: `${item.qualification_name || `Qualification ${item.id}`}${item.short_name ? ` (${item.short_name})` : ''}` }))]
    }
  }, [support, form.hq_id, form.state])

  const configs = useMemo(() => ({
    doctors: {
      title: 'Doctor',
      shortTitle: 'Doctor',
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
        ['specialty_id', 'Specialty', 'select', true, options.doctorSpecialties],
        ['qualification_id', 'Qualification', 'select', false, options.doctorQualifications],
        ['hq_id', 'HQ', 'select', true, options.headquarters],
        ['state', 'State', 'select', true, options.states],
        ['territory_id', 'Patch / Route', 'select', true, options.territories],
        ['full_address', 'Full Address', 'textarea', true],
        ['visit_time', 'Visit Time', 'text', true],
        ['visit_day', 'Visit Day', 'text', true],
        ['category_id', 'Category', 'select', false, options.doctorCategories],
        ['class_id', 'Class', 'select', false, options.doctorClasses],
        ['patients_per_week', 'No. of Patients/Week', 'number', true],
        ['dob', 'DOB', 'date'],
        ['anniversary', 'Anniversary', 'date']
      ]
    },
    chemists: {
      title: 'Chemist',
      shortTitle: 'Chemist',
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
        ['state', 'State', 'select', true, options.states],
        ['hq_id', 'HQ', 'select', true, options.headquarters],
        ['territory_id', 'Patch / Route', 'select', true, options.territories],
        ['location', 'Location', 'text', true],
        ['visit_time', 'Visit Time', 'text', true],
        ['address', 'Address', 'textarea']
      ]
    },
    stockists: {
      title: 'Stockist',
      shortTitle: 'Stockist',
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
        ['state', 'State', 'select', false, options.states],
        ['territory_id', 'Patch / Route', 'select', false, options.territories],
        ['address', 'Address', 'textarea']
      ]
    },
    hospitals: {
      title: 'Hospital',
      shortTitle: 'Hospital',
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
        ['state', 'State', 'select', false, options.states],
        ['territory_id', 'Patch / Route', 'select', false, options.territories],
        ['address', 'Address', 'textarea']
      ]
    },
    svl: {
      title: 'SVL',
      shortTitle: 'SVL Entry',
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
      shortTitle: 'Input Allocation',
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
      shortTitle: 'Notice',
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
      title: 'SOP / Policy',
      shortTitle: 'SOP / Policy',
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
      shortTitle: 'Rate Fixation',
      load: () => adminAPI.getRateFixations(),
      create: (data) => adminAPI.createRateFixation(data),
      update: (id, data) => adminAPI.updateRateFixation(id, data),
      remove: (id) => adminAPI.deleteRateFixation(id),
      name: (item) => `${item.state} - ${item.product?.name || item.product_id}`,
      defaults: { effective_from: today() },
      fields: [
        ['state', 'State', 'select', true, options.states],
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
  const isDeletionMode = mode === 'deletion'
  const operationLabel = isDeletionMode ? 'Deletion' : 'Addition'
  const modeTitle = `${config.shortTitle || config.title} ${operationLabel}`
  const modeDescription = isDeletionMode
    ? `Search existing ${config.shortTitle || 'records'} records and submit only deletion or deactivation requests.`
    : `Create only new ${config.shortTitle || 'record'} records from this screen.`

  useEffect(() => {
    loadSupport()
  }, [])

  useEffect(() => {
    loadRecords()
  }, [masterKey])

  const loadSupport = async () => {
    const [
      doctorRes,
      patchRes,
      territoryRes,
      hqRes,
      userRes,
      inputRes,
      productRes,
      sampleRes,
      classRes,
      categoryRes,
      specialtyRes,
      qualificationRes
    ] = await Promise.all([
      adminAPI.getDoctors().catch(() => []),
      adminAPI.getPatches().catch(() => []),
      adminAPI.getTerritories().catch(() => []),
      adminAPI.getHeadquarters().catch(() => []),
      adminAPI.getUsers().catch(() => []),
      adminAPI.getInputs().catch(() => []),
      adminAPI.getProducts().catch(() => []),
      adminAPI.getSamples().catch(() => []),
      adminAPI.getDoctorClasses().catch(() => []),
      adminAPI.getDoctorCategories().catch(() => []),
      adminAPI.getDoctorSpecialties().catch(() => []),
      adminAPI.getDoctorQualifications().catch(() => [])
    ])
    setSupport({
      doctors: asArray(doctorRes, 'doctors'),
      patches: asArray(patchRes, 'patches'),
      territories: asArray(territoryRes, 'territories'),
      headquarters: asArray(hqRes, 'headquarters'),
      users: asArray(userRes, 'users'),
      inputs: asArray(inputRes, 'inputs'),
      products: asArray(productRes, 'products'),
      samples: asArray(sampleRes, 'samples'),
      doctorClasses: asArray(classRes, 'classes'),
      doctorCategories: asArray(categoryRes, 'categories'),
      doctorSpecialties: asArray(specialtyRes, 'specialties'),
      doctorQualifications: asArray(qualificationRes, 'qualifications')
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
  const bulkFields = config.fields.map(([key, label, type = 'text', required = false, fieldOptions = []]) => ({
    key,
    label,
    type: type === 'textarea' ? 'text' : type,
    required,
    options: key === 'territory_id' ? options.territoriesAll : fieldOptions
  }))

  const handleFieldChange = (key, value) => {
    const nextForm = { ...form, [key]: value }
    if (key === 'hq_id') {
      const hq = support.headquarters.find((item) => String(item.id) === String(value))
      nextForm.state = hq?.state || nextForm.state || ''
      nextForm.territory_id = ''
    }
    if (key === 'state') {
      nextForm.territory_id = ''
    }
    setForm(nextForm)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payload = sanitize(form)
    await config.create(payload)
    await loadRecords()
    await loadSupport()
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Deactivate ${config.name(item) || config.shortTitle || config.title}?`)) return
    await config.remove(item.id)
    await loadRecords()
  }

  const renderField = ([key, label, type = 'text', required = false, fieldOptions = []]) => {
    const value = form[key] ?? ''
    if (type === 'textarea') {
      return (
        <label className="form-group" key={key}>
          <span>{label}{required ? ' *' : ''}</span>
          <textarea value={value} required={required} onChange={(e) => handleFieldChange(key, e.target.value)} />
        </label>
      )
    }
    if (type === 'select') {
      return (
        <label className="form-group" key={key}>
          <span>{label}{required ? ' *' : ''}</span>
          <select value={value} required={required} onChange={(e) => handleFieldChange(key, e.target.value)}>
            {fieldOptions.map((option) => <option key={`${key}-${option.value}`} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      )
    }
    return (
      <label className="form-group" key={key}>
        <span>{label}{required ? ' *' : ''}</span>
        <input type={type} value={value} required={required} onChange={(e) => handleFieldChange(key, e.target.value)} />
      </label>
    )
  }

  return (
    <div className="section-content">
      <div className={`page-header operation-mode-header ${isDeletionMode ? 'deletion' : 'addition'}`}>
        <div>
          <h2 className="addition-deletion-title">{modeTitle}</h2>
          <p>{modeDescription}</p>
        </div>
        <div className="operation-header-actions">
          <Link to="/addition-deletion-control" className="btn btn-light">Back</Link>
          <button type="button" className="btn btn-secondary" onClick={loadRecords}>Refresh</button>
        </div>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {!isDeletionMode && (
        <>
          <BulkUploadPanel
            title={config.shortTitle || config.title}
            fields={bulkFields}
            defaults={config.defaults || {}}
            createRecord={(payload) => config.create(sanitize(payload))}
            onComplete={async () => {
              await loadRecords()
              await loadSupport()
            }}
          />
          <form className="master-admin-form" onSubmit={handleSubmit}>
            {config.fields.map(renderField)}
            <div className="master-admin-actions">
              <button type="submit" className="btn btn-primary">Add {config.shortTitle || config.title}</button>
            </div>
          </form>
        </>
      )}
      <table className="table table-striped table-bordered">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
            <th>Updated</th>
            {isDeletionMode && <th>Deletion Action</th>}
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={isDeletionMode ? '5' : '4'} className="text-center">Loading...</td></tr>}
          {!loading && records.length === 0 && <tr><td colSpan={isDeletionMode ? '5' : '4'} className="text-center">No records found.</td></tr>}
          {!loading && records.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{config.name(item)}</td>
              <td>{item.isActive === false || item.status === 'inactive' ? 'Inactive' : 'Active'}</td>
              <td>{item.updatedAt || item.updated_at || '-'}</td>
              {isDeletionMode && (
                <td>
                  <button type="button" className="btn btn-outline-danger btn-sm action-btn" onClick={() => handleDelete(item)}>Deactivate</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default GenericMasterScreen
