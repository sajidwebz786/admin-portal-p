import React, { useState, useEffect } from 'react'
import adminAPI from '../services/apiService'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    monthlySales: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    loadDashboardData()

    // Check for saved dark mode preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark')
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      // Load dashboard statistics
      const statsData = await adminAPI.getDashboardStats()
      setStats(statsData)

      // Load recent activity
      const activityData = await adminAPI.getRecentActivity()
      setRecentActivity(activityData || [])

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      if (error.response?.status === 403) {
        setError('Admin access required. Please contact administrator.')
      } else {
        setError('Failed to load dashboard data. Please ensure you are logged in.')
      }

      // Set empty data - no fallback
      setStats({
        totalUsers: 0,
        pendingApprovals: 0,
        monthlySales: 0
      })
      setRecentActivity([])
    } finally {
      setLoading(false)
    }
  }

  const toggleDarkMode = () => {
    const newTheme = darkMode ? 'light' : 'dark'
    setDarkMode(!darkMode)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <button className="dark-mode-toggle" onClick={toggleDarkMode}>
            <i className={`fas fa-${darkMode ? 'sun' : 'moon'}`}></i>
          </button>
        </div>
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i> Loading dashboard data...
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button className="dark-mode-toggle" onClick={toggleDarkMode}>
          <i className={`fas fa-${darkMode ? 'sun' : 'moon'}`}></i>
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      {error && (
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle"></i> {error}
          <button
            className="btn btn-sm btn-outline-warning ml-2"
            onClick={loadDashboardData}
          >
            <i className="fas fa-refresh"></i> Retry
          </button>
        </div>
      )}

      <div className="dashboard-stats">
        <div className="stat-card users-card">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.totalUsers}</p>
            <span className="stat-change positive">
              <i className="fas fa-arrow-up"></i> +5.2%
            </span>
          </div>
        </div>

        <div className="stat-card approvals-card">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>Pending Approvals</h3>
            <p className="stat-value">{stats.pendingApprovals}</p>
            <span className="stat-change negative">
              <i className="fas fa-arrow-down"></i> -2.1%
            </span>
          </div>
        </div>

        <div className="stat-card sales-card">
          <div className="stat-icon">
            <i className="fas fa-rupee-sign"></i>
          </div>
          <div className="stat-content">
            <h3>Monthly Sales</h3>
            <p className="stat-value">{formatCurrency(stats.monthlySales)}</p>
            <span className="stat-change positive">
              <i className="fas fa-arrow-up"></i> +12.5%
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-activity-card">
          <div className="card-header-custom">
            <h3><i className="fas fa-activity"></i> Recent Activity</h3>
            <button className="btn btn-sm btn-outline-primary">
              <i className="fas fa-sync"></i> Refresh
            </button>
          </div>
          <div className="activity-list">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    <i className="fas fa-user-circle"></i>
                  </div>
                  <div className="activity-content">
                    <p><strong>{activity.user}</strong> {activity.action}</p>
                    <span className="activity-time">
                      <i className="fas fa-clock"></i> {activity.time}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="activity-item">
                <p><i className="fas fa-info-circle"></i> No recent activity to display</p>
              </div>
            )}
          </div>
        </div>

        <div className="quick-actions-card">
          <div className="card-header-custom">
            <h3><i className="fas fa-check-circle"></i> Approval Status</h3>
          </div>
          <div className="approval-status">
            <div className="status-item">
              <div className="status-label">
                <i className="fas fa-clock"></i> Pending
              </div>
              <div className="status-value warning">{stats.pendingApprovals}</div>
            </div>
            <div className="status-item">
              <div className="status-label">
                <i className="fas fa-check"></i> Approved Today
              </div>
              <div className="status-value success">15</div>
            </div>
            <div className="status-item">
              <div className="status-label">
                <i className="fas fa-times"></i> Rejected Today
              </div>
              <div className="status-value danger">3</div>
            </div>
            <div className="status-item">
              <div className="status-label">
                <i className="fas fa-users"></i> Active Users
              </div>
              <div className="status-value">{stats.totalUsers}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard