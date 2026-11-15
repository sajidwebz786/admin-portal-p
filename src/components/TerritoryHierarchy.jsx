import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import adminAPI from '../services/apiService'

const list = (data, key) => Array.isArray(data) ? data : data?.[key] || []
const canonical = value => String(value || '').trim()
export default function TerritoryHierarchy() {
  const [headquarters, setHeadquarters] = useState([])
  const [territories, setTerritories] = useState([])
  const [filters, setFilters] = useState({ zone: '', state: '', region: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const load = async () => {
    setError(''); setLoading(true)
    try {
      const [hq, routes] = await Promise.all([adminAPI.getHeadquarters(), adminAPI.getTerritories()])
      setHeadquarters(list(hq, 'headquarters')); setTerritories(list(routes, 'territories'))
    } catch (err) { setError(err.message || 'Unable to load territory hierarchy.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const options = key => [...new Set(headquarters.map(hq => canonical(hq[key])).filter(Boolean))].sort()
  const visible = headquarters.filter(hq => Object.entries(filters).every(([key, value]) => !value || canonical(hq[key]) === value))
  const mapped = new Set(headquarters.map(hq => hq.id))
  const unassigned = territories.filter(t => !mapped.has(t.hq_id))
  return <div className="section-content">
    <header className="operation-mode-header"><div><h2>Territory Hierarchy</h2><p>Zone → State / Union Territory → Region → Headquarters → Territory / Route</p></div><button className="btn btn-secondary" onClick={load} disabled={loading}>Refresh</button></header>
    {error && <div className="alert alert-danger" role="alert">{error}</div>}
    <div className="sales-scope-panel">
      {['zone','state','region'].map(key => <label key={key}><span>{key === 'state' ? 'State / Union Territory' : key[0].toUpperCase()+key.slice(1)}</span><select value={filters[key]} onChange={e => setFilters({...filters,[key]:e.target.value})}><option value="">All</option>{options(key).map(value => <option key={value}>{value}</option>)}</select></label>)}
      <div className="hierarchy-actions"><Link className="btn btn-primary" to="/headquarter-management">Manage Headquarters</Link><Link className="btn btn-secondary" to="/territory-management">Manage Territories</Link></div>
    </div>
    {loading ? <p className="loading-spinner">Loading territory hierarchy…</p> : <>
      <div className="sales-metrics"><div><span>Headquarters</span><strong>{headquarters.length}</strong></div><div><span>Territories / Routes</span><strong>{territories.length}</strong></div><div><span>States / UTs</span><strong>{options('state').length}</strong></div><div><span>Zones</span><strong>{options('zone').length}</strong></div></div>
      <div className="table-responsive"><table className="table"><thead><tr><th>Zone</th><th>State / UT</th><th>Region</th><th>Headquarters</th><th>Territories / Routes</th><th>Status</th></tr></thead><tbody>{visible.map(hq => <tr key={hq.id}><td>{hq.zone || '—'}</td><td>{hq.state}{hq.stateType === 'Union Territory' ? ' (UT)' : ''}</td><td>{hq.region || '—'}</td><td>{hq.name}<small className="d-block text-muted">{hq.code}</small></td><td>{territories.filter(t => t.hq_id === hq.id).map(t => <div key={t.id}>{t.name} <small className="text-muted">({t.code})</small></div>)}</td><td><span className={`badge ${hq.isActive ? 'badge-success' : 'badge-danger'}`}>{hq.isActive ? 'Active' : 'Inactive'}</span></td></tr>)}{!visible.length && <tr><td colSpan="6">No headquarters match these filters.</td></tr>}</tbody></table></div>
      {unassigned.length > 0 && <div className="alert alert-warning">{unassigned.length} territories have no matching headquarters. Assign them in Territory Management.</div>}
    </>}
  </div>
}
