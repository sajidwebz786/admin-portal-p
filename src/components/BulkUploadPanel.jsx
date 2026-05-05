import React, { useMemo, useRef, useState } from 'react'

const normalize = (value) => String(value ?? '').trim()
const keyify = (value) => normalize(value).toLowerCase().replace(/[^a-z0-9]+/g, '')
const emptyOptionValue = (value) => value === '' || value === null || value === undefined

const readCellValue = (row, field) => {
  const aliases = [field.key, field.label, ...(field.aliases || [])]
  const directKey = Object.keys(row).find((key) => aliases.some((alias) => keyify(alias) === keyify(key)))
  return directKey ? row[directKey] : ''
}

const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value
  const lowered = normalize(value).toLowerCase()
  if (['true', 'yes', 'y', '1', 'active'].includes(lowered)) return true
  if (['false', 'no', 'n', '0', 'inactive'].includes(lowered)) return false
  return value
}

const parseCsv = (text) => {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]
    if (char === '"' && quoted && next === '"') {
      cell += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      row.push(cell)
      cell = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }
  row.push(cell)
  rows.push(row)
  return rows.filter((items) => items.some((item) => normalize(item) !== ''))
}

const rowsToObjects = (rows) => {
  const [headers = [], ...dataRows] = rows
  return dataRows.map((row) => Object.fromEntries(headers.map((header, index) => [normalize(header), row[index] ?? ''])))
}

const parseValue = (rawValue, field) => {
  if (rawValue === undefined || rawValue === null || rawValue === '') return ''
  if (field.type === 'number') return Number(rawValue)
  if (field.type === 'boolean') return parseBoolean(rawValue)
  if (field.type === 'date') {
    if (rawValue instanceof Date) return rawValue.toISOString().slice(0, 10)
  }
  return normalize(rawValue)
}

const resolveSelectValue = (value, field) => {
  const parsed = normalize(value)
  if (!field.options || parsed === '') return parsed
  const match = field.options.find((option) => {
    if (emptyOptionValue(option.value)) return false
    return keyify(option.value) === keyify(parsed) || keyify(option.label) === keyify(parsed)
  })
  return match ? match.value : parsed
}

const BulkUploadPanel = ({ title, fields, createRecord, onComplete, defaults = {}, transformRow }) => {
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const inputRef = useRef(null)

  const importFields = useMemo(() => fields.filter((field) => field.import !== false), [fields])

  const buildPayload = (row, index) => {
    const payload = { ...defaults }
    const missing = []

    importFields.forEach((field) => {
      const rawValue = readCellValue(row, field)
      let value = parseValue(rawValue, field)
      if (field.type === 'select') value = resolveSelectValue(value, field)
      if (field.required && emptyOptionValue(value)) missing.push(field.label)
      payload[field.key] = emptyOptionValue(value) ? null : value
    })

    if (missing.length) {
      throw new Error(`Row ${index + 2}: Missing required field(s): ${missing.join(', ')}`)
    }

    return transformRow ? transformRow(payload, row) : payload
  }

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setBusy(true)
    setResult(null)

    try {
      let rows = []
      if (file.name.toLowerCase().endsWith('.csv')) {
        rows = rowsToObjects(parseCsv(await file.text()))
      } else {
        const readXlsxFile = (await import('read-excel-file/browser')).default
        const excelRows = await readXlsxFile(file)
        rows = rowsToObjects(excelRows)
      }

      if (!rows.length) {
        setResult({ success: 0, failed: 0, errors: ['The selected file has no data rows.'] })
        return
      }

      const errors = []
      let success = 0

      for (let index = 0; index < rows.length; index += 1) {
        try {
          await createRecord(buildPayload(rows[index], index))
          success += 1
        } catch (error) {
          errors.push(error.message || `Row ${index + 2}: Failed to import`)
        }
      }

      setResult({ success, failed: errors.length, errors })
      if (success) await onComplete?.()
    } catch (error) {
      setResult({ success: 0, failed: 1, errors: [error.message || 'Failed to read the selected file.'] })
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const downloadTemplate = () => {
    const headers = importFields.map((field) => field.label)
    const helperRow = importFields.map((field) => {
      const example = field.options?.find((option) => !emptyOptionValue(option.value))?.label || ''
      return `"${String(example).replace(/"/g, '""')}"`
    })
    const csv = `${headers.map((header) => `"${header.replace(/"/g, '""')}"`).join(',')}\n${helperRow.join(',')}\n`
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}_bulk_template.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bulk-upload-panel">
      <div>
        <h3>Bulk Upload</h3>
        <p>Upload .xlsx or CSV rows for {title}. Use dropdown labels or IDs for mapped fields.</p>
      </div>
      <div className="bulk-upload-actions">
        <button type="button" className="btn btn-light" onClick={downloadTemplate} disabled={busy}>
          Download Template
        </button>
        <label className={`btn btn-secondary ${busy ? 'disabled' : ''}`}>
          {busy ? 'Uploading...' : 'Upload Excel'}
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFile}
            disabled={busy}
            hidden
          />
        </label>
      </div>
      {result && (
        <div className={`bulk-upload-result ${result.failed ? 'has-errors' : 'success'}`}>
          <strong>{result.success} imported, {result.failed} failed.</strong>
          {result.errors.length > 0 && (
            <ul>
              {result.errors.slice(0, 8).map((error, index) => <li key={`${error}-${index}`}>{error}</li>)}
              {result.errors.length > 8 && <li>{result.errors.length - 8} more row error(s).</li>}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default BulkUploadPanel
