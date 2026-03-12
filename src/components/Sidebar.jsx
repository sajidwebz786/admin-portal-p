import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/images/logo.png'

const Sidebar = ({ onLogout }) => {
  const location = useLocation()
  const [masterDataExpanded, setMasterDataExpanded] = useState(true)

  // Doctors Master sub-items
  const masterDataItems = [
    { id: 'doctor-class', label: 'Doctor Class', icon: 'fas fa-tags', path: '/doctor-class' },
    { id: 'doctor-category', label: 'Doctor Category', icon: 'fas fa-list-alt', path: '/doctor-category' },
    { id: 'doctor-specialty', label: 'Doctor Specialty', icon: 'fas fa-stethoscope', path: '/doctor-specialty' },
    { id: 'doctor-qualification', label: 'Doctor Qualification', icon: 'fas fa-graduation-cap', path: '/doctor-qualification' },
    { id: 'approvals', label: 'Approval Dashboard', icon: 'fas fa-tasks', path: '/approvals' }
  ]

  const isMasterDataActive = masterDataItems.some(item => location.pathname === item.path)

  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
      {/* Brand Logo */}
      <Link to="/dashboard" className="brand-link custom-brand">
        <img
          src={logo}
          alt="PAMSFORCE Logo"
          className="brand-image"
        />
      </Link>

      {/* Sidebar */}
      <div className="sidebar">
        {/* Sidebar Menu */}
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">
            
            {/* DASHBOARD - FIRST */}
            <li className="nav-item">
              <Link
                to="/dashboard"
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                <i className="fas fa-tachometer-alt nav-icon"></i>
                <p>Dashboard</p>
              </Link>
            </li>

            {/* DOCTORS MASTER - SECOND */}
            <li className="nav-item has-treeview menu-open">
              <Link
                to="#"
                className={`nav-link ${isMasterDataActive ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  setMasterDataExpanded(!masterDataExpanded)
                }}
              >
                <i className="nav-icon fas fa-user-md"></i>
                <p>
                  Doctors Master
                  <i className={`right fas fa-angle-left ${masterDataExpanded ? 'transform-rotate' : ''}`}></i>
                </p>
              </Link>
              {masterDataExpanded && (
                <ul className="nav nav-treeview">
                  {masterDataItems.map((item) => (
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
              )}
            </li>

            {/* REMAINING ITEMS */}
            <li className="nav-item">
              <Link
                to="/user-management"
                className={`nav-link ${location.pathname === '/user-management' ? 'active' : ''}`}
              >
                <i className="fas fa-users nav-icon"></i>
                <p>User Management</p>
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/doctors-chemists"
                className={`nav-link ${location.pathname === '/doctors-chemists' ? 'active' : ''}`}
              >
                <i className="fas fa-user-md nav-icon"></i>
                <p>Doctors/Chemists</p>
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/territory-management"
                className={`nav-link ${location.pathname === '/territory-management' ? 'active' : ''}`}
              >
                <i className="fas fa-map-marked-alt nav-icon"></i>
                <p>Territory Master</p>
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/product-management"
                className={`nav-link ${location.pathname === '/product-management' ? 'active' : ''}`}
              >
                <i className="fas fa-pills nav-icon"></i>
                <p>Product Master</p>
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/headquarter-management"
                className={`nav-link ${location.pathname === '/headquarter-management' ? 'active' : ''}`}
              >
                <i className="fas fa-building nav-icon"></i>
                <p>Headquarter Master</p>
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/sales-projections"
                className={`nav-link ${location.pathname === '/sales-projections' ? 'active' : ''}`}
              >
                <i className="fas fa-chart-line nav-icon"></i>
                <p>Sales & Projections</p>
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/activity-approvals"
                className={`nav-link ${location.pathname === '/activity-approvals' ? 'active' : ''}`}
              >
                <i className="fas fa-check-circle nav-icon"></i>
                <p>Activity Approvals</p>
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/rule-config"
                className={`nav-link ${location.pathname === '/rule-config' ? 'active' : ''}`}
              >
                <i className="fas fa-cogs nav-icon"></i>
                <p>Rule Configuration</p>
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/reports"
                className={`nav-link ${location.pathname === '/reports' ? 'active' : ''}`}
              >
                <i className="fas fa-file-alt nav-icon"></i>
                <p>Reports</p>
              </Link>
            </li>
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
