import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/images/logo.png'

const Sidebar = ({ onLogout }) => {
  const location = useLocation()
  const [mastersExpanded, setMastersExpanded] = useState(true)
  const [doctorsExpanded, setDoctorsExpanded] = useState(true)
  const [productsExpanded, setProductsExpanded] = useState(true)
  const [territoryExpanded, setTerritoryExpanded] = useState(true)
  const [inputsExpanded, setInputsExpanded] = useState(true)

  // Doctors sub-items under Masters > Doctors
  const doctorsItems = [
    { id: 'doctor-class', label: 'Doctor Class', icon: 'fas fa-tags', path: '/doctor-class' },
    { id: 'doctor-category', label: 'Doctor Category', icon: 'fas fa-list-alt', path: '/doctor-category' },
    { id: 'doctor-specialty', label: 'Doctor Specialty', icon: 'fas fa-stethoscope', path: '/doctor-specialty' },
    { id: 'doctor-qualification', label: 'Doctor Qualification', icon: 'fas fa-graduation-cap', path: '/doctor-qualification' },
    { id: 'approvals', label: 'Approval Dashboard', icon: 'fas fa-tasks', path: '/approvals' }
  ]

  // Products sub-items under Masters > Products
  const productsItems = [
    { id: 'division', label: 'Division', icon: 'fas fa-building', path: '/division-master' },
    { id: 'brand-group', label: 'Brand Group', icon: 'fas fa-layer-group', path: '/brand-group-master' },
    { id: 'product-category', label: 'Category', icon: 'fas fa-tags', path: '/product-category-master' },
    { id: 'pack-size', label: 'Pack Size', icon: 'fas fa-box', path: '/pack-size-master' },
    { id: 'strength', label: 'Strength', icon: 'fas fa-flask', path: '/strength-master' },
    { id: 'product', label: 'Product', icon: 'fas fa-pills', path: '/product-management' }
  ]

  // Territory sub-items under Masters > Territory
  const territoryItems = [
    { id: 'headquarter', label: 'HQ Master', icon: 'fas fa-building', path: '/headquarter-management' },
    { id: 'territory', label: 'Patch/Route', icon: 'fas fa-map-marked-alt', path: '/territory-management' }
  ]

  // Inputs & Samples sub-items under Masters
  const inputsItems = [
    { id: 'input-type', label: 'Input Type', icon: 'fas fa-tags', path: '/input-type-master' },
    { id: 'input-class', label: 'Input Class', icon: 'fas fa-layer-group', path: '/input-class-master' },
    { id: 'input-master', label: 'Input Master', icon: 'fas fa-file-alt', path: '/input-master' },
    { id: 'sample-master', label: 'Sample Master', icon: 'fas fa-prescription-bottle', path: '/sample-master' }
  ]

  // Check if any doctor item is active
  const isDoctorsActive = doctorsItems.some(item => location.pathname === item.path)
  
  // Check if any product item is active
  const isProductsActive = productsItems.some(item => location.pathname === item.path)
  
  // Check if any inputs item is active
  const isInputsActive = inputsItems.some(item => location.pathname === item.path)
  
  // Check if any territory item is active
  const isTerritoryActive = territoryItems.some(item => location.pathname === item.path)

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

            {/* MASTERS - SECOND - Parent with Doctors, Products and Territory sub-menu */}
            <li className="nav-item has-treeview menu-open">
              <Link
                to="#"
                className={`nav-link ${isDoctorsActive || isProductsActive || isTerritoryActive || isInputsActive ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  setMastersExpanded(!mastersExpanded)
                }}
              >
                <i className="nav-icon fas fa-database"></i>
                <p>
                  Masters
                  <i className={`right fas fa-angle-left ${mastersExpanded ? 'transform-rotate' : ''}`}></i>
                </p>
              </Link>
              {mastersExpanded && (
                <ul className="nav nav-treeview">
                  {/* Territory Sub-menu - HQ and Patch/Route */}
                  <li className="nav-item has-treeview menu-open">
                    <Link
                      to="#"
                      className={`nav-link ${isTerritoryActive ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault()
                        setTerritoryExpanded(!territoryExpanded)
                      }}
                    >
                      <i className="nav-icon fas fa-map-marked-alt"></i>
                      <p>
                        Territory
                        <i className={`right fas fa-angle-left ${territoryExpanded ? 'transform-rotate' : ''}`}></i>
                      </p>
                    </Link>
                    {territoryExpanded && (
                      <ul className="nav nav-treeview">
                        {territoryItems.map((item) => (
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
                  
                  {/* Doctors Sub-menu */}
                  <li className="nav-item has-treeview menu-open">
                    <Link
                      to="#"
                      className={`nav-link ${isDoctorsActive ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault()
                        setDoctorsExpanded(!doctorsExpanded)
                      }}
                    >
                      <i className="nav-icon fas fa-user-md"></i>
                      <p>
                        Doctors
                        <i className={`right fas fa-angle-left ${doctorsExpanded ? 'transform-rotate' : ''}`}></i>
                      </p>
                    </Link>
                    {doctorsExpanded && (
                      <ul className="nav nav-treeview">
                        {doctorsItems.map((item) => (
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
                  
                  {/* Products Sub-menu */}
                  <li className="nav-item has-treeview menu-open">
                    <Link
                      to="#"
                      className={`nav-link ${isProductsActive ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault()
                        setProductsExpanded(!productsExpanded)
                      }}
                    >
                      <i className="nav-icon fas fa-pills"></i>
                      <p>
                        Products
                        <i className={`right fas fa-angle-left ${productsExpanded ? 'transform-rotate' : ''}`}></i>
                      </p>
                    </Link>
                    {productsExpanded && (
                      <ul className="nav nav-treeview">
                        {productsItems.map((item) => (
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
                  
                  {/* Inputs & Samples Sub-menu */}
                  <li className="nav-item has-treeview menu-open">
                    <Link
                      to="#"
                      className={`nav-link ${isInputsActive ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault()
                        setInputsExpanded(!inputsExpanded)
                      }}
                    >
                      <i className="nav-icon fas fa-file-alt"></i>
                      <p>
                        Inputs & Samples
                        <i className={`right fas fa-angle-left ${inputsExpanded ? 'transform-rotate' : ''}`}></i>
                      </p>
                    </Link>
                    {inputsExpanded && (
                      <ul className="nav nav-treeview">
                        {inputsItems.map((item) => (
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
