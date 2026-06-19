import React, { useEffect, useMemo, useState } from 'react'
import adminAPI from '../services/apiService'

const today = () => new Date().toISOString().slice(0, 10)
const nextQuarter = () => {
  const date = new Date()
  date.setDate(date.getDate() + 90)
  return date.toISOString().slice(0, 10)
}

const empty = { value: '', label: 'Select' }
const asArray = (value) => Array.isArray(value) ? value : []
const asNumber = (value) => Number(value || 0)
const fmtMoney = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`
const fmtPercent = (value) => `${(Number(value || 0) * 100).toFixed(1)}%`
const roles = [empty, 'ZBM', 'RBM', 'ABM', 'TBM'].map((role) => typeof role === 'string' ? { value: role, label: role } : role)

const defaultCampaign = {
  campaign_code: '',
  campaign_name: '',
  start_date: today(),
  end_date: nextQuarter(),
  campaign_for: 'doctor',
  brand_name: '',
  objective: '',
  target_count: 0,
  input_name: '',
  qty_per_visit: 1,
  distribution_type: 'once',
  recurrence_frequency: 'quarterly',
  recurrence_count: 1,
  input_unit_value: 0,
  expected_roi: 0,
  prescription_per_month: 0,
  strip_sale_per_rx: 0,
  new_prescribers_added: 0,
  sales_growth: 0,
  hq_below_90: 0,
  hq_below_70: 0,
  hq_at_100: 0,
  status: 'draft'
}

const defaultStrategy = {
  financial_year: '2026-2027',
  brand_name: '',
  activity_name: '',
  start_date: today(),
  end_date: nextQuarter(),
  objective_in_strips: 0,
  doctors_targeted: 0,
  visits: [
    { visit: 1, input: '' },
    { visit: 2, input: '' },
    { visit: 3, input: '' }
  ],
  status: 'draft'
}

const defaultRcpa = {
  rcpa_code: '',
  rcpa_name: '',
  rcpa_type: 'doctor_wise',
  allocation_scope: 'specific',
  allocated_role: 'TBM',
  status: 'draft'
}

const defaultEntry = {
  doctor_name: '',
  doctor_address: '',
  speciality: '',
  chemist_name: '',
  chemist_address: '',
  contact_number: '',
  brand_name: '',
  own_rx_per_week: 0,
  competitors: [
    { brand: 'Competitor B1', rx_per_week: 0 },
    { brand: 'Competitor B2', rx_per_week: 0 },
    { brand: 'Competitor B3', rx_per_week: 0 },
    { brand: 'Competitor B4', rx_per_week: 0 },
    { brand: 'Competitor B5', rx_per_week: 0 }
  ]
}

const cloneDefaultStrategy = () => ({ ...defaultStrategy, visits: defaultStrategy.visits.map((visit) => ({ ...visit })) })
const cloneDefaultEntry = () => ({ ...defaultEntry, competitors: defaultEntry.competitors.map((item) => ({ ...item })) })

const viewMeta = {
  campaigns: {
    title: 'Create Campaign',
    subtitle: 'Campaign setup for doctor, chemist, stockist, patient, hospital staff, and clinic activities from the workbook.'
  },
  strategy: {
    title: 'Brand Wise Strategy Creation',
    subtitle: 'Financial year, brand activity, division, strip objective, doctor target, and visit-wise input planning.'
  },
  report: {
    title: 'Report Dashboard',
    subtitle: 'Workbook dashboard metrics: campaign count, status split, investment, ROI, prescriber addition, sales growth, and HQ achievement.'
  },
  'campaign-view': {
    title: 'Campaign View Panel',
    subtitle: 'Campaign execution and analytics view with brand, investment, ROI, growth, and HQ status.'
  },
  'allocation-roi': {
    title: 'Input Allocation & ROI Forecasting',
    subtitle: 'Input quantity, recurrence, investment, prescription, strip sale, total sale, and forecasted ROI.'
  },
  'rcpa-admin': {
    title: 'RCPA Creation Admin',
    subtitle: 'Admin-level RCPA creation, speciality/product selection, and allocation to division, role, or user.'
  },
  'rcpa-executive': {
    title: 'RCPA Executive Entry',
    subtitle: 'Doctor-wise RCPA entry with chemist details, own brand RX/week, competitor RX/week, and total business.'
  }
}

const MarketingModule = ({ view = 'report' }) => {
  const [dashboard, setDashboard] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [strategies, setStrategies] = useState([])
  const [rcpas, setRcpas] = useState([])
  const [entries, setEntries] = useState([])
  const [selectedRcpaId, setSelectedRcpaId] = useState('')
  const [support, setSupport] = useState({ products: [], inputs: [], users: [], divisions: [], specialties: [], doctors: [], chemists: [] })
  const [campaignForm, setCampaignForm] = useState(defaultCampaign)
  const [strategyForm, setStrategyForm] = useState(cloneDefaultStrategy())
  const [rcpaForm, setRcpaForm] = useState(defaultRcpa)
  const [entryForm, setEntryForm] = useState(cloneDefaultEntry())
  const [editingCampaignId, setEditingCampaignId] = useState(null)
  const [editingStrategyId, setEditingStrategyId] = useState(null)
  const [editingRcpaId, setEditingRcpaId] = useState(null)
  const [editingEntryId, setEditingEntryId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const options = useMemo(() => ({
    products: [empty, ...support.products.map((item) => ({ value: item.id, label: item.name || `Product ${item.id}` }))],
    inputs: [empty, ...support.inputs.map((item) => ({ value: item.id, label: item.input_name || `Input ${item.id}` }))],
    users: [empty, ...support.users.map((item) => ({ value: item.id, label: item.fullName || `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.email || `User ${item.id}` }))],
    divisions: [empty, ...support.divisions.map((item) => ({ value: item.id, label: item.division_name || item.short_name || `Division ${item.id}` }))],
    specialties: [empty, ...support.specialties.map((item) => ({ value: item.id, label: item.specialty_name || `Specialty ${item.id}` }))],
    doctors: [empty, ...support.doctors.map((item) => ({ value: item.id, label: item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || `Doctor ${item.id}` }))],
    chemists: [empty, ...support.chemists.map((item) => ({ value: item.id, label: item.name || `Chemist ${item.id}` }))]
  }), [support])

  const selectedRcpa = rcpas.find((item) => String(item.id) === String(selectedRcpaId))
  const entryTotal = asNumber(entryForm.own_rx_per_week) + entryForm.competitors.reduce((sum, item) => sum + asNumber(item.rx_per_week), 0)

  useEffect(() => {
    loadAll()
  }, [])

  useEffect(() => {
    if (!selectedRcpaId && rcpas.length) setSelectedRcpaId(String(rcpas[0].id))
  }, [rcpas, selectedRcpaId])

  useEffect(() => {
    if (selectedRcpaId) loadRcpaEntries(selectedRcpaId)
  }, [selectedRcpaId])

  const loadAll = async () => {
    try {
      setLoading(true)
      setError('')
      const [dash, campaignData, strategyData, rcpaData, products, inputs, users, divisions, specialties, doctors, chemists] = await Promise.all([
        adminAPI.getMarketingDashboard(),
        adminAPI.getMarketingCampaigns(),
        adminAPI.getMarketingStrategies(),
        adminAPI.getMarketingRCPAs(),
        adminAPI.getProducts().catch(() => []),
        adminAPI.getInputs().catch(() => []),
        adminAPI.getUsers().catch(() => []),
        adminAPI.getDivisions().catch(() => []),
        adminAPI.getDoctorSpecialties().catch(() => []),
        adminAPI.getDoctors().catch(() => []),
        adminAPI.getChemists().catch(() => [])
      ])
      setDashboard(dash)
      setCampaigns(asArray(campaignData))
      setStrategies(asArray(strategyData))
      setRcpas(asArray(rcpaData))
      setSupport({
        products: asArray(products.products || products),
        inputs: asArray(inputs),
        users: asArray(users.users || users),
        divisions: asArray(divisions),
        specialties: asArray(specialties),
        doctors: asArray(doctors.doctors || doctors),
        chemists: asArray(chemists.chemists || chemists)
      })
    } catch (err) {
      setError(err.message || 'Failed to load marketing module')
    } finally {
      setLoading(false)
    }
  }

  const loadRcpaEntries = async (id) => {
    try {
      const data = await adminAPI.getMarketingRCPAEntries(id)
      setEntries(asArray(data))
    } catch (err) {
      setEntries([])
      setError(err.message || 'Failed to load RCPA entries')
    }
  }

  const sanitize = (data) => Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value === '' ? null : value]))
  const handleCampaignChange = (key, value) => setCampaignForm((prev) => ({ ...prev, [key]: value }))
  const handleCampaignForChange = (value) => {
    setCampaignForm((prev) => ({
      ...prev,
      campaign_for: value,
      speciality_id: value === 'doctor' ? prev.speciality_id : '',
      product_id: value === 'doctor' ? prev.product_id : ''
    }))
  }
  const handleStrategyChange = (key, value) => setStrategyForm((prev) => ({ ...prev, [key]: value }))
  const handleRcpaChange = (key, value) => setRcpaForm((prev) => ({ ...prev, [key]: value }))
  const handleEntryChange = (key, value) => setEntryForm((prev) => ({ ...prev, [key]: value }))

  const submitCampaign = async (event) => {
    event.preventDefault()
    if (editingCampaignId) await adminAPI.updateMarketingCampaign(editingCampaignId, sanitize(campaignForm))
    else await adminAPI.createMarketingCampaign(sanitize(campaignForm))
    setEditingCampaignId(null)
    setCampaignForm(defaultCampaign)
    await loadAll()
  }

  const submitStrategy = async (event) => {
    event.preventDefault()
    if (editingStrategyId) await adminAPI.updateMarketingStrategy(editingStrategyId, sanitize(strategyForm))
    else await adminAPI.createMarketingStrategy(sanitize(strategyForm))
    setEditingStrategyId(null)
    setStrategyForm(cloneDefaultStrategy())
    await loadAll()
  }

  const submitRcpa = async (event) => {
    event.preventDefault()
    if (editingRcpaId) await adminAPI.updateMarketingRCPA(editingRcpaId, sanitize(rcpaForm))
    else await adminAPI.createMarketingRCPA(sanitize(rcpaForm))
    setEditingRcpaId(null)
    setRcpaForm(defaultRcpa)
    await loadAll()
  }

  const submitEntry = async (event) => {
    event.preventDefault()
    if (!selectedRcpaId) return setError('Select an RCPA before submitting an executive entry.')
    const payload = { ...entryForm, total_business_strips: entryTotal }
    if (editingEntryId) await adminAPI.updateMarketingRCPAEntry(selectedRcpaId, editingEntryId, sanitize(payload))
    else await adminAPI.createMarketingRCPAEntry(selectedRcpaId, sanitize(payload))
    setEditingEntryId(null)
    setEntryForm(cloneDefaultEntry())
    await loadRcpaEntries(selectedRcpaId)
  }

  const editCampaign = (item) => {
    setEditingCampaignId(item.id)
    setCampaignForm({
      ...defaultCampaign,
      ...item,
      start_date: String(item.start_date || today()).slice(0, 10),
      end_date: String(item.end_date || nextQuarter()).slice(0, 10)
    })
  }

  const editStrategy = (item) => {
    setEditingStrategyId(item.id)
    setStrategyForm({
      ...cloneDefaultStrategy(),
      ...item,
      visits: Array.isArray(item.visits) && item.visits.length ? item.visits : cloneDefaultStrategy().visits,
      start_date: item.start_date ? String(item.start_date).slice(0, 10) : '',
      end_date: item.end_date ? String(item.end_date).slice(0, 10) : ''
    })
  }

  const editRcpa = (item) => {
    setEditingRcpaId(item.id)
    setRcpaForm({ ...defaultRcpa, ...item })
  }

  const editEntry = (item) => {
    setEditingEntryId(item.id)
    setEntryForm({
      ...cloneDefaultEntry(),
      ...item,
      competitors: Array.isArray(item.competitors) && item.competitors.length ? item.competitors : cloneDefaultEntry().competitors
    })
  }

  const deleteCampaign = async (item) => {
    if (!window.confirm(`Cancel campaign "${item.campaign_name}"?`)) return
    await adminAPI.cancelMarketingCampaign(item.id)
    await loadAll()
  }

  const deleteStrategy = async (item) => {
    if (!window.confirm(`Inactivate strategy "${item.brand_name}"?`)) return
    await adminAPI.deleteMarketingStrategy(item.id)
    await loadAll()
  }

  const deleteRcpa = async (item) => {
    if (!window.confirm(`Close RCPA "${item.rcpa_name}"?`)) return
    await adminAPI.deleteMarketingRCPA(item.id)
    await loadAll()
  }

  const deleteEntry = async (item) => {
    if (!window.confirm(`Delete RCPA entry for "${item.doctor_name}"?`)) return
    await adminAPI.deleteMarketingRCPAEntry(selectedRcpaId, item.id)
    await loadRcpaEntries(selectedRcpaId)
  }

  const addVisit = () => setStrategyForm((prev) => ({ ...prev, visits: [...prev.visits, { visit: prev.visits.length + 1, input: '' }] }))
  const updateVisit = (index, value) => setStrategyForm((prev) => ({ ...prev, visits: prev.visits.map((item, i) => i === index ? { ...item, input: value } : item) }))
  const updateCompetitor = (index, key, value) => setEntryForm((prev) => ({
    ...prev,
    competitors: prev.competitors.map((item, i) => i === index ? { ...item, [key]: value } : item)
  }))

  const renderSelect = (value, onChange, items) => (
    <select value={value || ''} onChange={(event) => onChange(event.target.value)}>
      {items.map((item) => <option key={`${item.label}-${item.value}`} value={item.value}>{item.label}</option>)}
    </select>
  )

  const meta = viewMeta[view] || viewMeta.report

  return (
    <div className="section-content marketing-module">
      <div className="page-header marketing-header">
        <div>
          <h2>{meta.title}</h2>
          <p>{meta.subtitle}</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={loadAll}>Refresh</button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div className="alert alert-info">Loading marketing data...</div>}

      {view === 'report' && renderReport(dashboard)}
      {view === 'campaign-view' && renderCampaignView(campaigns)}
      {view === 'allocation-roi' && renderAllocationRoi(campaigns)}
      {view === 'campaigns' && (
        <div className="marketing-grid">
          {renderCampaignForm()}
          <RecordList title="Campaigns" items={campaigns} columns={[
            ['Campaign', (item) => item.campaign_name],
            ['For', (item) => labelize(item.campaign_for)],
            ['Brand', (item) => item.brand_name || item.product?.name || '-'],
            ['Status', (item) => item.status]
          ]} onEdit={editCampaign} onDelete={deleteCampaign} deleteLabel="Cancel" />
        </div>
      )}
      {view === 'strategy' && (
        <div className="marketing-grid">
          {renderStrategyForm()}
          <RecordList title="Brand Strategies" items={strategies} columns={[
            ['Financial Year', (item) => item.financial_year],
            ['Brand', (item) => item.brand_name],
            ['Activity', (item) => item.activity_name],
            ['Status', (item) => item.status]
          ]} onEdit={editStrategy} onDelete={deleteStrategy} deleteLabel="Inactivate" />
        </div>
      )}
      {view === 'rcpa-admin' && (
        <div className="marketing-grid">
          {renderRcpaForm()}
          <RecordList title="RCPA View" items={rcpas} columns={[
            ['RCPA', (item) => item.rcpa_name],
            ['Type', (item) => labelize(item.rcpa_type)],
            ['Product', (item) => item.product?.name || '-'],
            ['Status', (item) => item.status]
          ]} onEdit={editRcpa} onDelete={deleteRcpa} deleteLabel="Close" />
        </div>
      )}
      {view === 'rcpa-executive' && renderRcpaExecutive()}
    </div>
  )

  function renderCampaignForm() {
    const isDoctorCampaign = campaignForm.campaign_for === 'doctor'
    const isChemistCampaign = campaignForm.campaign_for === 'chemist'
    const isStockistCampaign = campaignForm.campaign_for === 'stockist'
    const isPatientCampaign = campaignForm.campaign_for === 'patient'
    const isHospitalCampaign = ['hospital_staff', 'clinic'].includes(campaignForm.campaign_for)
    const targetLabel = isDoctorCampaign
      ? 'Number of Doctor'
      : isChemistCampaign
        ? 'Number of Chemist / HQ'
        : isPatientCampaign
          ? 'Number of Patient'
          : isHospitalCampaign
            ? 'Number of Hospital / HQ'
            : 'Number of Targets'
    const quantityLabel = isDoctorCampaign
      ? 'Qty in a Visit'
      : isChemistCampaign
        ? 'Number of Input / Chemist'
        : isStockistCampaign
          ? 'Number of Input / Stockist'
          : isPatientCampaign
            ? 'Number of Input / Patient'
            : isHospitalCampaign
              ? 'Number of Input / Hospital'
              : 'Number of Input'
    const roiLabel = isDoctorCampaign
      ? 'Expected ROI'
      : isChemistCampaign
        ? 'ROI in Terms of POB'
        : isStockistCampaign
          ? 'ROI in Terms of Order'
          : 'ROI in Terms of Sale'

    return (
      <form className="marketing-form" onSubmit={submitCampaign}>
        <h3>{editingCampaignId ? 'Edit Campaign' : 'Create Campaign'}</h3>
        <Field label="Campaign Code" required value={campaignForm.campaign_code} onChange={(v) => handleCampaignChange('campaign_code', v)} />
        <Field label="Campaign Name" required value={campaignForm.campaign_name} onChange={(v) => handleCampaignChange('campaign_name', v)} />
        <Field label="Start Date" type="date" required value={campaignForm.start_date} onChange={(v) => handleCampaignChange('start_date', v)} />
        <Field label="End Date" type="date" required value={campaignForm.end_date} onChange={(v) => handleCampaignChange('end_date', v)} />
        <label><span>Campaign For</span>{renderSelect(campaignForm.campaign_for, handleCampaignForChange, [
          { value: 'doctor', label: 'Doctor' },
          { value: 'chemist', label: 'Chemist' },
          { value: 'stockist', label: 'Stockist' },
          { value: 'patient', label: 'Patient' },
          { value: 'hospital_staff', label: 'Hospital Staff' },
          { value: 'clinic', label: 'Clinic' }
        ])}</label>

        {isDoctorCampaign && (
          <>
            <label><span>Speciality</span>{renderSelect(campaignForm.speciality_id, (v) => handleCampaignChange('speciality_id', v), options.specialties)}</label>
            <label><span>Product</span>{renderSelect(campaignForm.product_id, (v) => handleCampaignChange('product_id', v), options.products)}</label>
            <Field label="Objective" textarea value={campaignForm.objective} onChange={(v) => handleCampaignChange('objective', v)} />
          </>
        )}

        {(isChemistCampaign || isPatientCampaign || isHospitalCampaign) && (
          <>
            {(isPatientCampaign || isHospitalCampaign) && (
              <Field label="Activity Type" value={campaignForm.objective} onChange={(v) => handleCampaignChange('objective', v)} />
            )}
            <Field label="Brand" value={campaignForm.brand_name} onChange={(v) => handleCampaignChange('brand_name', v)} />
          </>
        )}

        {isStockistCampaign && (
          <Field label="Campaign Note" textarea value={campaignForm.objective} onChange={(v) => handleCampaignChange('objective', v)} />
        )}

        {isDoctorCampaign && <Field label="Brand Name" value={campaignForm.brand_name} onChange={(v) => handleCampaignChange('brand_name', v)} />}
        {!isStockistCampaign && <Field label={targetLabel} type="number" value={campaignForm.target_count} onChange={(v) => handleCampaignChange('target_count', v)} />}
        <label><span>Allotted Division</span>{renderSelect(campaignForm.allocated_division_id, (v) => handleCampaignChange('allocated_division_id', v), options.divisions)}</label>
        <label><span>Allotted Role</span>{renderSelect(campaignForm.allocated_role, (v) => handleCampaignChange('allocated_role', v), roles)}</label>
        <label><span>Allotted Name</span>{renderSelect(campaignForm.allocated_user_id, (v) => handleCampaignChange('allocated_user_id', v), options.users)}</label>
        <label><span>Input</span>{renderSelect(campaignForm.input_id, (v) => handleCampaignChange('input_id', v), options.inputs)}</label>
        <Field label="Input Name" value={campaignForm.input_name} onChange={(v) => handleCampaignChange('input_name', v)} />
        <Field label={quantityLabel} type="number" value={campaignForm.qty_per_visit} onChange={(v) => handleCampaignChange('qty_per_visit', v)} />
        <label><span>Distribution Type</span>{renderSelect(campaignForm.distribution_type, (v) => handleCampaignChange('distribution_type', v), [{ value: 'once', label: 'Once' }, { value: 'recurring', label: 'Recurring' }])}</label>
        <label><span>Period</span>{renderSelect(campaignForm.recurrence_frequency, (v) => handleCampaignChange('recurrence_frequency', v), [
          { value: 'monthly', label: 'Month' },
          { value: 'quarterly', label: 'QTR' },
          { value: 'yearly', label: 'Year' }
        ])}</label>
        <Field label="Times / Period" type="number" value={campaignForm.recurrence_count} onChange={(v) => handleCampaignChange('recurrence_count', v)} />
        <Field label="Input Value / Unit" type="number" value={campaignForm.input_unit_value} onChange={(v) => handleCampaignChange('input_unit_value', v)} />
        <Field label={roiLabel} type="number" value={campaignForm.expected_roi} onChange={(v) => handleCampaignChange('expected_roi', v)} />
        {isDoctorCampaign && (
          <>
            <Field label="Prescription / Month" type="number" value={campaignForm.prescription_per_month} onChange={(v) => handleCampaignChange('prescription_per_month', v)} />
            <Field label="Strip Sale / Rx" type="number" value={campaignForm.strip_sale_per_rx} onChange={(v) => handleCampaignChange('strip_sale_per_rx', v)} />
          </>
        )}
        <Field label="New Prescribers Added" type="number" value={campaignForm.new_prescribers_added} onChange={(v) => handleCampaignChange('new_prescribers_added', v)} />
        <Field label="Sales Growth" type="number" value={campaignForm.sales_growth} onChange={(v) => handleCampaignChange('sales_growth', v)} />
        <Field label="HQ Less Than 90%" type="number" value={campaignForm.hq_below_90} onChange={(v) => handleCampaignChange('hq_below_90', v)} />
        <Field label="HQ Less Than 70%" type="number" value={campaignForm.hq_below_70} onChange={(v) => handleCampaignChange('hq_below_70', v)} />
        <Field label="HQ At 100%" type="number" value={campaignForm.hq_at_100} onChange={(v) => handleCampaignChange('hq_at_100', v)} />
        <div className="marketing-form-actions">
          <button className="btn btn-primary" type="submit">{editingCampaignId ? 'Save Campaign' : 'Create Campaign'}</button>
          {editingCampaignId && <button className="btn btn-light" type="button" onClick={() => { setEditingCampaignId(null); setCampaignForm(defaultCampaign) }}>Cancel Edit</button>}
        </div>
      </form>
    )
  }

  function renderStrategyForm() {
    return (
      <form className="marketing-form" onSubmit={submitStrategy}>
        <h3>{editingStrategyId ? 'Edit Brand Strategy' : 'Brand Wise Strategy Creation'}</h3>
        <Field label="Financial Year" required value={strategyForm.financial_year} onChange={(v) => handleStrategyChange('financial_year', v)} />
        <Field label="Brand Name" required value={strategyForm.brand_name} onChange={(v) => handleStrategyChange('brand_name', v)} />
        <Field label="Activity Name" required value={strategyForm.activity_name} onChange={(v) => handleStrategyChange('activity_name', v)} />
        <label><span>Division</span>{renderSelect(strategyForm.division_id, (v) => handleStrategyChange('division_id', v), options.divisions)}</label>
        <Field label="Start Date" type="date" value={strategyForm.start_date} onChange={(v) => handleStrategyChange('start_date', v)} />
        <Field label="End Date" type="date" value={strategyForm.end_date} onChange={(v) => handleStrategyChange('end_date', v)} />
        <Field label="Objective in Strip" type="number" value={strategyForm.objective_in_strips} onChange={(v) => handleStrategyChange('objective_in_strips', v)} />
        <Field label="Doctors Targeted" type="number" value={strategyForm.doctors_targeted} onChange={(v) => handleStrategyChange('doctors_targeted', v)} />
        <div className="visit-box">
          {strategyForm.visits.map((visit, index) => (
            <Field key={`${visit.visit}-${index}`} label={`Visit ${visit.visit}`} value={visit.input} onChange={(v) => updateVisit(index, v)} />
          ))}
          <button type="button" className="btn btn-light" onClick={addVisit}>Add Visit</button>
        </div>
        <div className="marketing-form-actions">
          <button className="btn btn-primary" type="submit">{editingStrategyId ? 'Update Strategy' : 'Save Strategy'}</button>
          {editingStrategyId && <button className="btn btn-light" type="button" onClick={() => { setEditingStrategyId(null); setStrategyForm(cloneDefaultStrategy()) }}>Cancel Edit</button>}
        </div>
      </form>
    )
  }

  function renderRcpaForm() {
    return (
      <form className="marketing-form" onSubmit={submitRcpa}>
        <h3>{editingRcpaId ? 'Edit RCPA' : 'RCPA Creation'}</h3>
        <Field label="RCPA Code" required value={rcpaForm.rcpa_code} onChange={(v) => handleRcpaChange('rcpa_code', v)} />
        <Field label="RCPA Name" required value={rcpaForm.rcpa_name} onChange={(v) => handleRcpaChange('rcpa_name', v)} />
        <label><span>RCPA Type</span>{renderSelect(rcpaForm.rcpa_type, (v) => handleRcpaChange('rcpa_type', v), [
          { value: 'speciality_wise', label: 'Speciality Wise' },
          { value: 'product_wise', label: 'Product Wise' },
          { value: 'doctor_wise', label: 'Doctor Wise' }
        ])}</label>
        <label><span>Speciality</span>{renderSelect(rcpaForm.speciality_id, (v) => handleRcpaChange('speciality_id', v), options.specialties)}</label>
        <label><span>Product</span>{renderSelect(rcpaForm.product_id, (v) => handleRcpaChange('product_id', v), options.products)}</label>
        <label><span>Allocation Scope</span>{renderSelect(rcpaForm.allocation_scope, (v) => handleRcpaChange('allocation_scope', v), [
          { value: 'all', label: 'All' },
          { value: 'specific', label: 'Specific Allocation' }
        ])}</label>
        <label><span>Allocate Division</span>{renderSelect(rcpaForm.allocated_division_id, (v) => handleRcpaChange('allocated_division_id', v), options.divisions)}</label>
        <label><span>Allocate To Role</span>{renderSelect(rcpaForm.allocated_role, (v) => handleRcpaChange('allocated_role', v), roles)}</label>
        <label><span>Allocate To Name</span>{renderSelect(rcpaForm.allocated_user_id, (v) => handleRcpaChange('allocated_user_id', v), options.users)}</label>
        <div className="marketing-form-actions">
          <button className="btn btn-primary" type="submit">{editingRcpaId ? 'Update RCPA' : 'Create RCPA'}</button>
          {editingRcpaId && <button className="btn btn-light" type="button" onClick={() => { setEditingRcpaId(null); setRcpaForm(defaultRcpa) }}>Cancel Edit</button>}
        </div>
      </form>
    )
  }

  function renderRcpaExecutive() {
    return (
      <div className="marketing-grid">
        <form className="marketing-form" onSubmit={submitEntry}>
          <h3>{editingEntryId ? 'Edit Doctor Wise RCPA' : 'Doctor Wise RCPA'}</h3>
          <label><span>RCPA</span>{renderSelect(selectedRcpaId, setSelectedRcpaId, [empty, ...rcpas.map((item) => ({ value: item.id, label: item.rcpa_name }))])}</label>
          <label><span>Doctor</span>{renderSelect(entryForm.doctor_id, (v) => handleEntryChange('doctor_id', v), options.doctors)}</label>
          <Field label="Doctor Name" required value={entryForm.doctor_name} onChange={(v) => handleEntryChange('doctor_name', v)} />
          <Field label="Doctor Address" value={entryForm.doctor_address} onChange={(v) => handleEntryChange('doctor_address', v)} />
          <Field label="Speciality" value={entryForm.speciality} onChange={(v) => handleEntryChange('speciality', v)} />
          <label><span>Chemist</span>{renderSelect(entryForm.chemist_id, (v) => handleEntryChange('chemist_id', v), options.chemists)}</label>
          <Field label="Chemist Name" value={entryForm.chemist_name} onChange={(v) => handleEntryChange('chemist_name', v)} />
          <Field label="Chemist Address" value={entryForm.chemist_address} onChange={(v) => handleEntryChange('chemist_address', v)} />
          <Field label="Contact Number" value={entryForm.contact_number} onChange={(v) => handleEntryChange('contact_number', v)} />
          <Field label="Brand Name" required value={entryForm.brand_name} onChange={(v) => handleEntryChange('brand_name', v)} />
          <Field label="Own RX / Week" type="number" value={entryForm.own_rx_per_week} onChange={(v) => handleEntryChange('own_rx_per_week', v)} />
          <div className="visit-box">
            {entryForm.competitors.map((item, index) => (
              <React.Fragment key={index}>
                <Field label={`Competitor B${index + 1}`} value={item.brand} onChange={(v) => updateCompetitor(index, 'brand', v)} />
                <Field label={`Competitor B${index + 1} RX / Week`} type="number" value={item.rx_per_week} onChange={(v) => updateCompetitor(index, 'rx_per_week', v)} />
              </React.Fragment>
            ))}
          </div>
          <Kpi label="Total Business in Strip" value={entryTotal} />
          <div className="marketing-form-actions">
            <button className="btn btn-primary" type="submit">{editingEntryId ? 'Update Entry' : 'Submit Entry'}</button>
            {editingEntryId && <button className="btn btn-light" type="button" onClick={() => { setEditingEntryId(null); setEntryForm(cloneDefaultEntry()) }}>Cancel Edit</button>}
          </div>
        </form>
        <RecordList title={selectedRcpa ? `${selectedRcpa.rcpa_name} Entries` : 'RCPA Entries'} items={entries} columns={[
          ['Doctor', (item) => item.doctor_name],
          ['Chemist', (item) => item.chemist_name || '-'],
          ['Brand', (item) => item.brand_name],
          ['Own RX/Week', (item) => item.own_rx_per_week || 0],
          ['Total Business', (item) => item.total_business_strips || 0]
        ]} onEdit={editEntry} onDelete={deleteEntry} />
      </div>
    )
  }
}

const renderReport = (dashboard) => (
  <div className="marketing-kpis">
    <Kpi label="Total Campaigns" value={dashboard?.totalCampaigns || 0} />
    <Kpi label="Closed" value={dashboard?.closed || 0} />
    <Kpi label="Running" value={dashboard?.running || 0} />
    <Kpi label="Investment" value={fmtMoney(dashboard?.totalInvestment)} />
    <Kpi label="ROI" value={fmtMoney(dashboard?.roi)} />
    <Kpi label="New Prescribers" value={dashboard?.newPrescribersAdded || 0} />
    <Kpi label="Sales Growth" value={fmtPercent(dashboard?.salesGrowth)} />
    <Kpi label="HQ Less Than 90%" value={dashboard?.hqBelow90 || 0} />
    <Kpi label="HQ Less Than 70%" value={dashboard?.hqBelow70 || 0} />
    <Kpi label="HQ At 100%" value={dashboard?.hqAt100 || 0} />
  </div>
)

const renderCampaignView = (campaigns) => (
  <RecordList title="Campaign Execution & Analytics" items={campaigns} columns={[
    ['Campaign Name', (item) => item.campaign_name],
    ['Start Date', (item) => String(item.start_date || '').slice(0, 10) || '-'],
    ['End Date', (item) => String(item.end_date || '').slice(0, 10) || '-'],
    ['Status', (item) => item.status],
    ['Brand', (item) => item.brand_name || item.product?.name || '-'],
    ['Investment', (item) => fmtMoney(item.total_investment)],
    ['ROI', (item) => fmtMoney(item.expected_roi)],
    ['New Prescribers', (item) => item.new_prescribers_added || 0],
    ['Sales Growth', (item) => fmtPercent(item.sales_growth)]
  ]} />
)

