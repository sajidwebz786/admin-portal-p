import fs from 'node:fs'
import assert from 'node:assert/strict'
const config = fs.readFileSync(new URL('../src/config/roleAccess.js',import.meta.url),'utf8')
const {SCREENS,MENU_SECTIONS,getAllowedScreens}=await import('data:text/javascript;base64,'+Buffer.from(config).toString('base64'))
const app=fs.readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8')
const routes=new Set([...app.matchAll(/<Route path="([^"]+)"/g)].map(m=>m[1]))
const items=Object.values(MENU_SECTIONS).flatMap(s=>s.items)
for(const item of items){assert.ok(routes.has(item.path),`Missing route for ${item.label}`);assert.ok(getAllowedScreens('admin').includes(item.path),`Admin cannot access ${item.label}`)}
for(const screen of ['HEADQUARTER','TERRITORY','GEOGRAPHY','PATCH','DOCTOR_MASTER','CHEMIST_MASTER','STOCKIST_MASTER','HOSPITAL_MASTER','SVL_MASTER','PRODUCT','INPUT_MASTER','SAMPLE_MASTER','INPUT_ALLOCATION','RATE_FIXATION','NOTICE_UPLOAD','SOP_MASTER'])assert.ok(items.some(item=>item.path===SCREENS[screen]),`Documented module missing in sidebar: ${screen}`)
assert.deepEqual(getAllowedScreens('National Manager'),getAllowedScreens('NSM'))
assert.deepEqual(getAllowedScreens('Regional Manager'),getAllowedScreens('RBM'))
assert.deepEqual(getAllowedScreens('Area Manager'),getAllowedScreens('ABM'))
assert.ok(!getAllowedScreens('user').includes(SCREENS.DIVISION))
assert.deepEqual(getAllowedScreens('unknown'),[SCREENS.DASHBOARD])
console.log(`PASS: ${items.length} section links have routes and admin access; documented HQ/territory/master modules are visible; designation aliases and restricted roles behave correctly.`)
