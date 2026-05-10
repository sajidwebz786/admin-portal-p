import React, { useEffect, useMemo, useState } from 'react'
import adminAPI from '../services/apiService'
import BulkUploadPanel from './BulkUploadPanel'

const months = [
  ['1', 'January'], ['2', 'February'], ['3', 'March'], ['4', 'April'], ['5', 'May'], ['6', 'June'],
  ['7', 'July'], ['8', 'August'], ['9', 'September'], ['10', 'October'], ['11', 'November'], ['12', 'December']
]

const emptyOption = { value: '', label: 'Select' }
const asArray = (value, key) => Array.isArray(value) ? value : (Array.isArray(value?.[key]) ? value[key] : [])
const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value || 0))
const number = (value) => Number(value || 0)
const today = () => new Date().toISOString().slice(0, 10)
const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`

const initialFinancialYear = () => {
  const now = new Date()
  const year = now.getFullYear()
  return now.getMonth() + 1 >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`
}

const SalesProjections = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [reportSearch, setReportSearch] = useState('')
  const [meta, setMeta] = useState({ users: [], products: [], stockists: [], headquarters: [], territories: [], divisions: [] })
  const [data, setData] = useState({ targets: [], projections: [], primarySales: [], secondarySales: [], expiryEntries: [], report: [], dashboard: {} })
  const [filters, setFilters] = useState({ financial_year: initialFinancialYear(), month: String(new Date().getMonth() + 1), product_id: 'all', user_id: 'all', division_id: 'all', state: 'all', hq_id: 'all' })
  const [forms, setForms] = useState({
    target: { financial_year: initialFinancialYear(), month: '4', target_strip: '', rate: '' },
    projection: { financial_year: initialFinancialYear(), month: '4', projection_strip: '', rate: '' },
    primary: { sale_date: today(), quantity_strip: '', rate: '' },
    secondary: { financial_year: initialFinancialYear(), month: '4', opening_strip: '', sale_strip: '', rate: '' },
    expiry: { entry_date: today(), quantity_strip: '', rate: '' }
  })

  useEffect(() => {
    loadAll()
  }, [])

  const options = useMemo(() => {
    const products = [emptyOption, ...meta.products.map((item) => ({ value: item.id, label: item.name || `Product ${item.id}` }))]
    const users = [emptyOption, ...meta.users.map((item) => ({ value: item.id, label: item.fullName || `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.email || `User ${item.id}` }))]
    const stockists = [emptyOption, ...meta.stockists.map((item) => ({ value: item.id, label: item.stockist_name || `Stockist ${item.id}` }))]
    const headquarters = [emptyOption, ...meta.headquarters.map((item) => ({ value: item.id, label: `${item.name || `HQ ${item.id}`}${item.code ? ` (${item.code})` : ''}` }))]
    const territories = [emptyOption, ...meta.territories.map((item) => ({ value: item.id, label: `${item.name || `Patch ${item.id}`}${item.code ? ` (${item.code})` : ''}` }))]
    const divisions = [emptyOption, ...meta.divisions.map((item) => ({ value: item.id, label: `${item.division_name || `Division ${item.id}`}${item.short_name ? ` (${item.short_name})` : ''}` }))]
    const states = [emptyOption, ...Array.from(new Set([...meta.headquarters.map((item) => item.state), ...meta.territories.map((item) => item.state)].filter(Boolean))).sort().map((state) => ({ value: state, label: state }))]
    return { products, users, stockists, headquarters, territories, divisions, states, months: [emptyOption, ...months.map(([value, label]) => ({ value, label }))] }
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

  const loadSalesData = async () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value && value !== 'all'))
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
    if (!loading) loadSalesData()
  }, [filters.financial_year, filters.month, filters.product_id, filters.user_id, filters.division_id, filters.state, filters.hq_id])

  const productName = (id) => meta.products.find((item) => String(item.id) === String(id))?.name || `Product ${id || '-'}`
  const stockistName = (id) => meta.stockists.find((item) => String(item.id) === String(id))?.stockist_name || `Stockist ${id || '-'}`
  const userName = (id) => {
    const user = meta.users.find((item) => String(item.id) === String(id))
    return user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || `User ${id || '-'}`
  }
  const hqName = (id) => meta.headquarters.find((item) => String(item.id) === String(id))?.name || `HQ ${id || '-'}`

  const updateForm = (name, key, value) => setForms((prev) => ({ ...prev, [name]: { ...prev[name], [key]: value } }))
  const withAutoValue = (payload, stripKey, valueKey) => ({ ...payload, [valueKey]: number(payload[valueKey]) || number(payload[stripKey]) * number(payload.rate) })
  const resetNotice = () => {
    setError('')
    setSuccess('')
  }

  const submit = async (type, event) => {
    event.preventDefault()
    resetNotice()
    const payload = forms[type]
    try {
      if (type === 'target') await adminAPI.createSalesTarget(withAutoValue(payload, 'target_strip', 'target_value'))
      if (type === 'primary') await adminAPI.createPrimarySale(withAutoValue(payload, 'quantity_strip', 'total_value'))
      if (type === 'expiry') await adminAPI.createExpiryEntry(withAutoValue(payload, 'quantity_strip', 'total_value'))
      setSuccess('Sales entry saved successfully')
      await loadSalesData()
    } catch (err) {
      setError(err.message || 'Failed to save sales entry')
    }
  }

  const toggleFreeze = async () => {
    resetNotice()
    try {
      await adminAPI.setSalesMonthLock({
        financial_year: filters.financial_year,
        month: Number(filters.month),
        is_locked: !data.dashboard.is_locked
      })
      setSuccess(!data.dashboard.is_locked ? 'Sales month frozen' : 'Sales month unlocked')
      await loadSalesData()
    } catch (err) {
      setError(err.message || 'Failed to update sales freeze')
    }
  }

  const bulkFields = {
    target: [
      { key: 'user_id', label: 'MR Name', type: 'select', options: options.users },
      { key: 'hq_id', label: 'HQ Name', type: 'select', options: options.headquarters },
      { key: 'financial_year', label: 'Financial Year', type: 'text', required: true },
      { key: 'month', label: 'Month', type: 'select', required: true, options: options.months },
      { key: 'product_id', label: 'Brand', type: 'select', required: true, options: options.products },
      { key: 'target_strip', label: 'TGT in Strip', type: 'number', required: true },
      { key: 'rate', label: 'Rate', type: 'number', required: true },
      { key: 'target_value', label: 'TGT in Value', type: 'number' }
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
    expiry: [
      { key: 'stockist_id', label: 'Stockist Name', type: 'select', options: options.stockists },
      { key: 'credit_note_no', label: 'Credit Note No', type: 'text', required: true },
      { key: 'product_id', label: 'Product Name', type: 'select', required: true, options: options.products },
      { key: 'batch_number', label: 'Batch Number', type: 'text' },
      { key: 'quantity_strip', label: 'Quantity in Strip', type: 'number', required: true },
      { key: 'rate', label: 'Rate', type: 'number', required: true },
      { key: 'total_value', label: 'Total Value', type: 'number' },
      { key: 'entry_date', label: 'Entry Date', type: 'date' }
    ]
  }

  const renderSelect = (formName, key, fieldOptions, required = false) => (
    <select value={forms[formName][key] || ''} required={required} onChange={(event) => updateForm(formName, key, event.target.value)}>
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
          if (type === 'primary') return adminAPI.createPrimarySale(withAutoValue(payload, 'quantity_strip', 'total_value'))
          return adminAPI.createExpiryEntry(withAutoValue(payload, 'quantity_strip', 'total_value'))
        }}
        onComplete={loadSalesData}
      />
      <form className="sales-module-form" onSubmit={(event) => submit(type, event)}>
        {children}
        <div className="master-admin-actions">
          <button type="submit" className="btn btn-primary">Save {title}</button>
        </div>
      </form>
    </div>
  )

  const rowDate = (row) => row.sale_date || row.entry_date || `${row.financial_year || ''} / ${months.find(([value]) => Number(value) === Number(row.month))?.[1] || row.month || '-'}`

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

  const EntryTable = ({ title, rows, columns }) => (
    <div className="projections-table">
      <div className="table-toolbar">
        <h3>{title}</h3>
        <button type="button" className="btn btn-light" onClick={() => downloadCsv(title, rows, columns)} disabled={!rows.length}>Export CSV</button>
      </div>
      {rows.length === 0 ? (
        <div className="alert alert-info">No records found for the selected criteria.</div>
      ) : (
        <table className="table table-striped">
          <thead className="thead-dark"><tr>{columns.map((column) => <th key={column.label}>{column.label}</th>)}</tr></thead>
          <tbody>
            {rows.slice(0, 25).map((row) => (
              <tr key={`${title}-${row.id}`}>{columns.map((column) => <td key={`${row.id}-${column.label}`}>{column.render(row)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )

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
          <h2>Sales Module</h2>
          <p>Manage targets, projection planning, primary sales, secondary sales, expiry, reports, growth, and achievement tracking.</p>
        </div>
        <div className="operation-header-actions">
          <button type="button" className={data.dashboard.is_locked ? 'btn btn-danger' : 'btn btn-light'} onClick={toggleFreeze}>
            {data.dashboard.is_locked ? 'Unlock Month' : 'Freeze Month'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={loadAll}>Refresh</button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="sales-filter-bar">
        <label><span>Financial Year</span><input value={filters.financial_year} onChange={(event) => setFilters({ ...filters, financial_year: event.target.value })} /></label>
        <label><span>Month</span><select value={filters.month} onChange={(event) => setFilters({ ...filters, month: event.target.value })}>{months.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label><span>Product</span><select value={filters.product_id} onChange={(event) => setFilters({ ...filters, product_id: event.target.value })}><option value="all">All Products</option>{options.products.slice(1).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label><span>Employee</span><select value={filters.user_id} onChange={(event) => setFilters({ ...filters, user_id: event.target.value })}><option value="all">All Employees</option>{options.users.slice(1).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label><span>Division</span><select value={filters.division_id} onChange={(event) => setFilters({ ...filters, division_id: event.target.value })}><option value="all">All Divisions</option>{options.divisions.slice(1).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label><span>State</span><select value={filters.state} onChange={(event) => setFilters({ ...filters, state: event.target.value })}><option value="all">All States</option>{options.states.slice(1).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label><span>HQ / Region / Zone</span><select value={filters.hq_id} onChange={(event) => setFilters({ ...filters, hq_id: event.target.value })}><option value="all">All HQ</option>{options.headquarters.slice(1).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      </div>

      <div className="sales-tabs">
        {[
          ['dashboard', 'Dashboard'], ['target', 'Target Entry'], ['projection', 'Projection Planning'], ['primary', 'Primary Sales'],
          ['secondary', 'Secondary Sales'], ['expiry', 'Expiry'], ['reports', 'Reports'], ['growth', 'Growth & Achievement']
        ].map(([key, label]) => <button type="button" key={key} className={activeTab === key ? 'active' : ''} onClick={() => setActiveTab(key)}>{label}</button>)}
      </div>

      {activeTab === 'dashboard' && (
        <>
          <div className="sales-summary">
            <div className="summary-card"><h3>Target</h3><p className="summary-value">{money(data.dashboard.target)}</p><p className="summary-change positive">{data.dashboard.monthName}</p></div>
            <div className="summary-card"><h3>Projection</h3><p className="summary-value">{money(data.dashboard.projection)}</p><p className="summary-change positive">Expected sales</p></div>
            <div className="summary-card"><h3>Achieved</h3><p className="summary-value">{money(data.dashboard.achieved)}</p><p className="summary-change positive">{data.dashboard.achievementPercent || 0}% achievement</p></div>
            <div className="summary-card"><h3>Primary Sale</h3><p className="summary-value">{money(data.dashboard.primary_sale)}</p><p className="summary-change positive">Company to stockist</p></div>
            <div className="summary-card"><h3>Sales Freeze</h3><p className="summary-value">{data.dashboard.is_locked ? 'Locked' : 'Open'}</p><p className="summary-change positive">Month lock</p></div>
          </div>
          <div className="sales-flow">Target Set <span>→</span> Primary Sales <span>→</span> Secondary Sales <span>→</span> Reports <span>→</span> Achievement <span>→</span> Incentive</div>
        </>
      )}

      {activeTab === 'target' && (
        <>
          <SalesForm type="target" title="Target Entry">
            <label><span>MR Name</span>{renderSelect('target', 'user_id', options.users)}</label>
            <label><span>HQ Name</span>{renderSelect('target', 'hq_id', options.headquarters)}</label>
            <label><span>Financial Year</span><input value={forms.target.financial_year} onChange={(e) => updateForm('target', 'financial_year', e.target.value)} required /></label>
            <label><span>Month</span>{renderSelect('target', 'month', options.months, true)}</label>
            <label><span>Brand</span>{renderSelect('target', 'product_id', options.products, true)}</label>
            <label><span>TGT in Strip</span><input type="number" value={forms.target.target_strip} onChange={(e) => updateForm('target', 'target_strip', e.target.value)} required /></label>
            <label><span>Rate</span><input type="number" value={forms.target.rate} onChange={(e) => updateForm('target', 'rate', e.target.value)} required /></label>
            <label><span>TGT in Value</span><input value={money(number(forms.target.target_strip) * number(forms.target.rate))} readOnly /></label>
          </SalesForm>
          <EntryTable title="Target View" rows={data.targets} columns={[
            { label: 'HQ', render: (row) => hqName(row.hq_id) },
            { label: 'MR', render: (row) => userName(row.user_id) },
            { label: 'Brand', render: (row) => productName(row.product_id) },
            { label: 'Month', render: rowDate },
            { label: 'TGT Strip', render: (row) => row.target_strip },
            { label: 'TGT Value', render: (row) => money(row.target_value) }
          ]} />
        </>
      )}

      {activeTab === 'projection' && (
        <>
          <div className="sales-owner-note">
            <strong>View only.</strong> Projection is entered by the base/allocated field user from the mobile flow and rolls up here for HQ, state, zone, and division review.
          </div>
          <EntryTable title="Projection Planning View" rows={data.projections} columns={[
            { label: 'HQ', render: (row) => hqName(row.hq_id) },
            { label: 'MR', render: (row) => userName(row.user_id) },
            { label: 'Brand', render: (row) => productName(row.product_id) },
            { label: 'Month', render: rowDate },
            { label: 'Projection Strip', render: (row) => row.projection_strip },
            { label: 'Projection Value', render: (row) => money(row.projection_value) }
          ]} />
        </>
      )}

      {activeTab === 'primary' && (
        <>
          <SalesForm type="primary" title="Primary Sales">
            <label><span>Stockist Name</span>{renderSelect('primary', 'stockist_id', options.stockists)}</label>
            <label><span>Invoice No</span><input value={forms.primary.invoice_no || ''} onChange={(e) => updateForm('primary', 'invoice_no', e.target.value)} required /></label>
            <label><span>Product Name</span>{renderSelect('primary', 'product_id', options.products, true)}</label>
            <label><span>Batch Number</span><input value={forms.primary.batch_number || ''} onChange={(e) => updateForm('primary', 'batch_number', e.target.value)} /></label>
            <label><span>Quantity in Strip</span><input type="number" value={forms.primary.quantity_strip} onChange={(e) => updateForm('primary', 'quantity_strip', e.target.value)} required /></label>
            <label><span>Rate</span><input type="number" value={forms.primary.rate} onChange={(e) => updateForm('primary', 'rate', e.target.value)} required /></label>
            <label><span>Total Value</span><input value={money(number(forms.primary.quantity_strip) * number(forms.primary.rate))} readOnly /></label>
            <label><span>Sale Date</span><input type="date" value={forms.primary.sale_date} onChange={(e) => updateForm('primary', 'sale_date', e.target.value)} /></label>
          </SalesForm>
          <EntryTable title="Primary Sales View" rows={data.primarySales} columns={[
            { label: 'Stockist', render: (row) => stockistName(row.stockist_id) },
            { label: 'Invoice', render: (row) => row.invoice_no },
            { label: 'Product', render: (row) => productName(row.product_id) },
            { label: 'Batch', render: (row) => row.batch_number || '-' },
            { label: 'Qty Strip', render: (row) => row.quantity_strip },
            { label: 'Total', render: (row) => money(row.total_value) }
          ]} />
        </>
      )}

      {activeTab === 'secondary' && (
        <>
          <div className="sales-owner-note">
            <strong>Field-owned entry.</strong> Secondary Sales is entered by MR/ABM, or the next immediate level when the base user is absent. Admin portal displays the submitted chain data.
          </div>
          <EntryTable title="Secondary Sales View" rows={data.secondarySales} columns={[
            { label: 'HQ', render: (row) => hqName(row.hq_id) },
            { label: 'MR', render: (row) => userName(row.user_id) },
            { label: 'Stockist', render: (row) => stockistName(row.stockist_id) },
            { label: 'Product', render: (row) => productName(row.product_id) },
            { label: 'Opening', render: (row) => `${row.opening_strip} / ${money(row.opening_value)}` },
            { label: 'Sale', render: (row) => `${row.sale_strip} / ${money(row.sale_value)}` },
            { label: 'Closing', render: (row) => `${row.closing_strip} / ${money(row.closing_value)}` }
          ]} />
        </>
      )}

      {activeTab === 'expiry' && (
        <>
          <SalesForm type="expiry" title="Expiry Entry">
            <label><span>Stockist Name</span>{renderSelect('expiry', 'stockist_id', options.stockists)}</label>
            <label><span>Credit Note No</span><input value={forms.expiry.credit_note_no || ''} onChange={(e) => updateForm('expiry', 'credit_note_no', e.target.value)} required /></label>
            <label><span>Product Name</span>{renderSelect('expiry', 'product_id', options.products, true)}</label>
            <label><span>Batch Number</span><input value={forms.expiry.batch_number || ''} onChange={(e) => updateForm('expiry', 'batch_number', e.target.value)} /></label>
            <label><span>Quantity in Strip</span><input type="number" value={forms.expiry.quantity_strip} onChange={(e) => updateForm('expiry', 'quantity_strip', e.target.value)} required /></label>
            <label><span>Rate</span><input type="number" value={forms.expiry.rate} onChange={(e) => updateForm('expiry', 'rate', e.target.value)} required /></label>
            <label><span>Total Value</span><input value={money(number(forms.expiry.quantity_strip) * number(forms.expiry.rate))} readOnly /></label>
            <label><span>Entry Date</span><input type="date" value={forms.expiry.entry_date} onChange={(e) => updateForm('expiry', 'entry_date', e.target.value)} /></label>
          </SalesForm>
          <EntryTable title="Expiry View" rows={data.expiryEntries} columns={[
            { label: 'Stockist', render: (row) => stockistName(row.stockist_id) },
            { label: 'Credit Note', render: (row) => row.credit_note_no },
            { label: 'Product', render: (row) => productName(row.product_id) },
            { label: 'Batch', render: (row) => row.batch_number || '-' },
            { label: 'Qty Strip', render: (row) => row.quantity_strip },
            { label: 'Total', render: (row) => money(row.total_value) }
          ]} />
        </>
      )}

      {activeTab === 'reports' && (
        <div className="projections-table">
          <div className="table-toolbar">
            <h3>Sales Report</h3>
            <div className="table-actions">
              <input type="search" placeholder="Search product" value={reportSearch} onChange={(event) => setReportSearch(event.target.value)} />
              <button type="button" className="btn btn-light" onClick={() => downloadCsv('Sales Report', data.report, [
                { label: 'Product', render: (row) => row.product_name },
                { label: 'Target', render: (row) => row.target_value },
                { label: 'Projection', render: (row) => row.projection_value },
                { label: 'Secondary', render: (row) => row.achieved_value },
                { label: 'Expiry', render: (row) => row.expiry_value },
                { label: 'Achievement', render: (row) => `${row.achievementPercent}%` }
              ])} disabled={!data.report.length}>Export CSV</button>
            </div>
          </div>
          <table className="table table-striped">
            <thead className="thead-dark"><tr><th>Product</th><th>Target</th><th>Projection</th><th>Secondary</th><th>Expiry</th><th>Achievement</th></tr></thead>
            <tbody>{data.report.filter((row) => row.product_name?.toLowerCase().includes(reportSearch.toLowerCase())).map((row) => <tr key={row.product_id}><td>{row.product_name}</td><td>{money(row.target_value)}</td><td>{money(row.projection_value)}</td><td>{money(row.achieved_value)}</td><td>{money(row.expiry_value)}</td><td>{row.achievementPercent}%</td></tr>)}</tbody>
          </table>
        </div>
      )}

      {activeTab === 'growth' && (
        <div className="projections-table">
          <h3>Growth & Achievement View</h3>
          <table className="table table-striped">
            <thead className="thead-dark"><tr><th>Type</th><th>Date/Month</th><th>Product</th><th>Employee/Stockist</th><th>Value</th></tr></thead>
            <tbody>
              {data.targets.slice(0, 8).map((row) => <tr key={`t-${row.id}`}><td>Target</td><td>{rowDate(row)}</td><td>{productName(row.product_id)}</td><td>{userName(row.user_id)}</td><td>{money(row.target_value)}</td></tr>)}
              {data.projections.slice(0, 8).map((row) => <tr key={`p-${row.id}`}><td>Projection</td><td>{rowDate(row)}</td><td>{productName(row.product_id)}</td><td>{userName(row.user_id)}</td><td>{money(row.projection_value)}</td></tr>)}
              {data.secondarySales.slice(0, 8).map((row) => <tr key={`s-${row.id}`}><td>Achievement</td><td>{rowDate(row)}</td><td>{productName(row.product_id)}</td><td>{hqName(row.hq_id)}</td><td>{money(row.sale_value)}</td></tr>)}
              {data.primarySales.slice(0, 8).map((row) => <tr key={`pr-${row.id}`}><td>Primary</td><td>{rowDate(row)}</td><td>{productName(row.product_id)}</td><td>{stockistName(row.stockist_id)}</td><td>{money(row.total_value)}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default SalesProjections