const renderAllocationRoi = (campaigns) => (
  <RecordList title="Input Allocation & ROI Forecasting" items={campaigns} columns={[
    ['Campaign', (item) => item.campaign_name],
    ['Input', (item) => item.input?.input_name || item.input_name || '-'],
    ['Qty / Visit', (item) => item.qty_per_visit || 0],
    ['Distribution', (item) => labelize(item.distribution_type)],
    ['Times', (item) => `${item.recurrence_count || 1} / ${labelize(item.recurrence_frequency || 'period')}`],
    ['Input Value / Unit', (item) => fmtMoney(item.input_unit_value)],
    ['Total Investment', (item) => fmtMoney(item.total_investment)],
    ['Rx / Month', (item) => item.prescription_per_month || 0],
    ['Strip / Rx', (item) => item.strip_sale_per_rx || 0],
    ['Total Sale / Month', (item) => item.total_sale_per_month || 0],
    ['Expected ROI', (item) => fmtMoney(item.expected_roi)]
  ]} />
)

const labelize = (value) => String(value || '-').replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase())

const Kpi = ({ label, value }) => (
  <div className="marketing-kpi">
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
)

const Field = ({ label, value, onChange, type = 'text', required = false, textarea = false }) => (
  <label>
    <span>{label}{required ? ' *' : ''}</span>
    {textarea ? (
      <textarea required={required} value={value || ''} onChange={(event) => onChange(event.target.value)} />
    ) : (
      <input required={required} type={type} value={value || ''} onChange={(event) => onChange(event.target.value)} />
    )}
  </label>
)

const RecordList = ({ title, items, columns, onEdit, onDelete, deleteLabel = 'Delete' }) => (
  <div className="marketing-panel">
    <h3>{title}</h3>
    <table className="table table-striped table-bordered">
      <thead className="table-dark">
        <tr>
          {columns.map(([label]) => <th key={label}>{label}</th>)}
          {(onEdit || onDelete) && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            {columns.map(([label, getter]) => <td key={`${item.id}-${label}`}>{getter(item) || '-'}</td>)}
            {(onEdit || onDelete) && (
              <td className="marketing-actions-cell">
                {onEdit && <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => onEdit(item)}>Edit</button>}
                {onDelete && <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => onDelete(item)}>{deleteLabel}</button>}
              </td>
            )}
          </tr>
        ))}
        {items.length === 0 && <tr><td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="text-center">No records found.</td></tr>}
      </tbody>
    </table>
  </div>
)

export default MarketingModule
