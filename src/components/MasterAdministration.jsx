import React, { useEffect, useMemo, useState } from 'react'
import adminAPI from '../services/apiService'

const emptyOption = { value: '', label: 'Select' }

const asArray = (value, key) => {
  if (Array.isArray(value)) return value
  if (value?.[key] && Array.isArray(value[key])) return value[key]
  return []
}

const today = () => new Date().toISOString().slice(0, 10)

const MasterAdministration = () => {
  const [activeKey, setActiveKey] = useState('doctors')
  const [records, setRecords] = useState({})
  const [support, setSupport] = useState({
    doctors: [],
    chemists: [],
    patches: [],
    headquarters: [],
    users: [],
    inputs: [],
    products: [],
    samples: []
  })
  const [form, setForm] = useState({})
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectOptions = useMemo(() => ({
    doctors: [emptyOption, ...support.doctors.map((item) => ({ value: item.id, label: `${item.firstName || ''} ${item.lastName || ''}`.trim() || `Doctor ${item.id}` }))],
    patches: [emptyOption, ...support.patches.map((item) => ({ value: item.id, label: item.patch_name || `Patch ${item.id}` }))],
    headquarters: [emptyOption, ...support.headquarters.map((item) => ({ value: item.id, label: item.name || item.hq_name || `HQ ${item.id}` }))],
    users: [emptyOption, ...support.users.map((item) => ({ value: item.id, label: item.fullName || `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.email || `User ${item.id}` }))],
    inputs: [emptyOption, ...support.inputs.map((item) => ({ value: item.id, label: item.input_name || item.name || `Input ${item.id}` }))],
    products: [emptyOption, ...support.products.map((item) => ({ value: item.id, label: item.name || `Product ${item.id}` }))],
    samples: [emptyOption, ...support.samples.map((item) => ({ value: item.id, label: item.sample_name || `Sample ${item.id}` }))]
  }), [support])

  const configs = useMemo(() => ({
    doctors: {
      title: 'Doctor Master',
      group: 'Customer Masters',
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
        ['hq_id', 'HQ', 'select', true, selectOptions.headquarters],
        ['state', 'State', 'text', true],
        ['patch_id', 'Patch', 'select', true, selectOptions.patches],
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
      group: 'Customer Masters',
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
        ['hq_id', 'HQ', 'select', true, selectOptions.headquarters],
        ['patch_id', 'Patch', 'select', true, selectOptions.patches],
        ['location', 'Location', 'text', true],
        ['visit_time', 'Visit Time', 'text', true],
        ['address', 'Address', 'textarea']
      ]
    },
    patches: {
      title: 'Patch Master',
      group: 'Territory Masters',
      load: () => adminAPI.getPatches(),
      create: (data) => adminAPI.createPatch(data),
      update: (id, data) => adminAPI.updatePatch(id, data),
      remove: (id) => adminAPI.deletePatch(id),
      name: (item) => item.patch_name,
      fields: [
        ['patch_name', 'Patch Name', 'text', true],
        ['state', 'State', 'text', true],
        ['hq_id', 'Primary HQ', 'select', false, selectOptions.headquarters],
        ['pincode', 'Pincode']
      ]
    },
    headquarters: {
      title: 'HQ Master',
      group: 'Territory Masters',
      load: () => adminAPI.getHeadquarters(),
      listKey: 'headquarters',
      create: (data) => adminAPI.createHeadquarter(data),
      update: (id, data) => adminAPI.updateHeadquarter(id, data),
      remove: (id) => adminAPI.deleteHeadquarter(id),
      name: (item) => item.name,
      defaults: { type: 'Branch Office', stateType: 'State', zone: 'North', region: 'General' },
      fields: [
        ['name', 'HQ Name', 'text', true],
        ['code', 'HQ Code', 'text', true],
        ['state', 'State', 'text', true],
        ['zone', 'Zone', 'text', true],
        ['region', 'Region', 'text', true],
        ['address', 'Address', 'textarea'],
        ['pincode', 'Pincode']
      ]
    },
    svl: {
      title: 'Standard Visiting List',
      group: 'Territory Masters',
      load: () => adminAPI.getSVL(),
      create: (data) => adminAPI.createSVL(data),
      remove: (id) => adminAPI.deleteSVL(id),
      name: (item) => item.doctor ? `${item.doctor.firstName || ''} ${item.doctor.lastName || ''}`.trim() : `SVL ${item.id}`,
      defaults: { visit_frequency: 'Weekly', priority: 1, year: new Date().getFullYear() },
      fields: [
        ['doctor_id', 'Doctor', 'select', true, selectOptions.doctors],
        ['hq_id', 'HQ', 'select', true, selectOptions.headquarters],
        ['visit_frequency', 'Visit Frequency'],
        ['priority', 'Priority', 'number'],
        ['year', 'Revision Year', 'number']
      ]
    },
    stockists: {
      title: 'Stockist Master',
      group: 'Customer Masters',
      load: () => adminAPI.getStockists(),
      create: (data) => adminAPI.createStockist(data),
      update: (id, data) => adminAPI.updateStockist(id, data),
      remove: (id) => adminAPI.deleteStockist(id),
      name: (item) => item.stockist_name,
      fields: [
        ['stockist_name', 'Stockist Name', 'text', true],
        ['mobile', 'Mobile', 'tel'],
        ['contact_person', 'Contact Person'],
        ['hq_id', 'HQ', 'select', false, selectOptions.headquarters],
        ['state', 'State'],
        ['patch_id', 'Patch', 'select', false, selectOptions.patches],
        ['address', 'Address', 'textarea']
      ]
    },
    hospitals: {
      title: 'Hospital Master',
      group: 'Customer Masters',
      load: () => adminAPI.getHospitals(),
      create: (data) => adminAPI.createHospital(data),
      update: (id, data) => adminAPI.updateHospital(id, data),
      remove: (id) => adminAPI.deleteHospital(id),
      name: (item) => item.hospital_name,
      fields: [
        ['hospital_name', 'Hospital Name', 'text', true],
        ['mobile', 'Mobile', 'tel'],
        ['contact_person', 'Contact Person'],
        ['hq_id', 'HQ', 'select', false, selectOptions.headquarters],
        ['state', 'State'],
        ['patch_id', 'Patch', 'select', false, selectOptions.patches],
        ['address', 'Address', 'textarea']
      ]
    },
    inputAllocations: {
      title: 'Input Allocation',
      group: 'Product & Input',
      load: () => adminAPI.getInputAllocations(),
      create: (data) => adminAPI.createInputAllocation(data),
      update: (id, data) => adminAPI.updateInputAllocation(id, data),
      remove: (id) => adminAPI.deleteInputAllocation(id),
      name: (item) => item.product_input || item.input?.input_name || `Allocation ${item.id}`,
      defaults: { allocation_type: 'monthly', start_date: today(), end_date: today() },
      fields: [
        ['user_id', 'User', 'select', true, selectOptions.users],
        ['input_id', 'Input', 'select', true, selectOptions.inputs],
        ['product_input', 'Product Input'],
        ['qty', 'Qty', 'number', true],
        ['start_date', 'Start Date', 'date', true],
        ['end_date', 'End Date', 'date', true],
        ['allocation_type', 'Allocation Type', 'select', false, [{ value: 'monthly', label: 'Monthly' }, { value: 'quarterly', label: 'Quarterly' }]]
      ]
    },
    notices: {
      title: 'Notice Upload',
      group: 'Policy & Control',
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
      group: 'Policy & Control',
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
      group: 'Product & Input',
      load: () => adminAPI.getRateFixations(),
      create: (data) => adminAPI.createRateFixation(data),
      update: (id, data) => adminAPI.updateRateFixation(id, data),
      remove: (id) => adminAPI.deleteRateFixation(id),
      name: (item) => `${item.state} - ${item.product?.name || item.product_id}`,
      defaults: { effective_from: today() },
      fields: [
        ['state', 'State', 'text', true],
        ['product_id', 'Product', 'select', true, selectOptions.products],
        ['sample_id', 'Sample', 'select', false, selectOptions.samples],
        ['input_id', 'Input', 'select', false, selectOptions.inputs],
        ['pts', 'PTS', 'number'],
        ['ptr', 'PTR', 'number'],
        ['mrp', 'MRP', 'number'],
        ['nrv', 'NRV', 'number'],
        ['effective_from', 'Start Date', 'date', true],
        ['effective_to', 'End Date', 'date']
      ]
    },
    auditLogs: {
      title: 'Audit Trail',
      group: 'Policy & Control',
      load: () => adminAPI.getAuditLogs({ limit: 100 }),
      readonly: true,
      name: (item) => `${item.table_name} #${item.record_id}`
    }
  }), [selectOptions])

  const activeConfig = configs[activeKey]

  useEffect(() => {
    loadSupport()
  }, [])

  useEffect(() => {
    loadActive()
  }, [activeKey])

  const loadSupport = async () => {
    try {
      const [doctorRes, chemistRes, patchRes, hqRes, userRes, inputRes, productRes, sampleRes] = await Promise.all([
        adminAPI.getDoctors(),
        adminAPI.getChemists(),
        adminAPI.getPatches().catch(() => []),
        adminAPI.getHeadquarters(),
        adminAPI.getUsers(),
        adminAPI.getInputs().catch(() => []),
        adminAPI.getProducts().catch(() => []),
        adminAPI.getSamples().catch(() => [])
      ])
      setSupport({
        doctors: asArray(doctorRes, 'doctors'),
        chemists: asArray(chemistRes, 'chemists'),
        patches: asArray(patchRes, 'patches'),
        headquarters: asArray(hqRes, 'headquarters'),
        users: asArray(userRes, 'users'),
        inputs: asArray(inputRes, 'inputs'),
        products: asArray(productRes, 'products'),
        samples: asArray(sampleRes, 'samples')
      })
    } catch (err) {
      console.error('Supporting data load failed', err)
    }
  }

  const loadActive = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await activeConfig.load()
      setRecords((prev) => ({ ...prev, [activeKey]: asArray(response, activeConfig.listKey) }))
      setForm(activeConfig.defaults || {})
      setEditing(null)
    } catch (err) {
      setError(err.message || 'Failed to load master data')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    setEditing(item)
    setForm({ ...(activeConfig.defaults || {}), ...item })
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Inactivate ${activeConfig.name(item) || activeConfig.title}?`)) return
    await activeConfig.remove(item.id)
    await loadActive()
    await loadSupport()
  }

  const sanitize = (data) => {
    const clean = {}
    Object.entries(data).forEach(([key, value]) => {
      clean[key] = value === '' ? null : value
    })
    return clean
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payload = sanitize(form)
    if (editing && activeConfig.update) {
      await activeConfig.update(editing.id, payload)
    } else {
      await activeConfig.create(payload)
    }
    await loadActive()
    await loadSupport()
  }

  const renderField = ([key, label, type = 'text', required = false, options = []]) => {
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
            {options.map((option) => <option key={`${key}-${option.value}`} value={option.value}>{option.label}</option>)}
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

  const groupedKeys = Object.keys(configs).reduce((acc, key) => {
    const group = configs[key].group || 'Master Administration'
    acc[group] = [...(acc[group] || []), key]
    return acc
  }, {})

  const rows = records[activeKey] || []

  return (
    <div className="section-content">
      <section className="content-header">
        <h1>Master Administration</h1>
      </section>

      <section className="content">
        <div className="master-admin-layout">
          <aside className="master-admin-nav">
            {Object.entries(groupedKeys).map(([group, keys]) => (
              <div key={group} className="master-admin-group">
                <h4>{group}</h4>
                {keys.map((key) => (
                  <button key={key} className={activeKey === key ? 'active' : ''} type="button" onClick={() => setActiveKey(key)}>
                    {configs[key].title}
                  </button>
                ))}
              </div>
            ))}
          </aside>

          <div className="master-admin-main">
            <div className="box">
              <div className="box-header with-border">
                <h3 className="box-title">{activeConfig.title}</h3>
                <button type="button" className="btn btn-default btn-sm" onClick={loadActive}>Refresh</button>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              {!activeConfig.readonly && (
                <form className="master-admin-form" onSubmit={handleSubmit}>
                  {activeConfig.fields.map(renderField)}
                  <div className="master-admin-actions">
                    <button type="submit" className="btn btn-primary">{editing ? 'Save Changes' : `Add ${activeConfig.title}`}</button>
                    {editing && <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setForm(activeConfig.defaults || {}) }}>Cancel</button>}
                  </div>
                </form>
              )}

              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Updated</th>
                      {!activeConfig.readonly && <th>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {loading && <tr><td colSpan="5">Loading...</td></tr>}
                    {!loading && rows.length === 0 && <tr><td colSpan="5">No records found</td></tr>}
                    {!loading && rows.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{activeConfig.name(item)}</td>
                        <td>{item.isActive === false || item.status === 'inactive' ? 'Inactive' : item.action || item.status || 'Active'}</td>
                        <td>{item.updatedAt || item.updated_at || item.change_date || '-'}</td>
                        {!activeConfig.readonly && (
                          <td>
                            {activeConfig.update && <button type="button" className="btn btn-sm btn-info" onClick={() => handleEdit(item)}>Edit</button>}{' '}
                            <button type="button" className="btn btn-sm btn-warning" onClick={() => handleDelete(item)}>Inactivate</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default MasterAdministration
