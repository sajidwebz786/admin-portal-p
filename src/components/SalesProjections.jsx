import React, { useState, useEffect } from 'react'
import adminAPI from '../services/apiService'

const SalesProjections = () => {
  const [sales, setSales] = useState([])
  const [projections, setProjections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const salesResponse = await adminAPI.getSales()
      const projectionsResponse = await adminAPI.getProjections()

      // Handle different response formats
      const salesData = salesResponse.sales || salesResponse || []
      const projectionsData = projectionsResponse.projections || projectionsResponse || []

      setSales(salesData)
      setProjections(projectionsData)
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load sales and projections data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  // Group sales by month for display
  const getMonthlySalesData = () => {
    const monthlyData = {}

    sales.forEach(sale => {
      const monthKey = `${sale.date.substring(0, 7)}` // YYYY-MM format
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          actual: 0,
          projection: 0 // We'll use actual sales as projection for demo
        }
      }
      monthlyData[monthKey].actual += parseFloat(sale.totalAmount)
    })

    return Object.values(monthlyData).slice(0, 6) // Last 6 months
  }

  // Group projections by month for display
  const getMonthlyProjectionsData = () => {
    const monthlyData = {}

    projections.forEach(proj => {
      const monthKey = `${proj.year}-${proj.month.toString().padStart(2, '0')}`
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          actual: parseFloat(proj.actualAmount || 0),
          projection: parseFloat(proj.projectedAmount)
        }
      } else {
        monthlyData[monthKey].actual += parseFloat(proj.actualAmount || 0)
        monthlyData[monthKey].projection += parseFloat(proj.projectedAmount)
      }
    })

    return Object.values(monthlyData).slice(0, 6) // Last 6 months
  }

  if (loading) {
    return (
      <div className="section-content" style={{ paddingTop: '10px' }}>
        <h2 style={{ marginBottom: '10px' }}>Sales & Projections</h2>
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i> Loading sales data...
        </div>
      </div>
    )
  }

  return (
    <div className="section-content">
      <h2 style={{ marginBottom: '-140px' }}>Sales & Projections</h2>
      
      {error && (
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      )}

      <div className="chart-container" style={{ marginTop: '0px' }}>
        <canvas id="salesChart"></canvas>
      </div>
      
      <div className="sales-summary" style={{ marginTop: '5px' }}>
        <div className="summary-card">
          <h3>Total Sales</h3>
          <p className="summary-value">
            {formatCurrency(sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount || 0), 0))}
          </p>
          <p className="summary-change positive">All time sales</p>
        </div>
        <div className="summary-card">
          <h3>Total Projections</h3>
          <p className="summary-value">
            {formatCurrency(projections.reduce((sum, proj) => sum + parseFloat(proj.projectedAmount || 0), 0))}
          </p>
          <p className="summary-change positive">Target amount</p>
        </div>
        <div className="summary-card">
          <h3>Active Products</h3>
          <p className="summary-value">
            {new Set([...sales.map(s => s.productName), ...projections.map(p => p.productName)]).size}
          </p>
          <p className="summary-change positive">Unique products</p>
        </div>
      </div>
      
      <div className="projections-table" style={{ marginTop: '10px' }}>
        <h3>Recent Sales & Projections</h3>
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Sales Amount</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {getMonthlySalesData().map((sale, index) => (
              <tr key={index}>
                <td>{sale.month}</td>
                <td>Sales</td>
                <td>{formatCurrency(sale.actual)}</td>
                <td><span className="badge badge-success">Actual</span></td>
              </tr>
            ))}
            {getMonthlyProjectionsData().map((proj, index) => (
              <tr key={`proj-${index}`}>
                <td>{proj.month}</td>
                <td>Projection</td>
                <td>{formatCurrency(proj.projection)}</td>
                <td><span className="badge badge-warning">Target</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SalesProjections