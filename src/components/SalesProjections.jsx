import React, { useEffect, useMemo, useState } from 'react'
import adminAPI from '../services/apiService'
import BulkUploadPanel from './BulkUploadPanel'

const months = [
  ['1', 'January'], ['2', 'February'], ['3', 'March'], ['4', 'April'], ['5', 'May'], ['6', 'June'],
  ['7', 'July'], ['8', 'August'], ['9', 'September'], ['10', 'October'], ['11', 'November'], ['12', 'December']
]

const emptyOption = { value: '', label: 'Select' }
const asArray = (value, key) => Array.isArray(value) ? value : (Array.isArray(value?.[key]) ? value[key] : [])
const number = (value) => Number(value || 0)
const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(number(value))
const today = () => new Date().toISOString().slice(0, 10)
const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`

const initialFinancialYear = () => {
  const now = new Date()
  const year = now.getFullYear()
  return now.getMonth() + 1 >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`
}

const SalesProjections = () => {
  const [activeSection, setActiveSection] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [reportSearch, setReportSearch] = useState('')
  const [entryOpen, setEntryOpen] = useState(null)
  const [meta, setMeta] = useState({ users: [], products: [], stockists: [], headquarters: [], territories: [], divisions: [] })
  const [data, setData] = useState({ dashboard: {}, targets: [], projections: [], primarySales: [], secondarySales: [], expiryEntries: [], report: [] })
  const [filters, setFilters] = useState({
    financial_year: initialFinancialYear(),
    month: String(new Date().getMonth() + 1),
    product_id: 'all',
    user_id: 'all',
    division_id: 'all',
    state: 'all',
    hq_id: 'all'
  })
  const [forms, setForms] = useState({
    target: { financial_year: initialFinancialYear(), month: String(new Date().getMonth() + 1), target_strip: '', rate: '' },
    primary: { sale_date: today(), quantity_strip: '', rate: '' },
    expiry: { entry_date: today(), quantity_strip: '', rate: '' }
  })

  const options = useMemo(() => {
    const products = [emptyOption, ...meta.products.map((item) => ({ value: item.id, label: item.name || `Product ${item.id}` }))]
    const users = [emptyOption, ...meta.users.map((item) => ({ value: item.id, label: item.fullName || `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.email || `User ${item.id}` }))]
    const stockists = [emptyOption, ...meta.stockists.map((item) => ({ value: item.id, label: item.stockist_name || `Stockist ${item.id}` }))]
    const headquarters = [emptyOption, ...meta.headquarters.map((item) => ({ value: item.id, label: `${item.name || `HQ ${item.id}`}${item.code ? ` (${item.code})` : ''}` }))]
    const divisions = [emptyOption, ...meta.divisions.map((item) => ({ value: item.id, label: `${item.division_name || `Division ${item.id}`}${item.short_name ? ` (${item.short_name})` : ''}` }))]
    const states = [emptyOption, ...Array.from(new Set([...meta.headquarters.map((item) => item.state), ...meta.territories.map((item) => item.state)].filter(Boolean))).sort().map((state) => ({ value: state, label: state }))]
    return { products, users, stockists, headquarters, divisions, states, months: [emptyOption, ...months.map(([value, label]) => ({ value, label }))] }
  }, [meta])

  const loadMeta = async () => {
    const [users, products, stockists, headquarters, territories, divisions] = await Promise.all([
      adminAPI.getUsers().catch(() => []),
      adminAPI.getProducts().catch(() => []),
      adminAPI.getStockists().catch(() => []),
      adminAPI.getHeadquarters().catch(() => []),
      adminAPI.getTerritories().catch(() => []),
      adminAPI.getDivisions().catch(() => [])
    ])
    setMeta({
      users: asArray(users, 'users'),
      products: asArray(products, 'products'),
      stockists: asArray(stockists, 'stockists'),
      headquarters: asArray(headquarters, 'headquarters'),
      territories: asArray(territories, 'territories'),
      divisions: asArray(divisions, 'divisions')
    })
  }

  const queryParams = () => Object.fromEntries(Object.entries(filters).filter(([, value]) => value && value !== 'all'))

  const loadSalesData = async () => {
    const params = queryParams()
    const [dashboard, targets, projections, primarySales, secondarySales, expiryEntries, report] = await Promise.all([
      adminAPI.getSalesDashboard(params).catch(() => ({ summary: {} })),
      adminAPI.getSalesTargets(params).catch(() => ({ targets: [] })),
      adminAPI.getModuleProjections(params).catch(() => ({ projections: [] })),
      adminAPI.getPrimarySales(params).catch(() => ({ primarySales: [] })),
      adminAPI.getSecondarySales(params).catch(() => ({ secondarySales: [] })),
      adminAPI.getExpiryEntries(params).catch(() => ({ expiryEntries: [] })),
      adminAPI.getSalesModuleReport(params).catch(() => ({ report: [] }))
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
  }, [filters.financial_year, filters.month, filters.product_id, filters.user_id, filters.division_id, filters.state, filters.hq_id])

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }))
  const updateForm = (name, key, value) => setForms((prev) => ({ ...prev, [name]: { ...prev[name], [key]: value } }))
  const withValue = (payload, stripKey, valueKey) => ({ ...payload, [valueKey]: number(payload[valueKey]) || number(payload[stripKey]) * number(payload.rate) })

  const productName = (id) => meta.products.find((item) => String(item.id) === String(id))?.name || `Product ${id || '-'}`
  const stockistName = (id) => meta.stockists.find((item) => String(item.id) === String(id))?.stockist_name || `Stockist ${id || '-'}`
  const hqName = (id) => meta.headquarters.find((item) => String(item.id) === String(id))?.name || `HQ ${id || '-'}`
  const userName = (id) => {
    const user = meta.users.find((item) => String(item.id) === String(id))
    return user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || `User ${id || '-'}`
  }
  const rowPeriod = (row) => row.sale_date || row.entry_date || `${row.financial_year || ''} ${months.find(([value]) => Number(value) === Number(row.month))?.[1] || row.month || ''}`.trim()

  const saveEntry = async (type, event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    try {
      if (type === 'target') await adminAPI.createSalesTarget(withValue(forms.target, 'target_strip', 'target_value'))
      if (type === 'primary') await adminAPI.createPrimarySale(withValue(forms.primary, 'quantity_strip', 'total_value'))
      if (type === 'expiry') await adminAPI.createExpiryEntry(withValue(forms.expiry, 'quantity_strip', 'total_value'))
      setSuccess('Record saved successfully')
      setEntryOpen(null)
      await loadSalesData()
    } catch (err) {
      setError(err.message || 'Failed to save record')
    }
  }

  const toggleFreeze = async () => {
    setError('')
    setSuccess('')
    try {
      await adminAPI.setSalesMonthLock({
        financial_year: filters.financial_year,
        month: Number(filters.month),
        is_locked: !data.dashboard.is_locked
      })
      setSuccess(!data.dashboard.is_locked ? 'Sales month frozen' : 'Sales month unlocked')
      await loadSalesData()
    } catch (err) {
      setError(err.message || 'Failed to update month lock')
    }
  }

  const downloadCsv = (title, rows, columns) => {
    const csv = [
      columns.map((column) => csvEscape(column.label)).join(','),
      ...rows.map((row) => columns.map((column) => csvEscape(column.render(row))).join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const targetBulkFields = [
    { key: 'user_id', label: 'MR Name', type: 'select', options: options.users },
    { key: 'hq_id', label: 'HQ Name', type: 'select', options: options.headquarters },
    { key: 'financial_year', label: 'Financial Year', type: 'text', required: true },
    { key: 'month', label: 'Month', type: 'select', required: true, options: options.months },
    { key: 'product_id', label: 'Brand', type: 'select', required: true, options: options.products },
    { key: 'target_strip', label: 'TGT in Strip', type: 'number', required: true },
    { key: 'rate', label: 'Rate', type: 'number', required: true },
    { key: 'target_value', label: 'TGT in Value', type: 'number' }
  ]

  const selectField = (form, key, fieldOptions, required = false) => (
    <select value={forms[form][key] || ''} required={required} onChange={(event) => updateForm(form, key, event.target.value)}>
      {fieldOptions.map((option) => <option key={`${form}-${key}-${option.value}`} value={option.value}>{option.label}</option>)}
    </select>
  )

  const EntryTable = ({ title, rows, columns, search = '', compact = false }) => {
    const visibleRows = search ? rows.filter((row) => columns.some((column) => String(column.render(row)).toLowerCase().includes(search.toLowerCase()))) : rows
    return (
      <section className={`sales-table-card ${compact ? 'compact' : ''}`}>
        <div className="sales-table-toolbar">
          <h3>{title}</h3>
          <button type="button" className="btn btn-light" onClick={() => downloadCsv(title, visibleRows, columns)} disabled={!visibleRows.length}>Export CSV</button>
        </div>
        {visibleRows.length === 0 ? (
          <div className="sales-empty">No records found for the selected period and scope.</div>
        ) : (
          <div className="sales-table-scroll">
            <table className="table table-striped">
              <thead className="thead-dark"><tr>{columns.map((column) => <th key={column.label}>{column.label}</th>)}</tr></thead>
              <tbody>
                {visibleRows.slice(0, compact ? 6 : 30).map((row) => (
                  <tr key={`${title}-${row.id}`}>{columns.map((column) => <td key={`${row.id}-${column.label}`}>{column.render(row)}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    )
  }

  const modules = [
    { key: 'overview', title: 'Dashboard', owner: 'System View', note: 'Target, projection, actual achievement, and month lock.' },
    { key: 'targets', title: 'Target Entry', owner: 'Admin / ZBM', note: 'Bulk upload and assign targets. Value is calculated from strips and rate.' },
    { key: 'projection', title: 'Projection View', owner: 'Mobile / Base User', note: 'Entered by allocated field user. Admin views the roll-up only.' },
    { key: 'primary', title: 'Primary Sales', owner: 'Company / Stockist', note: 'Invoice and batch-wise company to stockist sale.' },
    { key: 'secondary', title: 'Secondary Sales', owner: 'MR / ABM Chain', note: 'Entered from field chain. Admin views submitted data only.' },
    { key: 'expiry', title: 'Expiry', owner: 'Stockist / Admin', note: 'Credit-note and expiry tracking by product and stockist.' },
    { key: 'reports', title: 'Reports', owner: 'Analysis', note: 'Product, HQ, employee, state, division, and time-wise reporting.' }
  ]

  const targetColumns = [
    { label: 'HQ', render: (row) => hqName(row.hq_id) },
    { label: 'MR', render: (row) => userName(row.user_id) },
    { label: 'Brand', render: (row) => productName(row.product_id) },
    { label: 'Period', render: rowPeriod },
    { label: 'Target Strip', render: (row) => row.target_strip },
    { label: 'Target Value', render: (row) => money(row.target_value) }
  ]
  const projectionColumns = [
    { label: 'HQ', render: (row) => hqName(row.hq_id) },
    { label: 'MR', render: (row) => userName(row.user_id) },
    { label: 'Brand', render: (row) => productName(row.product_id) },
    { label: 'Period', render: rowPeriod },
    { label: 'Projection Strip', render: (row) => row.projection_strip },
    { label: 'Projection Value', render: (row) => money(row.projection_value) }
  ]
  const primaryColumns = [
    { label: 'Stockist', render: (row) => stockistName(row.stockist_id) },
    { label: 'Invoice', render: (row) => row.invoice_no },
    { label: 'Product', render: (row) => productName(row.product_id) },
    { label: 'Batch', render: (row) => row.batch_number || '-' },
    { label: 'Qty', render: (row) => row.quantity_strip },
    { label: 'Value', render: (row) => money(row.total_value) }
  ]
  const secondaryColumns = [
    { label: 'HQ', render: (row) => hqName(row.hq_id) },
    { label: 'MR', render: (row) => userName(row.user_id) },
    { label: 'Stockist', render: (row) => stockistName(row.stockist_id) },
    { label: 'Product', render: (row) => productName(row.product_id) },
    { label: 'Sale', render: (row) => `${row.sale_strip} / ${money(row.sale_value)}` },
    { label: 'Closing', render: (row) => `${row.closing_strip} / ${money(row.closing_value)}` }
  ]
  const expiryColumns = [
    { label: 'Stockist', render: (row) => stockistName(row.stockist_id) },
    { label: 'Credit Note', render: (row) => row.credit_note_no },
    { label: 'Product', render: (row) => productName(row.product_id) },
    { label: 'Batch', render: (row) => row.batch_number || '-' },
    { label: 'Qty', render: (row) => row.quantity_strip },
    { label: 'Value', render: (row) => money(row.total_value) }
  ]
  const reportColumns = [
    { label: 'Product', render: (row) => row.product_name },
    { label: 'Target', render: (row) => money(row.target_value) },
    { label: 'Projection', render: (row) => money(row.projection_value) },
    { label: 'Secondary', render: (row) => money(row.achieved_value) },
    { label: 'Expiry', render: (row) => money(row.expiry_value) },
    { label: 'Achievement', render: (row) => `${row.achievementPercent}%` }
  ]

  if (loading) {
    return (
      <div className="section-content sales-clean">
        <h2>Sales Module</h2>
        <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i> Loading sales data...</div>
      </div>
    )
  }

  return (
    <div className="section-content sales-clean">
      <header className="sales-clean-header">
        <div>
          <span className="sales-kicker">Sales Entry Module</span>
          <h2>Sales Module</h2>
          <p>Manage target assignment, field roll-ups, sales tracking, expiry, reports, growth, and achievement without mixing mobile-owned entries into admin work.</p>
        </div>
        <div className="sales-header-actions">
          <button type="button" className={data.dashboard.is_locked ? 'btn btn-primary' : 'btn btn-light'} onClick={toggleFreeze}>{data.dashboard.is_locked ? 'Unlock Month' : 'Freeze Month'}</button>
          <button type="button" className="btn btn-light" onClick={loadAll}>Refresh</button>
        </div>
      </header>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <section className="sales-scope-panel">
        <label><span>Financial Year</span><input value={filters.financial_year} onChange={(event) => setFilter('financial_year', event.target.value)} /></label>
        <label><span>Month</span><select value={filters.month} onChange={(event) => setFilter('month', event.target.value)}>{months.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label><span>Product</span><select value={filters.product_id} onChange={(event) => setFilter('product_id', event.target.value)}><option value="all">All Products</option>{options.products.slice(1).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label><span>Employee</span><select value={filters.user_id} onChange={(event) => setFilter('user_id', event.target.value)}><option value="all">All Employees</option>{options.users.slice(1).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label><span>Division</span><select value={filters.division_id} onChange={(event) => setFilter('division_id', event.target.value)}><option value="all">All Divisions</option>{options.divisions.slice(1).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label><span>State</span><select value={filters.state} onChange={(event) => setFilter('state', event.target.value)}><option value="all">All States</option>{options.states.slice(1).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label><span>HQ / Region / Zone</span><select value={filters.hq_id} onChange={(event) => setFilter('hq_id', event.target.value)}><option value="all">All HQ</option>{options.headquarters.slice(1).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      </section>

      <section className="sales-module-grid">
        {modules.map((module) => (
          <button key={module.key} type="button" className={`sales-module-tile ${activeSection === module.key ? 'active' : ''}`} onClick={() => setActiveSection(module.key)}>
            <span>{module.owner}</span>
            <strong>{module.title}</strong>
            <small>{module.note}</small>
          </button>
        ))}
      </section>

      {activeSection === 'overview' && (
        <>
          <section className="sales-metrics">
            <div><span>Target</span><strong>{money(data.dashboard.target)}</strong></div>
            <div><span>Projection</span><strong>{money(data.dashboard.projection)}</strong></div>
            <div><span>Achieved</span><strong>{money(data.dashboard.achieved)}</strong></div>
            <div><span>Achievement</span><strong>{data.dashboard.achievementPercent || 0}%</strong></div>
            <div><span>Month Lock</span><strong>{data.dashboard.is_locked ? 'Locked' : 'Open'}</strong></div>
          </section>
          <section className="sales-process">
            <span>Target Set</span><span>Primary Sales</span><span>Field Projection</span><span>Secondary Sales</span><span>Reports</span><span>Achievement</span>
          </section>
          <div className="sales-two-column">
            <EntryTable title="Recent Field Projections" rows={data.projections} columns={projectionColumns} compact />
            <EntryTable title="Recent Secondary Sales" rows={data.secondarySales} columns={secondaryColumns} compact />
          </div>
        </>
      )}

      {activeSection === 'targets' && (
        <>
          <section className="sales-work-panel">
            <div className="sales-panel-intro">
              <h3>Target Entry</h3>
              <p>Use this admin area for target upload or a small correction entry. Do not enter projection or secondary sales here.</p>
            </div>
            <BulkUploadPanel
              title="Target Entry"
              fields={targetBulkFields}
              defaults={forms.target}
              createRecord={(payload) => adminAPI.createSalesTarget(withValue(payload, 'target_strip', 'target_value'))}
              onComplete={loadSalesData}
            />
            <button type="button" className="btn btn-light" onClick={() => setEntryOpen(entryOpen === 'target' ? null : 'target')}>Single Target Entry</button>
            {entryOpen === 'target' && (
              <form className="sales-compact-form" onSubmit={(event) => saveEntry('target', event)}>
                <label><span>MR</span>{selectField('target', 'user_id', options.users)}</label>
                <label><span>HQ</span>{selectField('target', 'hq_id', options.headquarters)}</label>
                <label><span>Financial Year</span><input value={forms.target.financial_year} onChange={(event) => updateForm('target', 'financial_year', event.target.value)} required /></label>
                <label><span>Month</span>{selectField('target', 'month', options.months, true)}</label>
                <label><span>Brand</span>{selectField('target', 'product_id', options.products, true)}</label>
                <label><span>TGT in Strip</span><input type="number" value={forms.target.target_strip} onChange={(event) => updateForm('target', 'target_strip', event.target.value)} required /></label>
                <label><span>Rate</span><input type="number" value={forms.target.rate} onChange={(event) => updateForm('target', 'rate', event.target.value)} required /></label>
                <label><span>TGT Value</span><input value={money(number(forms.target.target_strip) * number(forms.target.rate))} readOnly /></label>
                <div className="sales-form-actions"><button type="submit" className="btn btn-primary">Save Target</button></div>
              </form>
            )}
          </section>
          <EntryTable title="Target View" rows={data.targets} columns={targetColumns} />
        </>
      )}

      {activeSection === 'projection' && (
        <>
          <div className="sales-owner-note"><strong>View only.</strong> Projection is entered from the mobile/base user flow and rolls upward for HQ, state, zone, country, and division review.</div>
          <EntryTable title="Projection Planning View" rows={data.projections} columns={projectionColumns} />
        </>
      )}

      {activeSection === 'primary' && (
        <>
          <section className="sales-work-panel">
            <div className="sales-panel-intro">
              <h3>Primary Sales</h3>
              <p>Company to stockist invoice entry. Total value is calculated automatically.</p>
            </div>
            <button type="button" className="btn btn-light" onClick={() => setEntryOpen(entryOpen === 'primary' ? null : 'primary')}>{entryOpen === 'primary' ? 'Hide Entry' : 'Add Primary Sale'}</button>
            {entryOpen === 'primary' && (
              <form className="sales-compact-form" onSubmit={(event) => saveEntry('primary', event)}>
                <label><span>Stockist</span>{selectField('primary', 'stockist_id', options.stockists)}</label>
                <label><span>Invoice No</span><input value={forms.primary.invoice_no || ''} onChange={(event) => updateForm('primary', 'invoice_no', event.target.value)} required /></label>
                <label><span>Product</span>{selectField('primary', 'product_id', options.products, true)}</label>
                <label><span>Batch</span><input value={forms.primary.batch_number || ''} onChange={(event) => updateForm('primary', 'batch_number', event.target.value)} /></label>
                <label><span>Qty in Strip</span><input type="number" value={forms.primary.quantity_strip} onChange={(event) => updateForm('primary', 'quantity_strip', event.target.value)} required /></label>
                <label><span>Rate</span><input type="number" value={forms.primary.rate} onChange={(event) => updateForm('primary', 'rate', event.target.value)} required /></label>
                <label><span>Total Value</span><input value={money(number(forms.primary.quantity_strip) * number(forms.primary.rate))} readOnly /></label>
                <label><span>Sale Date</span><input type="date" value={forms.primary.sale_date} onChange={(event) => updateForm('primary', 'sale_date', event.target.value)} /></label>
                <div className="sales-form-actions"><button type="submit" className="btn btn-primary">Save Primary Sale</button></div>
              </form>
            )}
          </section>
          <EntryTable title="Primary Sales View" rows={data.primarySales} columns={primaryColumns} />
        </>
      )}

      {activeSection === 'secondary' && (
        <>
          <div className="sales-owner-note"><strong>Field-owned entry.</strong> Secondary sales is entered by MR/ABM or the next immediate level when the base user is absent. Admin portal displays submitted data only.</div>
          <EntryTable title="Secondary Sales View" rows={data.secondarySales} columns={secondaryColumns} />
        </>
      )}

      {activeSection === 'expiry' && (
        <>
          <section className="sales-work-panel">
            <div className="sales-panel-intro">
              <h3>Expiry Entry</h3>
              <p>Track credit-note expiry by stockist, product, batch, month, and value.</p>
            </div>
            <button type="button" className="btn btn-light" onClick={() => setEntryOpen(entryOpen === 'expiry' ? null : 'expiry')}>{entryOpen === 'expiry' ? 'Hide Entry' : 'Add Expiry'}</button>
            {entryOpen === 'expiry' && (
              <form className="sales-compact-form" onSubmit={(event) => saveEntry('expiry', event)}>
                <label><span>Stockist</span>{selectField('expiry', 'stockist_id', options.stockists)}</label>
                <label><span>Credit Note No</span><input value={forms.expiry.credit_note_no || ''} onChange={(event) => updateForm('expiry', 'credit_note_no', event.target.value)} required /></label>
                <label><span>Product</span>{selectField('expiry', 'product_id', options.products, true)}</label>
                <label><span>Batch</span><input value={forms.expiry.batch_number || ''} onChange={(event) => updateForm('expiry', 'batch_number', event.target.value)} /></label>
                <label><span>Qty in Strip</span><input type="number" value={forms.expiry.quantity_strip} onChange={(event) => updateForm('expiry', 'quantity_strip', event.target.value)} required /></label>
                <label><span>Rate</span><input type="number" value={forms.expiry.rate} onChange={(event) => updateForm('expiry', 'rate', event.target.value)} required /></label>
                <label><span>Total Value</span><input value={money(number(forms.expiry.quantity_strip) * number(forms.expiry.rate))} readOnly /></label>
                <label><span>Entry Date</span><input type="date" value={forms.expiry.entry_date} onChange={(event) => updateForm('expiry', 'entry_date', event.target.value)} /></label>
                <div className="sales-form-actions"><button type="submit" className="btn btn-primary">Save Expiry</button></div>
              </form>
            )}
          </section>
          <EntryTable title="Expiry View" rows={data.expiryEntries} columns={expiryColumns} />
        </>
      )}

      {activeSection === 'reports' && (
        <section className="sales-report-panel">
          <div className="sales-table-toolbar">
            <div>
              <h3>Sales Report</h3>
              <p>Use scope filters above. Each filter supports all-record analysis.</p>
            </div>
            <input type="search" placeholder="Search product" value={reportSearch} onChange={(event) => setReportSearch(event.target.value)} />
          </div>
          <EntryTable title="Target vs Projection vs Achievement" rows={data.report.filter((row) => row.product_name?.toLowerCase().includes(reportSearch.toLowerCase()))} columns={reportColumns} />
        </section>
      )}
    </div>
  )
}

export default SalesProjections
