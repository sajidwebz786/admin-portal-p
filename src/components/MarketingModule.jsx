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
const fmtMoney = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

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

const cloneDefaultStrategy = () => ({
  ...defaultStrategy,
  visits: defaultStrategy.visits.map((visit) => ({ ...visit }))
})

const MarketingModule = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [dashboard, setDashboard] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [strategies, setStrategies] = useState([])
  const [rcpas, setRcpas] = useState([])
  const [support, setSupport] = useState({ products: [], inputs: [], users: [], divisions: [], specialties: [] })
  const [campaignForm, setCampaignForm] = useState(defaultCampaign)
  const [strategyForm, setStrategyForm] = useState(cloneDefaultStrategy())
  const [rcpaForm, setRcpaForm] = useState(defaultRcpa)
  const [editingCampaignId, setEditingCampaignId] = useState(null)
  const [editingStrategyId, setEditingStrategyId] = useState(null)
  const [editingRcpaId, setEditingRcpaId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const options = useMemo(() => ({
    products: [empty, ...support.products.map((item) => ({ value: item.id, label: item.name || `Product ${item.id}` }))],
    inputs: [empty, ...support.inputs.map((item) => ({ value: item.id, label: item.input_name || `Input ${item.id}` }))],
    users: [empty, ...support.users.map((item) => ({ value: item.id, label: item.fullName || `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.email || `User ${item.id}` }))],
    divisions: [empty, ...support.divisions.map((item) => ({ value: item.id, label: item.division_name || `Division ${item.id}` }))],
    specialties: [empty, ...support.specialties.map((item) => ({ value: item.id, label: item.specialty_name || `Specialty ${item.id}` }))]
  }), [support])

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    try {
      setLoading(true)
      setError('')
      const [dash, campaignData, strategyData, rcpaData, products, inputs, users, divisions, specialties] = await Promise.all([
        adminAPI.getMarketingDashboard(),
        adminAPI.getMarketingCampaigns(),
        adminAPI.getMarketingStrategies(),
        adminAPI.getMarketingRCPAs(),
        adminAPI.getProducts().catch(() => []),
        adminAPI.getInputs().catch(() => []),
        adminAPI.getUsers().catch(() => []),
        adminAPI.getDivisions().catch(() => []),
        adminAPI.getDoctorSpecialties().catch(() => [])
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
        specialties: asArray(specialties)
      })
    } catch (err) {
      setError(err.message || 'Failed to load marketing module')
    } finally {
      setLoading(false)
    }
  }

  const sanitize = (data) => Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value === '' ? null : value]))
  const handleCampaignChange = (key, value) => setCampaignForm((prev) => ({ ...prev, [key]: value }))
  const handleStrategyChange = (key, value) => setStrategyForm((prev) => ({ ...prev, [key]: value }))
  const handleRcpaChange = (key, value) => setRcpaForm((prev) => ({ ...prev, [key]: value }))

  const submitCampaign = async (event) => {
    event.preventDefault()
    if (editingCampaignId) {
      await adminAPI.updateMarketingCampaign(editingCampaignId, sanitize(campaignForm))
    } else {
      await adminAPI.createMarketingCampaign(sanitize(campaignForm))
    }
    setEditingCampaignId(null)
    setCampaignForm(defaultCampaign)
    await loadAll()
  }

  const submitStrategy = async (event) => {
    event.preventDefault()
    if (editingStrategyId) {
      await adminAPI.updateMarketingStrategy(editingStrategyId, sanitize(strategyForm))
    } else {
      await adminAPI.createMarketingStrategy(sanitize(strategyForm))
    }
    setEditingStrategyId(null)
    setStrategyForm(cloneDefaultStrategy())
    await loadAll()
  }

  const submitRcpa = async (event) => {
    event.preventDefault()
    if (editingRcpaId) {
      await adminAPI.updateMarketingRCPA(editingRcpaId, sanitize(rcpaForm))
    } else {
      await adminAPI.createMarketingRCPA(sanitize(rcpaForm))
    }
    setEditingRcpaId(null)
    setRcpaForm(defaultRcpa)
    await loadAll()
  }

  const editCampaign = (item) => {
    setEditingCampaignId(item.id)
    setCampaignForm({
      ...defaultCampaign,
      ...item,
      start_date: String(item.start_date || today()).slice(0, 10),
      end_date: String(item.end_date || nextQuarter()).slice(0, 10)
    })
    setActiveTab('campaigns')
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
    setActiveTab('strategy')
  }

  const editRcpa = (item) => {
    setEditingRcpaId(item.id)
    setRcpaForm({ ...defaultRcpa, ...item })
    setActiveTab('rcpa')
  }

  const cancelCampaignEdit = () => {
    setEditingCampaignId(null)
    setCampaignForm(defaultCampaign)
  }

  const cancelStrategyEdit = () => {
    setEditingStrategyId(null)
    setStrategyForm(cloneDefaultStrategy())
  }

  const cancelRcpaEdit = () => {
    setEditingRcpaId(null)
    setRcpaForm(defaultRcpa)
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

  const addVisit = () => {
    setStrategyForm((prev) => ({
      ...prev,
      visits: [...prev.visits, { visit: prev.visits.length + 1, input: '' }]
    }))
  }

  const updateVisit = (index, value) => {
    setStrategyForm((prev) => ({
      ...prev,
      visits: prev.visits.map((item, i) => i === index ? { ...item, input: value } : item)
    }))
  }

  const renderSelect = (value, onChange, items) => (
    <select value={value || ''} onChange={(event) => onChange(event.target.value)}>
      {items.map((item) => <option key={`${item.label}-${item.value}`} value={item.value}>{item.label}</option>)}
    </select>
  )

  return (
    <div className="section-content marketing-module">
      <div className="page-header marketing-header">
        <div>
          <h2>Marketing</h2>
          <p>Campaign creation, brand-wise strategy, input allocation, ROI forecasting, reporting, and RCPA execution.</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={loadAll}>Refresh</button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="marketing-tabs">
        {[
          ['dashboard', 'Report'],
          ['campaigns', 'Create Campaign'],
          ['strategy', 'Brand Strategy'],
          ['rcpa', 'RCPA']
        ].map(([id, label]) => (
          <button key={id} type="button" className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <>
          <div className="marketing-kpis">
            <Kpi label="Total Campaigns" value={dashboard?.totalCampaigns || 0} />
            <Kpi label="Closed" value={dashboard?.closed || 0} />
            <Kpi label="Running" value={dashboard?.running || 0} />
            <Kpi label="Investment" value={fmtMoney(dashboard?.totalInvestment)} />
            <Kpi label="ROI" value={fmtMoney(dashboard?.roi)} />
            <Kpi label="New Prescribers" value={dashboard?.newPrescribersAdded || 0} />
          </div>
          <div className="marketing-panel">
            <h3>Campaign View Panel</h3>
            <table className="table table-striped table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>Campaign</th>
                  <th>Brand</th>
                  <th>Status</th>
                  <th>Investment</th>
                  <th>ROI</th>
                  <th>HQ 100%</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((item) => (
                  <tr key={item.id}>
                    <td>{item.campaign_name}</td>
                    <td>{item.brand_name || item.product?.name || '-'}</td>
                    <td>{item.status}</td>
                    <td>{fmtMoney(item.total_investment)}</td>
                    <td>{fmtMoney(item.expected_roi)}</td>
                    <td>{item.hq_at_100 || 0}</td>
                  </tr>
                ))}
                {!loading && campaigns.length === 0 && <tr><td colSpan="6" className="text-center">No campaigns found.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'campaigns' && (
        <div className="marketing-grid">
          <form className="marketing-form" onSubmit={submitCampaign}>
            <h3>{editingCampaignId ? 'Edit Campaign' : 'Create Campaign'}</h3>
            <Field label="Campaign Code" required value={campaignForm.campaign_code} onChange={(v) => handleCampaignChange('campaign_code', v)} />
            <Field label="Campaign Name" required value={campaignForm.campaign_name} onChange={(v) => handleCampaignChange('campaign_name', v)} />
            <Field label="Start Date" type="date" required value={campaignForm.start_date} onChange={(v) => handleCampaignChange('start_date', v)} />
            <Field label="End Date" type="date" required value={campaignForm.end_date} onChange={(v) => handleCampaignChange('end_date', v)} />
            <label><span>Campaign For</span>{renderSelect(campaignForm.campaign_for, (v) => handleCampaignChange('campaign_for', v), [
              { value: 'doctor', label: 'Doctor' },
              { value: 'chemist', label: 'Chemist' },
              { value: 'patient', label: 'Patient' },
              { value: 'hospital_staff', label: 'Hospital Staff' },
              { value: 'stockist', label: 'Stockist' },
              { value: 'clinic', label: 'Clinic' }
            ])}</label>
            <label><span>Speciality</span>{renderSelect(campaignForm.speciality_id, (v) => handleCampaignChange('speciality_id', v), options.specialties)}</label>
            <label><span>Product</span>{renderSelect(campaignForm.product_id, (v) => handleCampaignChange('product_id', v), options.products)}</label>
            <Field label="Brand Name" value={campaignForm.brand_name} onChange={(v) => handleCampaignChange('brand_name', v)} />
            <Field label="Objective" textarea value={campaignForm.objective} onChange={(v) => handleCampaignChange('objective', v)} />
            <Field label="Number of Targets" type="number" value={campaignForm.target_count} onChange={(v) => handleCampaignChange('target_count', v)} />
            <label><span>Alloted Division</span>{renderSelect(campaignForm.allocated_division_id, (v) => handleCampaignChange('allocated_division_id', v), options.divisions)}</label>
            <label><span>Alloted Role</span>{renderSelect(campaignForm.allocated_role, (v) => handleCampaignChange('allocated_role', v), [empty, 'ZBM', 'RBM', 'ABM', 'TBM'].map((role) => typeof role === 'string' ? { value: role, label: role } : role))}</label>
            <label><span>Alloted Name</span>{renderSelect(campaignForm.allocated_user_id, (v) => handleCampaignChange('allocated_user_id', v), options.users)}</label>
            <label><span>Input</span>{renderSelect(campaignForm.input_id, (v) => handleCampaignChange('input_id', v), options.inputs)}</label>
            <Field label="Input Name" value={campaignForm.input_name} onChange={(v) => handleCampaignChange('input_name', v)} />
            <Field label="Qty in a Visit" type="number" value={campaignForm.qty_per_visit} onChange={(v) => handleCampaignChange('qty_per_visit', v)} />
            <label><span>Distribution Type</span>{renderSelect(campaignForm.distribution_type, (v) => handleCampaignChange('distribution_type', v), [{ value: 'once', label: 'Once' }, { value: 'recurring', label: 'Recurring' }])}</label>
            <Field label="Times / Period" type="number" value={campaignForm.recurrence_count} onChange={(v) => handleCampaignChange('recurrence_count', v)} />
            <Field label="Input Value / Unit" type="number" value={campaignForm.input_unit_value} onChange={(v) => handleCampaignChange('input_unit_value', v)} />
            <Field label="Expected ROI" type="number" value={campaignForm.expected_roi} onChange={(v) => handleCampaignChange('expected_roi', v)} />
            <Field label="Prescription / Month" type="number" value={campaignForm.prescription_per_month} onChange={(v) => handleCampaignChange('prescription_per_month', v)} />
            <Field label="Strip Sale / Rx" type="number" value={campaignForm.strip_sale_per_rx} onChange={(v) => handleCampaignChange('strip_sale_per_rx', v)} />
            <div className="marketing-form-actions">
              <button className="btn btn-primary" type="submit">{editingCampaignId ? 'Save Campaign' : 'Create Campaign'}</button>
              {editingCampaignId && <button className="btn btn-light" type="button" onClick={cancelCampaignEdit}>Cancel Edit</button>}
            </div>
          </form>
          <RecordList title="Campaigns" items={campaigns} columns={['campaign_name', 'campaign_for', 'status']} onEdit={editCampaign} onDelete={deleteCampaign} deleteLabel="Cancel" />
        </div>
      )}

      {activeTab === 'strategy' && (
        <div className="marketing-grid">
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
                <Field key={visit.visit} label={`Visit ${visit.visit}`} value={visit.input} onChange={(v) => updateVisit(index, v)} />
              ))}
              <button type="button" className="btn btn-light" onClick={addVisit}>Add Visit</button>
            </div>
            <div className="marketing-form-actions">
              <button className="btn btn-primary" type="submit">{editingStrategyId ? 'Update Strategy' : 'Save Strategy'}</button>
              {editingStrategyId && <button className="btn btn-light" type="button" onClick={cancelStrategyEdit}>Cancel Edit</button>}
            </div>
          </form>
          <RecordList title="Brand Strategies" items={strategies} columns={['financial_year', 'brand_name', 'status']} onEdit={editStrategy} onDelete={deleteStrategy} deleteLabel="Inactivate" />
        </div>
      )}

      {activeTab === 'rcpa' && (
        <div className="marketing-grid">
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
            <label><span>Allocate To Role</span>{renderSelect(rcpaForm.allocated_role, (v) => handleRcpaChange('allocated_role', v), [empty, 'ZBM', 'RBM', 'ABM', 'TBM'].map((role) => typeof role === 'string' ? { value: role, label: role } : role))}</label>
            <label><span>Allocate To Name</span>{renderSelect(rcpaForm.allocated_user_id, (v) => handleRcpaChange('allocated_user_id', v), options.users)}</label>
            <div className="marketing-form-actions">
              <button className="btn btn-primary" type="submit">{editingRcpaId ? 'Update RCPA' : 'Create RCPA'}</button>
              {editingRcpaId && <button className="btn btn-light" type="button" onClick={cancelRcpaEdit}>Cancel Edit</button>}
            </div>
          </form>
          <RecordList title="RCPA View" items={rcpas} columns={['rcpa_name', 'rcpa_type', 'status']} onEdit={editRcpa} onDelete={deleteRcpa} deleteLabel="Close" />
        </div>
      )}
    </div>
  )
}

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
          {columns.map((col) => <th key={col}>{col.replaceAll('_', ' ')}</th>)}
          {(onEdit || onDelete) && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            {columns.map((col) => <td key={`${item.id}-${col}`}>{item[col] || '-'}</td>)}
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
