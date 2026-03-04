import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Sidebar = ({ onLogout }) => {
  const location = useLocation()

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt', path: '/dashboard' },
    { id: 'user-management', label: 'User Management', icon: 'fas fa-users', path: '/user-management' },
    { id: 'doctors-chemists', label: 'Doctors/Chemists', icon: 'fas fa-user-md', path: '/doctors-chemists' },
    { id: 'territory-management', label: 'Territory Master', icon: 'fas fa-map-marked-alt', path: '/territory-management' },
    { id: 'product-management', label: 'Product Master', icon: 'fas fa-pills', path: '/product-management' },
    { id: 'headquarter-management', label: 'Headquarter Master', icon: 'fas fa-building', path: '/headquarter-management' },
    { id: 'sales-projections', label: 'Sales & Projections', icon: 'fas fa-chart-line', path: '/sales-projections' },
    { id: 'activity-approvals', label: 'Activity Approvals', icon: 'fas fa-check-circle', path: '/activity-approvals' },
    { id: 'rule-config', label: 'Rule Configuration', icon: 'fas fa-cogs', path: '/rule-config' },
    { id: 'reports', label: 'Reports', icon: 'fas fa-file-alt', path: '/reports' }
  ]

  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
      {/* Brand Logo */}
 <Link to="/dashboard" className="brand-link custom-brand">
  <img
    src="/src/assets/images/logo.png"
    alt="PAMSFORCE Logo"
    className="brand-image"
  />
  {/* Optional: Add this if you want the name below the logo */}
  {/* <span>PAMSFORCE</span> */}
</Link>



      {/* Sidebar */}
      <div className="sidebar">
        {/* Sidebar Menu */}
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">
            {navigationItems.map((item) => (
              <li key={item.id} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <i className={`${item.icon} nav-icon`}></i>
                  <p>{item.label}</p>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer mt-auto">
          <button
            className="btn btn-danger btn-sm btn-block"
            onClick={onLogout}
          >
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar