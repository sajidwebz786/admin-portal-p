import React, { useState } from 'react'
import adminAPI from '../services/apiService'

const Reports = () => {
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    reportType: 'activity',
    startDate: '',
    endDate: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleGenerateReport = async () => {
    if (!formData.startDate || !formData.endDate) {
      setError('Please select both start and end dates')
      return
    }

    try {
      setLoading(true)
      setError('')

      let reportData
      switch (formData.reportType) {
        case 'activity':
          reportData = await adminAPI.getReports('activity', formData.startDate, formData.endDate)
          break
        case 'sales':
          reportData = await adminAPI.getSalesReport(formData.startDate, formData.endDate)
          break
        case 'projection':
          reportData = await adminAPI.getReports('projection', formData.startDate, formData.endDate)
          break
        case 'performance':
          reportData = await adminAPI.getReports('performance', formData.startDate, formData.endDate)
          break
        default:
          reportData = await adminAPI.getReports(formData.reportType, formData.startDate, formData.endDate)
      }

      setReportData(reportData)
    } catch (error) {
      console.error('Error generating report:', error)
      setError('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = (format) => {
    console.log(`Exporting report as ${format}:`, reportData)
    alert(`Report exported as ${format.toUpperCase()} successfully!`)
  }

  return (
    <div className="section-content">
      <h2>Reports</h2>
      
      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      )}

      <div className="report-filters">
        <select
          id="reportType"
          name="reportType"
          value={formData.reportType}
          onChange={handleInputChange}
        >
          <option value="activity">Activity Reports</option>
          <option value="sales">Sales Reports</option>
          <option value="projection">Projection Reports</option>
          <option value="performance">Performance Reports</option>
        </select>
        <input
          type="date"
          id="startDate"
          name="startDate"
          value={formData.startDate}
          onChange={handleInputChange}
        />
        <input
          type="date"
          id="endDate"
          name="endDate"
          value={formData.endDate}
          onChange={handleInputChange}
        />
        <button 
          className="btn btn-warning"
          onClick={handleGenerateReport}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
      
      <div className="report-preview">
        {reportData ? (
          <>
            <h3>
              {formData.reportType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Report - 
              {formData.startDate} to {formData.endDate}
            </h3>
            
            <div className="report-summary">
              <div className="summary-item">
                <h4>Total Records</h4>
                <p>{reportData.summary?.totalVisits || reportData.summary?.totalSales || reportData.summary?.totalActivities || 'N/A'}</p>
              </div>
              <div className="summary-item">
                <h4>Summary</h4>
                <p>
                  {reportData.summary?.totalDays ? `${reportData.summary.totalDays} days` : 
                   reportData.summary?.averageTransactionValue ? `Avg: ₹${reportData.summary.averageTransactionValue}` : 
                   reportData.summary?.completionRate ? `${reportData.summary.completionRate}% completion` : 'N/A'}
                </p>
              </div>
              <div className="summary-item">
                <h4>Period</h4>
                <p>{formData.startDate} to {formData.endDate}</p>
              </div>
            </div>

            <div className="report-actions">
              <button className="btn btn-danger" onClick={() => handleExport('pdf')}>
                Export to PDF
              </button>
              <button className="btn btn-primary" onClick={() => handleExport('excel')}>
                Export to Excel
              </button>
              <button className="btn btn-info" onClick={() => handleExport('csv')}>
                Export to CSV
              </button>
            </div>
          </>
        ) : (
          <div className="text-center text-muted">
            <i className="fas fa-file-alt fa-3x mb-3"></i>
            <p>Select report parameters and click "Generate Report" to view results</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports