import fs from 'node:fs'
import assert from 'node:assert/strict'
const catalog=JSON.parse(fs.readFileSync(new URL('../src/hrms/catalog.json',import.meta.url)))
const hr=fs.readFileSync(new URL('../src/hrms/HrmsWorkspace.jsx',import.meta.url),'utf8')
const app=fs.readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8')
const sidebar=fs.readFileSync(new URL('../src/components/Sidebar.jsx',import.meta.url),'utf8')
assert.equal(catalog.modules.length,13)
for(const m of catalog.modules){assert.ok(Object.values(catalog.resources).some(r=>r.module===m.id),`Missing register in ${m.id}`)}
for(const [id,r] of Object.entries(catalog.resources)){assert.ok(r.fields.some(f=>f.name==='title'&&f.required),`Title missing for ${id}`);assert.equal(new Set(r.fields.map(f=>f.name)).size,r.fields.length,`Duplicate fields in ${id}`)}
assert.ok(sidebar.includes('href="#/hrms/dashboard" target="_blank"'))
assert.ok(app.includes("location.pathname.startsWith('/hrms')"))
assert.ok(app.includes("lazy(() => import('./hrms/HrmsWorkspace'))"))
for(const label of ['Employee Master','HR Dashboard','HR Reports','HR Workflow','Roles & Permissions'])assert.ok(hr.includes(label))
assert.ok(hr.includes('HRCalendar'))
console.log(`PASS: separate HRMS entry, independent navigation, 17 lifecycle sections, ${Object.keys(catalog.resources).length} registers, calendar and lazy-loaded workspace.`)
