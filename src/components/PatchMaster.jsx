import React, { useEffect, useState } from 'react'
import adminAPI from '../services/apiService'

const list = (data, key) => Array.isArray(data) ? data : data?.[key] || []
const empty = { patch_name: '', state: '', hq_id: '', pincode: '' }
export default function PatchMaster() {
  const [patches, setPatches] = useState([])
  const [headquarters, setHeadquarters] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [mapping, setMapping] = useState({ patch: '', hq: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const load = async () => {
    setLoading(true)
    try {
    const [p, h] = await Promise.all([adminAPI.getPatches(), adminAPI.getHeadquarters()])
    setPatches(list(p,'patches')); setHeadquarters(list(h,'headquarters'))
    } finally { setLoading(false) }
  }
  useEffect(() => { load().catch(err => setError(err.message || 'Unable to load patches.')) }, [])
  const run = async (action, message) => {
    setError(''); setSuccess(''); setBusy(true)
    try { await action(); await load(); setSuccess(message) }
    catch (err) { setError(err.message || 'Unable to update patch details.') }
    finally { setBusy(false) }
  }
  const submit = e => {
    e.preventDefault()
    run(async () => {
      const payload = {...form, hq_id: form.hq_id ? Number(form.hq_id) : null, pincode: form.pincode || null}
      if(editing) await adminAPI.updatePatch(editing, payload)
      else await adminAPI.createPatch(payload)
      setEditing(null); setForm(empty)
    }, editing ? 'Patch updated.' : 'Patch created.')
  }
  const activeHeadquarters = headquarters.filter(hq => hq.isActive)
  const hqOptions = activeHeadquarters.map(hq => <option key={hq.id} value={hq.id}>{hq.name} ({hq.code})</option>)
  return <div className="section-content">
    <header className="operation-mode-header"><div><h2>Patch / HQ Mapping</h2><p>Maintain patches and assign a patch to one or more headquarters.</p></div><button className="btn btn-secondary" disabled={busy || loading} onClick={() => run(async()=>{},'Patch list refreshed.')}>Refresh</button></header>
    {error && <div className="alert alert-danger" role="alert">{error}</div>}{success && <div className="alert alert-success" role="status">{success}</div>}
    <form className="master-admin-form" onSubmit={submit}>
      <label>Patch Name<input required value={form.patch_name} onChange={e => setForm({...form,patch_name:e.target.value})} /></label>
      <label>State / Union Territory<input required value={form.state} onChange={e => setForm({...form,state:e.target.value})} /></label>
      <label>Primary HQ<select value={form.hq_id} onChange={e => {const hq=headquarters.find(h=>h.id===Number(e.target.value));setForm({...form,hq_id:e.target.value,state:hq?.state || form.state})}}><option value="">Not assigned</option>{hqOptions}</select></label>
      <label>Pincode<input inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={form.pincode} onChange={e => setForm({...form,pincode:e.target.value})} /></label>
      <div className="master-admin-actions"><button className="btn btn-primary" disabled={busy || loading}>{editing ? 'Save Changes' : 'Add Patch'}</button>{editing && <button type="button" className="btn btn-secondary" onClick={() => {setEditing(null);setForm(empty)}}>Cancel</button>}</div>
    </form>
    <form className="sales-scope-panel" onSubmit={e => {e.preventDefault();run(() => adminAPI.mapPatchToHeadquarter(mapping.patch,{hq_id:Number(mapping.hq)}),'HQ assigned to patch.')}}>
      <label>Patch<select required value={mapping.patch} onChange={e=>setMapping({...mapping,patch:e.target.value})}><option value="">Select patch</option>{patches.filter(p=>p.isActive).map(p=><option key={p.id} value={p.id}>{p.patch_name}</option>)}</select></label>
      <label>Additional HQ<select required value={mapping.hq} onChange={e=>setMapping({...mapping,hq:e.target.value})}><option value="">Select headquarters</option>{hqOptions}</select></label>
      <div className="hierarchy-actions"><button className="btn btn-primary" disabled={busy || loading}>Assign HQ</button></div>
    </form>
    <div className="table-responsive"><table className="table"><thead><tr><th>Patch</th><th>State / UT</th><th>Primary HQ</th><th>Mapped Headquarters</th><th>Status</th><th>Actions</th></tr></thead><tbody>{!loading && patches.map(p=><tr key={p.id}><td>{p.patch_name}</td><td>{p.state}</td><td>{headquarters.find(h=>h.id===p.hq_id)?.name || '—'}</td><td>{p.mappedHeadquarters?.filter(h=>h.PatchHeadquarter?.isActive !== false).map(h=><div className="hierarchy-actions" key={h.id}><span>{h.name}</span><button className="btn btn-sm btn-secondary" disabled={busy || loading} onClick={()=>{if(window.confirm(`Remove ${h.name} from ${p.patch_name}?`))run(()=>adminAPI.unmapPatchFromHeadquarter(p.id,h.id),'HQ mapping removed.')}}>Remove</button></div>)}</td><td><span className={`badge ${p.isActive?'badge-success':'badge-danger'}`}>{p.isActive?'Active':'Inactive'}</span></td><td><div className="hierarchy-actions"><button className="btn btn-sm btn-secondary" disabled={busy || loading} onClick={()=>{setEditing(p.id);setForm({patch_name:p.patch_name,state:p.state,hq_id:p.hq_id || '',pincode:p.pincode || ''})}}>Edit</button>{p.isActive && <button className="btn btn-sm btn-danger" disabled={busy || loading} onClick={()=>{if(window.confirm(`Deactivate ${p.patch_name}?`))run(()=>adminAPI.deletePatch(p.id),'Patch deactivated.')}}>Deactivate</button>}</div></td></tr>)}{loading ? <tr><td colSpan="6">Loading patches?</td></tr> : !patches.length && <tr><td colSpan="6">No patches found.</td></tr>}</tbody></table></div>
  </div>
}
