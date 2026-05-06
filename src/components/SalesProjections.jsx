import React, { useEffect, useMemo, useState } from 'react'
import adminAPI from '../services/apiService'
import BulkUploadPanel from './BulkUploadPanel'

const months = [
  ['1', 'January'], ['2', 'February'], ['3', 'March'], ['4', 'April'], ['5', 'May'], ['6', 'June'],
  ['7', 'July'], ['8', 'August'], ['9', 'September'], ['10', 'October'], ['11', 'November'], ['12', 'December']
]

const emptyOption = { value: '', label: 'Select' }
const expiryReasons = ['Expired', 'Damaged', 'Return']
const asArray = (value, key) => Array.isArray(value) ? value : (Array.isArray(value?.[key]) ? value[key] : [])
const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value || 0))
const number = (value) => Number(value || 0)
const today = () => new Date().toISOString().slice(0, 10)
const percent = (value) => `${Number(value || 0).toFixed(1)}%`
const monthLabel = (month) => months.find(([value]) => Number(value) === Number(month))?.[1] || month || '-'
const sumBy = (rows, key) => rows.reduce((total, row) => total + number(row[key]), 0)

const initialFinancialYear = () => {
  const now = new Date()
  const year = now.getFullYear()
  return now.getMonth() + 1 >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`
}

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('adminUser') || '{}')
  } catch (error) {
    return {}
  }
}

const expiryStatus = (row) => {
  if (!row.expiry_date) return { label: 'Missing Expiry', className: 'danger', daysLeft: null }
  const todayDate = new Date(today())
  const expiryDate = new Date(row.expiry_date)
  const daysLeft = Math.ceil((expiryDate - todayDate) / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) return { label: 'Expired', className: 'danger', daysLeft }
  if (daysLeft <= 30) return { label: 'Expiring Soon', className: 'warning', daysLeft }
  return { label: 'Healthy', className: 'success', daysLeft }
}

const SalesProjections = () => {
  const currentUser = useMemo(getCurrentUser, [])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [meta, setMeta] = useState({ users: [], products: [], stockists: [], headquarters: [], territories: [] })
  const [locks, setLocks] = useState([])
  const [data, setData] = useState({ targets: [], projections: [], primarySales: [], secondarySales: [], expiryEntries: [], report: [], dashboard: {} })
  const [filters, setFilters] = useState({
    financial_year: initialFinancialYear(),
    month: String(new Date().getMonth() + 1),
    product_id: 'all',
    user_id: 'all',
    hq_id: 'all',
    stockist_id: 'all',
    expiry_status: 'all',
    expiry_from: '',
    expiry_to: ''
  })
  const [forms, setForms] = useState({
    target: { financial_year: initialFinancialYear(), months: ['4', '5', '6'], target_strip: '', rate: '' },
    projection: { financial_year: initialFinancialYear(), month: '4', projection_strip: '', rate: '' },
    primary: { sale_date: today(), quantity_strip: '', rate: '' },
    secondary: { financial_year: initialFinancialYear(), month: '4', opening_strip: '', sale_strip: '', rate: '' },
    expiry: { entry_date: today(), quantity_strip: '', rate: '', reason: 'Expired' }
  })

  const options = useMemo(() => {
    const products = [emptyOption, ...meta.products.map((item) => ({ value: item.id, label: item.name || `Product ${item.id}` }))]
    const users = [emptyOption, ...meta.users.map((item) => ({ value: item.id, label: item.fullName || `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.email || `User ${item.id}` }))]
    const stockists = [emptyOption, ...meta.stockists.map((item) => ({ value: item.id, label: item.stockist_name || `Stockist ${item.id}` }))]
    const headquarters = [emptyOption, ...meta.headquarters.map((item) => ({ value: item.id, label: `${item.name || `HQ ${item.id}`}${item.code ? ` (${item.code})` : ''}` }))]
    const territories = [emptyOption, ...meta.territories.map((item) => ({ value: item.id, label: `${item.name || `Patch ${item.id}`}${item.code ? ` (${item.code})` : ''}` }))]
    return { products, users, stockists, headquarters, territories, months: [emptyOption, ...months.map(([value, label]) => ({ value, label }))] }
  }, [meta])

  const loadMeta = async () => {
    const [users, products, stockists, headquarters, territories] = await Promise.all([
      adminAPI.getUsers().catch(() => []),
      adminAPI.getProducts().catch(() => []),
      adminAPI.getStockists().catch(() => []),
      adminAPI.getHeadquarters().catch(() => []),
      adminAPI.getTerritories().catch(() => [])
    ])
    setMeta({
      users: asArray(users, 'users'),
      products: asArray(products, 'products'),
      stockists: asArray(stockists, 'stockists'),
      headquarters: asArray(headquarters, 'headquarters'),
      territories: asArray(territories, 'territories')
    })
  }

  const loadSalesData = async () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([key, value]) => ['financial_year', 'month', 'product_id', 'user_id'].includes(key) && value && value !== 'all'))
    const [dashboard, targets, projections, primarySales, secondarySales, expiryEntries, report, monthLocks] = await Promise.all([
      adminAPI.getSalesDashboard(params).catch(() => ({ summary: {} })),
      adminAPI.getSalesTargets(params).catch(() => ({ targets: [] })),
      adminAPI.getModuleProjections(params).catch(() => ({ projections: [] })),
      adminAPI.getPrimarySales(params).catch(() => ({ primarySales: [] })),
      adminAPI.getSecondarySales(params).catch(() => ({ secondarySales: [] })),
      adminAPI.getExpiryEntries(params).catch(() => ({ expiryEntries: [] })),
      adminAPI.getSalesModuleReport(params).catch(() => ({ report: [] })),
      adminAPI.getSalesMonthLocks().catch(() => ({ locks: [] }))
    ])
    setData({
      dashboard: dashboard.summary || {},
      targets: asArray(targets, 'targets'),
      projections: asArray(projections, 'projections'),
      primarySales: asArray(primarySales, 'primarySales'),
      secondarySales: asArray(secondarySales, 'secondarySales'),
      expiryEntries: asArray(expiryEntries, 'expiryEntries'),
      report: asArray(report, 'report')
    })
    setLocks(asArray(monthLocks, 'locks'))
  }

  const loadAll = async () => {
    try {
      setLoading(true)
      setError('')
      await loadMeta()
      await loadSalesData()
    } catch (err) {
      setError(err.message || 'Failed to load sales module')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  useEffect(() => {
    if (!loading) loadSalesData()
  }, [filters.financial_year, filters.month, filters.product_id, filters.user_id])

  const productName = (id) => meta.products.find((item) => String(item.id) === String(id))?.name || `Product ${id || '-'}`
  const stockistName = (id) => meta.stockists.find((item) => String(item.id) === String(id))?.stockist_name || `Stockist ${id || '-'}`
  const hqName = (id) => meta.headquarters.find((item) => String(item.id) === String(id))?.name || `HQ ${id || '-'}`
  const userName = (id) => {
    const user = meta.users.find((item) => String(item.id) === String(id))
    return user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || `User ${id || '-'}`
  }

  const filteredData = useMemo(() => {
    const byHq = (row) => filters.hq_id === 'all' || String(row.hq_id || '') === String(filters.hq_id)
    const byStockist = (row) => filters.stockist_id === 'all' || String(row.stockist_id || '') === String(filters.stockist_id)
    const byExpiryStatus = (row) => filters.expiry_status === 'all' || expiryStatus(row).label === filters.expiry_status
    const byExpiryDate = (row) => (!filters.expiry_from || row.expiry_date >= filters.expiry_from) && (!filters.expiry_to || row.expiry_date <= filters.expiry_to)
    return {
      targets: data.targets.filter(byHq),
      projections: data.projections.filter(byHq),
      primarySales: data.primarySales.filter(byStockist),
      secondarySales: data.secondarySales.filter((row) => byHq(row) && byStockist(row)),
      expiryEntries: data.expiryEntries.filter((row) => byHq(row) && byStockist(row) && byExpiryStatus(row) && byExpiryDate(row)),
      report: data.report
    }
  }, [data, filters.hq_id, filters.stockist_id, filters.expiry_status, filters.expiry_from, filters.expiry_to])

  const dashboard = useMemo(() => {
    const target = sumBy(filteredData.targets, 'target_value') || number(data.dashboard.target)
    const projection = sumBy(filteredData.projections, 'projection_value') || number(data.dashboard.projection)
    const secondary = sumBy(filteredData.secondarySales, 'sale_value') || number(data.dashboard.achieved)
    const primary = sumBy(filteredData.primarySales, 'total_value') || number(data.dashboard.primary_sale)
    const expiryLoss = sumBy(filteredData.expiryEntries, 'total_value') || number(data.dashboard.expiry_value)
    const achievement = target ? (secondary / target) * 100 : 0
    const growth = projection ? ((secondary - projection) / projection) * 100 : 0
    return { target, projection, secondary, primary, expiryLoss, achievement, growth }
  }, [filteredData, data.dashboard])

  const expiryAlerts = useMemo(() => filteredData.expiryEntries
    .map((row) => ({ ...row, status: expiryStatus(row) }))
    .filter((row) => ['Expired', 'Expiring Soon', 'Missing Expiry'].includes(row.status.label)), [filteredData.expiryEntries])

  const targetProjectionRows = useMemo(() => {
    const rows = new Map()
    filteredData.targets.forEach((row) => {
      const key = `${row.user_id || 'na'}-${row.product_id}-${row.month}`
      rows.set(key, { key, user_id: row.user_id, hq_id: row.hq_id, product_id: row.product_id, month: row.month, target_strip: row.target_strip, target_value: row.target_value, projection_strip: 0, projection_value: 0 })
    })
    filteredData.projections.forEach((row) => {
      const key = `${row.user_id || 'na'}-${row.product_id}-${row.month}`
      rows.set(key, { ...(rows.get(key) || { key, user_id: row.user_id, hq_id: row.hq_id, product_id: row.product_id, month: row.month, target_strip: 0, target_value: 0 }), projection_strip: row.projection_strip, projection_value: row.projection_value })
    })
    return Array.from(rows.values()).slice(0, 12)
  }, [filteredData.targets, filteredData.projections])

  const isCurrentLocked = locks.some((lock) => lock.is_locked && lock.financial_year === filters.financial_year && Number(lock.month) === Number(filters.month))
  const updateForm = (name, key, value) => setForms((prev) => ({ ...prev, [name]: { ...prev[name], [key]: value } }))
  const withAutoValue = (payload, stripKey, valueKey) => ({ ...payload, [valueKey]: number(payload[valueKey]) || number(payload[stripKey]) * number(payload.rate) })
  const resetNotice = () => {
    setError('')
    setSuccess('')
  }

  const validatePayload = (type, payload) => {
    if (type !== 'target' && type !== 'projection' && type !== 'secondary' && type !== 'expiry' && type !== 'primary') return ''
    if (type === 'target' && (!payload.months || payload.months.length === 0)) return 'Select at least one target month.'
    if (type === 'secondary' && number(payload.sale_strip) > number(payload.opening_strip)) return 'Sale strip cannot exceed opening strip.'
    if (['target', 'projection', 'primary', 'secondary', 'expiry'].includes(type) && number(payload.rate) <= 0) return 'Rate must be greater than 0.'
    if (type === 'target' && number(payload.target_strip) <= 0) return 'Target strip must be greater than 0.'
    if (type === 'projection' && number(payload.projection_strip) <= 0) return 'Projection strip must be greater than 0.'
    if (type === 'primary' && number(payload.quantity_strip) <= 0) return 'Quantity must be greater than 0.'
    if (type === 'secondary' && number(payload.sale_strip) <= 0) return 'Sale strip must be greater than 0.'
    if (type === 'expiry') {
      if (!payload.credit_note_no) return 'Credit Note No is required.'
      if (!payload.batch_number) return 'Batch Number is required.'
      if (!payload.expiry_date) return 'Expiry Date is mandatory.'
      if (number(payload.quantity_strip) <= 0) return 'Quantity must be greater than 0.'
    }
    return ''
  }

  const submit = async (type, event) => {
    event.preventDefault()
    resetNotice()
    const payload = forms[type]
    const validationError = validatePayload(type, payload)
    if (validationError) {
      setError(validationError)
      return
    }
    try {
      if (type === 'target') {
        await Promise.all(payload.months.map((month) => adminAPI.createSalesTarget(withAutoValue({ ...payload, month }, 'target_strip', 'target_value'))))
      }
      if (type === 'projection') await adminAPI.createModuleProjection(withAutoValue(payload, 'projection_strip', 'projection_value'))
      if (type === 'primary') await adminAPI.createPrimarySale(withAutoValue(payload, 'quantity_strip', 'total_value'))
      if (type === 'secondary') {
        const closing_strip = number(payload.opening_strip) - number(payload.sale_strip)
        await adminAPI.createSecondarySale({ ...payload, closing_strip, sale_value: number(payload.sale_strip) * number(payload.rate), closing_value: closing_strip * number(payload.rate) })
      }
      if (type === 'expiry') await adminAPI.createExpiryEntry(withAutoValue(payload, 'quantity_strip', 'total_value'))
      setSuccess(type === 'target' ? 'Target saved for selected months' : 'Sales entry saved successfully')
      await loadSalesData()
    } catch (err) {
      setError(err.message || 'Failed to save sales entry')
    }
  }

  const seedExample = async () => {
    resetNotice()
    try {
      await adminAPI.seedSalesExampleData()
      setSuccess('Example sales module data created')
      await loadSalesData()
    } catch (err) {
      setError(err.message || 'Failed to create example data')
    }
  }

  const toggleMonthLock = async () => {
    resetNotice()
    try {
      await adminAPI.setSalesMonthLock({ financial_year: filters.financial_year, month: filters.month, is_locked: !isCurrentLocked })
      setSuccess(isCurrentLocked ? 'Month unlocked for edits' : 'Month locked. Target, sales, projection, and expiry edits are blocked.')
      await loadSalesData()
    } catch (err) {
      setError(err.message || 'Failed to update month lock')
    }
  }

  const bulkFields = {
    target: [
      { key: 'user_id', label: 'MR Name', type: 'select', options: options.users },
      { key: 'hq_id', label: 'HQ Name', type: 'select', options: options.headquarters },
      { key: 'territory_id', label: 'Patch / Route', type: 'select', options: options.territories },
      { key: 'financial_year', label: 'Financial Year', type: 'text', required: true },
      { key: 'month', label: 'Month', type: 'select', required: true, options: options.months },
      { key: 'product_id', label: 'Brand', type: 'select', required: true, options: options.products },
      { key: 'target_strip', label: 'TGT in Strip', type: 'number', required: true },
      { key: 'rate', label: 'Rate', type: 'number', required: true },
      { key: 'target_value', label: 'TGT in Value', type: 'number' }
    ],
    projection: [
      { key: 'user_id', label: 'MR Name', type: 'select', options: options.users },
      { key: 'hq_id', label: 'HQ Name', type: 'select', options: options.headquarters },
      { key: 'financial_year', label: 'Financial Year', type: 'text', required: true },
      { key: 'month', label: 'Month', type: 'select', required: true, options: options.months },
      { key: 'product_id', label: 'Brand', type: 'select', required: true, options: options.products },
      { key: 'projection_strip', label: 'Projection in Strip', type: 'number', required: true },
      { key: 'rate', label: 'Rate', type: 'number', required: true },
      { key: 'projection_value', label: 'Projection in Value', type: 'number' }
    ],
    primary: [
      { key: 'stockist_id', label: 'Stockist Name', type: 'select', options: options.stockists },
      { key: 'invoice_no', label: 'Invoice No', type: 'text', required: true },
      { key: 'product_id', label: 'Product Name', type: 'select', required: true, options: options.products },
      { key: 'batch_number', label: 'Batch Number', type: 'text' },
      { key: 'quantity_strip', label: 'Quantity in Strip', type: 'number', required: true },
      { key: 'rate', label: 'Rate', type: 'number', required: true },
      { key: 'total_value', label: 'Total Value', type: 'number' },
      { key: 'sale_date', label: 'Sale Date', type: 'date' }
    ],
    secondary: [
      { key: 'hq_id', label: 'HQ Name', type: 'select', options: options.headquarters },
      { key: 'user_id', label: 'MR Name', type: 'select', options: options.users },
      { key: 'stockist_id', label: 'Stockist Name', type: 'select', options: options.stockists },
      { key: 'product_id', label: 'Product Name', type: 'select', required: true, options: options.products },
      { key: 'financial_year', label: 'Financial Year', type: 'text', required: true },
      { key: 'month', label: 'Month', type: 'select', required: true, options: options.months },
      { key: 'opening_strip', label: 'Opening in Strip', type: 'number', required: true },
      { key: 'sale_strip', label: 'Sale in Strip', type: 'number', required: true },
      { key: 'rate', label: 'Rate', type: 'number', required: true }
    ],
    expiry: [
      { key: 'stockist_id', label: 'Stockist Name', type: 'select', options: options.stockists },
      { key: 'hq_id', label: 'HQ Name', type: 'select', options: options.headquarters },
      { key: 'user_id', label: 'MR Name', type: 'select', options: options.users },
      { key: 'credit_note_no', label: 'Credit Note No', type: 'text', required: true },
      { key: 'product_id', label: 'Product Name', type: 'select', required: true, options: options.products },
      { key: 'batch_number', label: 'Batch Number', type: 'text', required: true },
      { key: 'manufacturing_date', label: 'Manufacturing Date', type: 'date' },
      { key: 'expiry_date', label: 'Expiry Date', type: 'date', required: true },
      { key: 'reason', label: 'Reason', type: 'select', options: expiryReasons.map((reason) => ({ value: reason, label: reason })) },
      { key: 'quantity_strip', label: 'Quantity in Strip', type: 'number', required: true },
      { key: 'rate', label: 'Rate', type: 'number', required: true },
      { key: 'total_value', label: 'Credit Note Value', type: 'number' },
      { key: 'entry_date', label: 'Entry Date', type: 'date' }
    ]
  }

  const renderSelect = (formName, key, fieldOptions, required = false) => (
    <select value={forms[formName][key] || ''} required={required} disabled={isCurrentLocked} onChange={(event) => updateForm(formName, key, event.target.value)}>
      {fieldOptions.map((option) => <option key={`${formName}-${key}-${option.value}`} value={option.value}>{option.label}</option>)}
    </select>
  )

  const SalesForm = ({ type, title, children }) => (
    <div className="sales-module-card">
      <BulkUploadPanel
        title={title}
        fields={bulkFields[type]}
        defaults={forms[type]}
        createRecord={(payload) => {
          if (type === 'target') return adminAPI.createSalesTarget(withAutoValue(payload, 'target_strip', 'target_value'))
          if (type === 'projection') return adminAPI.createModuleProjection(withAutoValue(payload, 'projection_strip', 'projection_value'))
          if (type === 'primary') return adminAPI.createPrimarySale(withAutoValue(payload, 'quantity_strip', 'total_value'))
          if (type === 'secondary') return adminAPI.createSecondarySale(payload)
          return adminAPI.createExpiryEntry(withAutoValue(payload, 'quantity_strip', 'total_value'))
        }}
        onComplete={loadSalesData}
      />
      {isCurrentLocked && <div className="alert alert-warning">This month is locked. Admin must unlock it before new entries can be saved.</div>}
      <form className="sales-module-form" onSubmit={(event) => submit(type, event)}>
        {children}
        <div className="master-admin-actions">
          <button type="submit" className="btn btn-primary" disabled={isCurrentLocked}>Save {title}</button>
        </div>
      </form>
    </div>
  )

  const rowDate = (row) => row.sale_date || row.entry_date || `${row.financial_year || ''} / ${monthLabel(row.month)}`
  const fieldNote = (text) => <small className="auto-calc-note">{text}</small>

  if (loading) {
    return (
      <div className="section-content">
        <h2>Sales Module</h2>
        <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i> Loading sales module...</div>
      </div>
    )
  }

  return (
    <div className="section-content sales-module">
      <div className="operation-mode-header addition">
        <div>
          <h2>Sales Intelligence Module</h2>
          <p>Targets, projection planning, sales, expiry, locks, hierarchy visibility, reports, growth, achievement, and incentive readiness.</p>
        </div>
        <div className="operation-header-actions">
          <button type="button" className="btn btn-light" onClick={seedExample}>Seed Example Data</button>
          <button type="button" className={isCurrentLocked ? 'btn btn-warning' : 'btn btn-secondary'} onClick={toggleMonthLock}>
            {isCurrentLocked ? 'Unlock Month' : 'Lock Month'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={loadAll}>Refresh</button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="sales-governance-strip">
        <span><strong>Role:</strong> {currentUser.role || currentUser.employeeType || 'User'}</span>
        <span><strong>Hierarchy:</strong> MR {'->'} ABM {'->'} RBM {'->'} ZBM {'->'} NSM</span>
        <span><strong>Visibility:</strong> records are auto-filtered to self and reporting chain by backend.</span>
        <span><strong>Month:</strong> {isCurrentLocked ? 'Locked' : 'Open'}</span>
      </div>

      <div className="sales-filter-bar sticky-sales-filters">
        <label><span>Financial Year</span><input value={filters.financial_year} onChange={(event) => setFilters({ ...filters, financial_year: event.target.value })} /></label>
        <label><span>Month</span><select value={filters.month} onChange={(event) => setFilters({ ...filters, month: event.target.value })}>{months.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label><span>Product</span><select value={filters.product_id} onChange={(event) => setFilters({ ...filters, product_id: event.target.value })}><option value="all">All Products</option>{options.products.slice(1).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label><span>Employee</span><select value={filters.user_id} onChange={(event) => setFilters({ ...filters, user_id: event.target.value })}><option value="all">All Employees</option>{options.users.slice(1).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label><span>HQ</span><select value={filters.hq_id} onChange={(event) => setFilters({ ...filters, hq_id: event.target.value })}><option value="all">All HQ</option>{options.headquarters.slice(1).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label><span>Stockist</span><select value={filters.stockist_id} onChange={(event) => setFilters({ ...filters, stockist_id: event.target.value })}><option value="all">All Stockists</option>{options.stockists.slice(1).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label><span>Expiry Status</span><select value={filters.expiry_status} onChange={(event) => setFilters({ ...filters, expiry_status: event.target.value })}><option value="all">All Status</option><option>Expired</option><option>Expiring Soon</option><option>Healthy</option><option>Missing Expiry</option></select></label>
        <label><span>Expiry From</span><input type="date" value={filters.expiry_from} onChange={(event) => setFilters({ ...filters, expiry_from: event.target.value })} /></label>
        <label><span>Expiry To</span><input type="date" value={filters.expiry_to} onChange={(event) => setFilters({ ...filters, expiry_to: event.target.value })} /></label>
      </div>

      <div className="sales-tabs">
        {[
          ['dashboard', 'Dashboard'], ['target', 'Target Entry'], ['projection', 'Projection Planning'], ['primary', 'Primary Sales'],
          ['secondary', 'Secondary Sales'], ['expiry', 'Expiry Management'], ['reports', 'Sales Reports'], ['growth', 'Growth & Achievement'], ['incentive', 'Incentive Calculation']
        ].map(([key, label]) => <button type="button" key={key} className={activeTab === key ? 'active' : ''} onClick={() => setActiveTab(key)}>{label}</button>)}
      </div>

      {activeTab === 'dashboard' && (
        <>
          <div className="sales-summary enterprise-summary">
            <div className="summary-card"><h3>Target</h3><p className="summary-value">{money(dashboard.target)}</p><p className="summary-change neutral">{data.dashboard.monthName || monthLabel(filters.month)}</p></div>
            <div className="summary-card"><h3>Projection</h3><p className="summary-value">{money(dashboard.projection)}</p><p className="summary-change neutral">Expected sales</p></div>
            <div className="summary-card"><h3>Secondary Sales</h3><p className="summary-value">{money(dashboard.secondary)}</p><p className={dashboard.achievement >= 100 ? 'summary-change positive' : 'summary-change negative'}>{percent(dashboard.achievement)} achievement</p></div>
            <div className="summary-card"><h3>Primary Sales</h3><p className="summary-value">{money(dashboard.primary)}</p><p className="summary-change neutral">Company to stockist</p></div>
            <div className="summary-card"><h3>Growth</h3><p className="summary-value">{percent(dashboard.growth)}</p><p className={dashboard.growth >= 0 ? 'summary-change positive' : 'summary-change negative'}>{dashboard.growth >= 0 ? 'Above projection' : 'Below projection'}</p></div>
            <div className="summary-card"><h3>Expiry Loss</h3><p className="summary-value">{money(dashboard.expiryLoss)}</p><p className="summary-change negative">{expiryAlerts.length} alerts</p></div>
          </div>
          {expiryAlerts.length > 0 && (
            <div className="sales-alert-panel">
              <h3>Expiry Alerts</h3>
              <div className="sales-alert-list">
                {expiryAlerts.slice(0, 5).map((row) => (
                  <span key={`alert-${row.id}`} className={`status-pill ${row.status.className}`}>{productName(row.product_id)} / {row.batch_number || 'Batch missing'} / {row.status.label}</span>
                ))}
              </div>
            </div>
          )}
          <div className="sales-flow">Target Set <span>-&gt;</span> Projection <span>-&gt;</span> Primary Sales <span>-&gt;</span> Secondary Sales <span>-&gt;</span> Achievement <span>-&gt;</span> Incentive</div>
        </>
      )}

      {activeTab === 'target' && (
        <SalesForm type="target" title="Target Entry">
          <label><span>MR Name</span>{renderSelect('target', 'user_id', options.users)}</label>
          <label><span>HQ Name</span>{renderSelect('target', 'hq_id', options.headquarters)}</label>
          <label><span>Patch / Route</span>{renderSelect('target', 'territory_id', options.territories)}</label>
          <label><span>Financial Year</span><input value={forms.target.financial_year} disabled={isCurrentLocked} onChange={(e) => updateForm('target', 'financial_year', e.target.value)} required /></label>
          <div className="sales-month-grid">
            <span>Months</span>
            <div>
              {months.map(([value, label]) => (
                <label key={`target-month-${value}`}><input type="checkbox" checked={forms.target.months.includes(value)} disabled={isCurrentLocked} onChange={(event) => {
                  const next = event.target.checked ? [...forms.target.months, value] : forms.target.months.filter((item) => item !== value)
                  updateForm('target', 'months', next)
                }} />{label.slice(0, 3)}</label>
              ))}
            </div>
          </div>
          <label><span>Brand</span>{renderSelect('target', 'product_id', options.products, true)}</label>
          <label><span>TGT in Strip</span><input type="number" value={forms.target.target_strip} disabled={isCurrentLocked} onChange={(e) => updateForm('target', 'target_strip', e.target.value)} required min="1" /></label>
          <label><span>Rate</span><input type="number" value={forms.target.rate} disabled={isCurrentLocked} onChange={(e) => updateForm('target', 'rate', e.target.value)} required min="1" /></label>
          <label><span>TGT in Value</span><input value={money(number(forms.target.target_strip) * number(forms.target.rate))} readOnly />{fieldNote('Auto calculated: strip x rate')}</label>
        </SalesForm>
      )}

      {activeTab === 'projection' && (
        <SalesForm type="projection" title="Projection Planning">
          <label><span>MR Name</span>{renderSelect('projection', 'user_id', options.users)}</label>
          <label><span>HQ Name</span>{renderSelect('projection', 'hq_id', options.headquarters)}</label>
          <label><span>Financial Year</span><input value={forms.projection.financial_year} disabled={isCurrentLocked} onChange={(e) => updateForm('projection', 'financial_year', e.target.value)} required /></label>
          <label><span>Month</span>{renderSelect('projection', 'month', options.months, true)}</label>
          <label><span>Brand</span>{renderSelect('projection', 'product_id', options.products, true)}</label>
          <label><span>Projection in Strip</span><input type="number" value={forms.projection.projection_strip} disabled={isCurrentLocked} onChange={(e) => updateForm('projection', 'projection_strip', e.target.value)} required min="1" /></label>
          <label><span>Rate</span><input type="number" value={forms.projection.rate} disabled={isCurrentLocked} onChange={(e) => updateForm('projection', 'rate', e.target.value)} required min="1" /></label>
          <label><span>Projection in Value</span><input value={money(number(forms.projection.projection_strip) * number(forms.projection.rate))} readOnly />{fieldNote('Auto calculated: projection strip x rate')}</label>
          <div className="target-projection-panel">
            <h3>Target vs Projection</h3>
            <table className="table table-striped">
              <thead className="thead-dark"><tr><th>Month</th><th>MR</th><th>HQ</th><th>Product</th><th>Target Strip</th><th>Target Value</th><th>Projection Strip</th><th>Projection Value</th></tr></thead>
              <tbody>{targetProjectionRows.map((row) => <tr key={row.key}><td>{monthLabel(row.month)}</td><td>{userName(row.user_id)}</td><td>{hqName(row.hq_id)}</td><td>{productName(row.product_id)}</td><td>{row.target_strip}</td><td>{money(row.target_value)}</td><td>{row.projection_strip}</td><td>{money(row.projection_value)}</td></tr>)}</tbody>
            </table>
          </div>
        </SalesForm>
      )}

      {activeTab === 'primary' && (
        <SalesForm type="primary" title="Primary Sales">
          <label><span>Stockist Name</span>{renderSelect('primary', 'stockist_id', options.stockists)}</label>
          <label><span>Invoice No</span><input value={forms.primary.invoice_no || ''} disabled={isCurrentLocked} onChange={(e) => updateForm('primary', 'invoice_no', e.target.value)} required /></label>
          <label><span>Product Name</span>{renderSelect('primary', 'product_id', options.products, true)}</label>
          <label><span>Batch Number</span><input value={forms.primary.batch_number || ''} disabled={isCurrentLocked} onChange={(e) => updateForm('primary', 'batch_number', e.target.value)} /></label>
          <label><span>Quantity in Strip</span><input type="number" value={forms.primary.quantity_strip} disabled={isCurrentLocked} onChange={(e) => updateForm('primary', 'quantity_strip', e.target.value)} required min="1" /></label>
          <label><span>Rate</span><input type="number" value={forms.primary.rate} disabled={isCurrentLocked} onChange={(e) => updateForm('primary', 'rate', e.target.value)} required min="1" /></label>
          <label><span>Total Value</span><input value={money(number(forms.primary.quantity_strip) * number(forms.primary.rate))} readOnly />{fieldNote('Auto calculated')}</label>
          <label><span>Sale Date</span><input type="date" value={forms.primary.sale_date} disabled={isCurrentLocked} onChange={(e) => updateForm('primary', 'sale_date', e.target.value)} /></label>
        </SalesForm>
      )}

      {activeTab === 'secondary' && (
        <SalesForm type="secondary" title="Secondary Sales">
          <label><span>HQ Name</span>{renderSelect('secondary', 'hq_id', options.headquarters)}</label>
          <label><span>MR Name</span>{renderSelect('secondary', 'user_id', options.users)}</label>
          <label><span>Stockist Name</span>{renderSelect('secondary', 'stockist_id', options.stockists)}</label>
          <label><span>Product Name</span>{renderSelect('secondary', 'product_id', options.products, true)}</label>
          <label><span>Financial Year</span><input value={forms.secondary.financial_year} disabled={isCurrentLocked} onChange={(e) => updateForm('secondary', 'financial_year', e.target.value)} required /></label>
          <label><span>Month</span>{renderSelect('secondary', 'month', options.months, true)}</label>
          <label><span>Opening Strip</span><input type="number" value={forms.secondary.opening_strip} disabled={isCurrentLocked} onChange={(e) => updateForm('secondary', 'opening_strip', e.target.value)} required min="0" /></label>
          <label><span>Sale Strip</span><input type="number" value={forms.secondary.sale_strip} disabled={isCurrentLocked} onChange={(e) => updateForm('secondary', 'sale_strip', e.target.value)} required min="1" max={forms.secondary.opening_strip || undefined} /></label>
          <label><span>Rate</span><input type="number" value={forms.secondary.rate} disabled={isCurrentLocked} onChange={(e) => updateForm('secondary', 'rate', e.target.value)} required min="1" /></label>
          <label><span>Closing Strip</span><input className={number(forms.secondary.sale_strip) > number(forms.secondary.opening_strip) ? 'field-error' : ''} value={`${number(forms.secondary.opening_strip) - number(forms.secondary.sale_strip)} strips`} readOnly />{fieldNote('Closing = Opening - Sale')}</label>
        </SalesForm>
      )}

      {activeTab === 'expiry' && (
        <>
          <SalesForm type="expiry" title="Expiry Entry">
            <label><span>Stockist Name</span>{renderSelect('expiry', 'stockist_id', options.stockists)}</label>
            <label><span>HQ Name</span>{renderSelect('expiry', 'hq_id', options.headquarters)}</label>
            <label><span>MR Name</span>{renderSelect('expiry', 'user_id', options.users)}</label>
            <label><span>Credit Note No</span><input value={forms.expiry.credit_note_no || ''} disabled={isCurrentLocked} onChange={(e) => updateForm('expiry', 'credit_note_no', e.target.value)} required /></label>
            <label><span>Product Name</span>{renderSelect('expiry', 'product_id', options.products, true)}</label>
            <label><span>Batch Number</span><input value={forms.expiry.batch_number || ''} disabled={isCurrentLocked} onChange={(e) => updateForm('expiry', 'batch_number', e.target.value)} required /></label>
            <label><span>Manufacturing Date</span><input type="date" value={forms.expiry.manufacturing_date || ''} disabled={isCurrentLocked} onChange={(e) => updateForm('expiry', 'manufacturing_date', e.target.value)} /></label>
            <label><span>Expiry Date</span><input type="date" value={forms.expiry.expiry_date || ''} disabled={isCurrentLocked} onChange={(e) => updateForm('expiry', 'expiry_date', e.target.value)} required /></label>
            <label><span>Reason / Type</span>{renderSelect('expiry', 'reason', expiryReasons.map((reason) => ({ value: reason, label: reason })), true)}</label>
            <label><span>Quantity in Strip</span><input type="number" value={forms.expiry.quantity_strip} disabled={isCurrentLocked} onChange={(e) => updateForm('expiry', 'quantity_strip', e.target.value)} required min="1" /></label>
            <label><span>Rate</span><input type="number" value={forms.expiry.rate} disabled={isCurrentLocked} onChange={(e) => updateForm('expiry', 'rate', e.target.value)} required min="1" /></label>
            <label><span>Credit Note Value</span><input value={money(number(forms.expiry.quantity_strip) * number(forms.expiry.rate))} readOnly />{fieldNote('Auto calculated and used for expiry loss')}</label>
            <label><span>Entry Date</span><input type="date" value={forms.expiry.entry_date} disabled={isCurrentLocked} onChange={(e) => updateForm('expiry', 'entry_date', e.target.value)} /></label>
            <div className="stock-impact-note"><strong>Stock Impact</strong><span>Expiry entry reduces stockist inventory by quantity strip. Backend stores this impact note for inventory reconciliation.</span></div>
          </SalesForm>
          <div className="projections-table sales-table-card">
            <h3>Batch-wise Expiry Tracking</h3>
            <table className="table table-striped">
              <thead className="thead-dark"><tr><th>Product</th><th>Batch</th><th>Stockist</th><th>HQ</th><th>Expiry Date</th><th>Days Left</th><th>Status</th><th>Qty</th><th>Credit Note</th><th>Value</th></tr></thead>
              <tbody>{filteredData.expiryEntries.map((row) => {
                const status = expiryStatus(row)
                return <tr key={`e-${row.id}`}><td>{productName(row.product_id)}</td><td>{row.batch_number || '-'}</td><td>{stockistName(row.stockist_id)}</td><td>{hqName(row.hq_id)}</td><td>{row.expiry_date || '-'}</td><td>{status.daysLeft ?? '-'}</td><td><span className={`status-pill ${status.className}`}>{status.label}</span></td><td>{row.quantity_strip}</td><td>{row.credit_note_no}</td><td>{money(row.total_value)}</td></tr>
              })}</tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'reports' && (
        <div className="projections-table sales-table-card">
          <h3>Sales Reports</h3>
          <table className="table table-striped">
            <thead className="thead-dark"><tr><th>Product</th><th>Target</th><th>Projection</th><th>Secondary</th><th>Expiry</th><th>Achievement</th><th>Status</th></tr></thead>
            <tbody>{data.report.map((row) => <tr key={row.product_id}><td>{row.product_name}</td><td>{money(row.target_value)}</td><td>{money(row.projection_value)}</td><td>{money(row.achieved_value)}</td><td>{money(row.expiry_value)}</td><td>{percent(row.achievementPercent)}</td><td><span className={`status-pill ${number(row.achievementPercent) >= 100 ? 'success' : 'danger'}`}>{number(row.achievementPercent) >= 100 ? 'Achieved' : 'Below Target'}</span></td></tr>)}</tbody>
          </table>
        </div>
      )}

      {activeTab === 'growth' && (
        <div className="projections-table sales-table-card">
          <h3>Growth & Achievement View</h3>
          <div className="achievement-cards">
            <div><strong>{percent(dashboard.achievement)}</strong><span>Achievement = Actual / Target x 100</span></div>
            <div><strong>{percent(dashboard.growth)}</strong><span>Growth = (Actual - Projection) / Projection x 100</span></div>
            <div><strong>{money(dashboard.secondary - dashboard.expiryLoss)}</strong><span>Net achievement after expiry loss</span></div>
          </div>
          <table className="table table-striped">
            <thead className="thead-dark"><tr><th>Type</th><th>Date/Month</th><th>Product</th><th>Employee/Stockist</th><th>Value</th><th>Indicator</th></tr></thead>
            <tbody>
              {filteredData.targets.slice(0, 8).map((row) => <tr key={`t-${row.id}`}><td>Target</td><td>{rowDate(row)}</td><td>{productName(row.product_id)}</td><td>{userName(row.user_id)}</td><td>{money(row.target_value)}</td><td><span className="status-pill neutral">Baseline</span></td></tr>)}
              {filteredData.projections.slice(0, 8).map((row) => <tr key={`p-${row.id}`}><td>Projection</td><td>{rowDate(row)}</td><td>{productName(row.product_id)}</td><td>{userName(row.user_id)}</td><td>{money(row.projection_value)}</td><td><span className="status-pill neutral">Forecast</span></td></tr>)}
              {filteredData.secondarySales.slice(0, 8).map((row) => <tr key={`s-${row.id}`}><td>Achievement</td><td>{rowDate(row)}</td><td>{productName(row.product_id)}</td><td>{hqName(row.hq_id)}</td><td>{money(row.sale_value)}</td><td><span className="status-pill success">Actual</span></td></tr>)}
              {filteredData.primarySales.slice(0, 8).map((row) => <tr key={`pr-${row.id}`}><td>Primary</td><td>{rowDate(row)}</td><td>{productName(row.product_id)}</td><td>{stockistName(row.stockist_id)}</td><td>{money(row.total_value)}</td><td><span className="status-pill neutral">Stockist supply</span></td></tr>)}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'incentive' && (
        <div className="sales-placeholder-panel">
          <h3>Incentive Calculation</h3>
          <p>Achievement data is ready for incentive slabs. Keep incentive rules in finance or policy configuration, then calculate from target, secondary achievement, growth, and expiry loss.</p>
          <div className="achievement-cards">
            <div><strong>{percent(dashboard.achievement)}</strong><span>Achievement basis</span></div>
            <div><strong>{percent(dashboard.growth)}</strong><span>Growth basis</span></div>
            <div><strong>{money(dashboard.expiryLoss)}</strong><span>Expiry deduction candidate</span></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalesProjections
