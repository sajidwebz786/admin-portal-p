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

      let salesData = []
      let projectionsData = []

      try {
        const salesResponse = await adminAPI.getSales()
        salesData = salesResponse?.sales || salesResponse || []
      } catch (e) {
        console.error('Sales API error:', e)
      }

      try {
        const projectionsResponse = await adminAPI.getProjections()
        projectionsData = projectionsResponse?.projections || projectionsResponse || []
      } catch (e) {
        console.error('Projections API error:', e)
      }

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

  const getMonthlySalesData = () => {
    const monthlyData = {}

    sales.forEach(sale => {
      if (!sale?.date) return
      const monthKey = sale.date.substring(0, 7)
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          actual: 0,
          projection: 0
        }
      }
      monthlyData[monthKey].actual += parseFloat(sale.totalAmount || 0)
    })

    return Object.values(monthlyData).sort((a, b) => b.month.localeCompare(a.month)).slice(0, 6)
  }

  const getMonthlyProjectionsData = () => {
    const monthlyData = {}

    projections.forEach(proj => {
      if (!proj?.year || !proj?.month) return
      const monthKey = `${proj.year}-${proj.month.toString().padStart(2, '0')}`
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          actual: parseFloat(proj.actualAmount || 0),
          projection: parseFloat(proj.projectedAmount || 0)
        }
      } else {
        monthlyData[monthKey].actual += parseFloat(proj.actualAmount || 0)
        monthlyData[monthKey].projection += parseFloat(proj.projectedAmount || 0)
      }
    })

    return Object.values(monthlyData).sort((a, b) => b.month.localeCompare(a.month)).slice(0, 6)
  }

  if (loading) {
    return (
      <div className="section-content">
        <h2>Sales & Projections</h2>
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i> Loading sales data...
        </div>
      </div>
    )
  }

  const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale?.totalAmount || 0), 0)
  const totalProjections = projections.reduce((sum, proj) => sum + parseFloat(proj?.projectedAmount || 0), 0)
  const uniqueProducts = new Set([
    ...sales.map(s => s?.productName).filter(Boolean),
    ...projections.map(p => p?.productName).filter(Boolean)
  ]).size

  const monthlySales = getMonthlySalesData()
  const monthlyProjections = getMonthlyProjectionsData()

  return (
    <div className="section-content">
      <h2>Sales & Projections</h2>
      
      {error && (
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      )}

      <div className="sales-summary">
        <div className="summary-card">
          <h3>Total Sales</h3>
          <p className="summary-value">{formatCurrency(totalSales)}</p>
          <p className="summary-change positive">All time sales</p>
        </div>
        <div className="summary-card">
          <h3>Total Projections</h3>
          <p className="summary-value">{formatCurrency(totalProjections)}</p>
          <p className="summary-change positive">Target amount</p>
        </div>
        <div className="summary-card">
          <h3>Active Products</h3>
          <p className="summary-value">{uniqueProducts}</p>
          <p className="summary-change positive">Unique products</p>
        </div>
      </div>
      
      <div className="projections-table">
        <h3>Recent Sales & Projections</h3>
        {monthlySales.length === 0 && monthlyProjections.length === 0 ? (
          <div className="alert alert-info">No sales or projection data available.</div>
        ) : (
          <table className="table table-striped">
            <thead className="thead-dark">
              <tr>
                <th>Month</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {monthlySales.map((sale, index) => (
                <tr key={`sale-${index}`}>
                  <td>{sale.month}</td>
                  <td>Sales</td>
                  <td>{formatCurrency(sale.actual)}</td>
                  <td><span className="badge badge-success">Actual</span></td>
                </tr>
              ))}
              {monthlyProjections.map((proj, index) => (
                <tr key={`proj-${index}`}>
                  <td>{proj.month}</td>
                  <td>Projection</td>
                  <td>{formatCurrency(proj.projection)}</td>
                  <td><span className="badge badge-warning">Target</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default SalesProjections