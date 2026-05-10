import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/images/logo.png'
import { canAccessScreen, getAllowedScreens, SCREENS, MENU_SECTIONS } from '../config/roleAccess'

const Sidebar = ({ onLogout, userRole, isOpen = false, onNavigate = () => {} }) => {
  const location = useLocation()
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [mastersExpanded, setMastersExpanded] = useState(true)
  const [doctorsExpanded, setDoctorsExpanded] = useState(true)
  const [productsExpanded, setProductsExpanded] = useState(true)
  const [territoryExpanded, setTerritoryExpanded] = useState(true)
  const [inputsExpanded, setInputsExpanded] = useState(true)
  const [policyExpanded, setPolicyExpanded] = useState(true)
  const [expenseExpanded, setExpenseExpanded] = useState(true)

  const allowedScreens = getAllowedScreens(userRole)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  // Filter helper - checks if ANY item in a section is accessible
  const filterAccessible = (items) => items.filter(item => allowedScreens.includes(item.path))
  const hasAnyAccess = (items) => items.some(item => allowedScreens.includes(item.path))

  // Filter each section
  const doctorsItems = filterAccessible(MENU_SECTIONS.doctors.items)
  const productsItems = filterAccessible(MENU_SECTIONS.products.items)
  const territoryItems = filterAccessible(MENU_SECTIONS.territory.items)
  const inputsItems = filterAccessible(MENU_SECTIONS.inputs.items)
  const policyItems = filterAccessible(MENU_SECTIONS.policy.items)
  const expenseItems = filterAccessible(MENU_SECTIONS.expense.items)
  const mastersItems = [
    { id: 'user-management', label: 'User Master', icon: 'fas fa-users', path: '/user-management' },
    { id: 'rule-config', label: 'Rule Configuration', icon: 'fas fa-cogs', path: '/rule-config' },
    { id: 'system-setup', label: 'System Setup', icon: 'fas fa-sliders-h', path: '/system-setup' }
  ]
  const visibleMastersItems = mastersItems.filter(item => allowedScreens.includes(item.path))

  // Main nav items
  const mainNavItems = [
    { id: 'addition-deletion-control', label: 'Addition / Deletion Control', icon: 'fas fa-shield-alt', path: '/addition-deletion-control' },
    { id: 'sales-projections', label: 'Sales Module', icon: 'fas fa-chart-line', path: '/sales-projections' },
    // { id: 'bulk-uploads', label: 'Bulk Uploads', icon: 'fas fa-file-excel', path: '/bulk-uploads' },
    { id: 'expense-management', label: 'Expense Management', icon: 'fas fa-receipt', path: '/expense-management' },
    // { id: 'doctors-chemists', label: 'Doctors/Chemists', icon: 'fas fa-user-md', path: '/doctors-chemists' },
    { id: 'activity-approvals', label: 'Activity Approvals', icon: 'fas fa-check-circle', path: '/activity-approvals' },
    { id: 'reports', label: 'Reports', icon: 'fas fa-file-alt', path: '/reports' }
  ]
  const visibleMainNav = mainNavItems.filter(item => allowedScreens.includes(item.path))

  // Check if any section item is active
  const isDoctorsActive = doctorsItems.some(item => location.pathname === item.path)
  const isProductsActive = productsItems.some(item => location.pathname === item.path)
  const isInputsActive = inputsItems.some(item => location.pathname === item.path)
  const isPolicyActive = policyItems.some(item => location.pathname === item.path)
  const isTerritoryActive = territoryItems.some(item => location.pathname === item.path)
  const isExpenseActive = expenseItems.some(item => location.pathname === item.path) || location.pathname === '/expense-management'
  const isMastersActive = visibleMastersItems.some(item => location.pathname === item.path)

  // Should Masters parent show?
  const showMasters = hasAnyAccess(MENU_SECTIONS.doctors.items) || hasAnyAccess(MENU_SECTIONS.products.items) || hasAnyAccess(MENU_SECTIONS.territory.items) || hasAnyAccess(MENU_SECTIONS.inputs.items) || hasAnyAccess(MENU_SECTIONS.policy.items) || hasAnyAccess(MENU_SECTIONS.expense.items) || visibleMastersItems.length > 0

  const renderSubItems = (items, isActive) => (
    <ul className="nav nav-treeview">
      {items.map((item) => (
        <li key={item.id} className="nav-item">
          <Link to={item.path} className={`nav-link ${location.pathname === item.path ? 'active' : ''}`} onClick={onNavigate}>
            <i className={`${item.icon} nav-icon`}></i>
            <p>{item.label}</p>
          </Link>
        </li>
      ))}
    </ul>
  )

  const renderSection = (label, icon, items, expanded, setExpanded, isActive) => {
    if (items.length === 0) return null
    return (
      <li className="nav-item has-treeview menu-open">
        <Link to="#" className={`nav-link ${isActive ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setExpanded(!expanded) }}>
          <i className={`nav-icon ${icon}`}></i>
          <p>{label}<i className={`right fas fa-angle-left ${expanded ? 'transform-rotate' : ''}`}></i></p>
        </Link>
        {expanded && renderSubItems(items, isActive)}
      </li>
    )
  }

  // Get display role
  const getDisplayRole = () => {
    const roleMap = { admin: 'Admin', Admin: 'Admin', HR: 'HR', NSM: 'NSM', RBM: 'Regional Manager', ABM: 'Area Manager', TBM: 'Territory Manager', 'Field Representative': 'Field Rep', 'Billing User': 'Billing', user: 'User', manager: 'Manager' }
    return roleMap[userRole] || userRole || 'User'
  }

  return (
    <aside className={`main-sidebar sidebar-dark-primary elevation-4 ${isOpen ? 'show' : ''}`}>
      <Link to="/dashboard" className="brand-link custom-brand" onClick={onNavigate}>
        <img src={logo} alt="PAMSFORCE Logo" className="brand-image" />
      </Link>

      <div className="sidebar">
        {/* Role Badge */}
        <div style={{ padding: '10px 15px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <span className="badge badge-info" style={{ fontSize: '0.85rem', padding: '5px 12px' }}>
            <i className="fas fa-user-shield"></i> {getDisplayRole()}
          </span>
        </div>

        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">

            {/* Dashboard - always visible */}
            <li className="nav-item">
              <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={onNavigate}>
                <i className="fas fa-tachometer-alt nav-icon"></i>
                <p>Dashboard</p>
              </Link>
            </li>

            {/* Masters - only if user has access to any sub-item */}
            {showMasters && (
              <li className="nav-item has-treeview menu-open">
                <Link to="#" className={`nav-link ${isDoctorsActive || isProductsActive || isTerritoryActive || isInputsActive || isPolicyActive || isExpenseActive || isMastersActive ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setMastersExpanded(!mastersExpanded) }}>
                  <i className="nav-icon fas fa-database"></i>
                  <p>Masters<i className={`right fas fa-angle-left ${mastersExpanded ? 'transform-rotate' : ''}`}></i></p>
                </Link>
                {mastersExpanded && (
                  <ul className="nav nav-treeview">
                    {renderSection('User & System', 'fas fa-cogs', visibleMastersItems, mastersExpanded, setMastersExpanded, isMastersActive)}
                    {renderSection('Territory', 'fas fa-map-marked-alt', territoryItems, territoryExpanded, setTerritoryExpanded, isTerritoryActive)}
                    {renderSection('Doctors', 'fas fa-user-md', doctorsItems, doctorsExpanded, setDoctorsExpanded, isDoctorsActive)}
                    {renderSection('Products', 'fas fa-pills', productsItems, productsExpanded, setProductsExpanded, isProductsActive)}
                    {renderSection('Inputs & Samples', 'fas fa-file-alt', inputsItems, inputsExpanded, setInputsExpanded, isInputsActive)}
                    {renderSection('Policy & Control', 'fas fa-shield-alt', policyItems, policyExpanded, setPolicyExpanded, isPolicyActive)}
                    {renderSection('Expense', 'fas fa-receipt', expenseItems, expenseExpanded, setExpenseExpanded, isExpenseActive)}
                  </ul>
                )}
              </li>
            )}

            {/* Main nav items - filtered by role */}
            {visibleMainNav.map((item) => (
              <li key={item.id} className="nav-item">
                <Link to={item.path} className={`nav-link ${location.pathname === item.path || (item.id === 'bulk-uploads' && location.pathname.startsWith('/addition/')) ? 'active' : ''}`} onClick={onNavigate}>
                  <i className={`${item.icon} nav-icon`}></i>
                  <p>{item.label}</p>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer mt-auto">
          <button className="btn btn-light btn-sm btn-block theme-toggle-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <i className={`fas fa-${theme === 'dark' ? 'sun' : 'moon'}`}></i> {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button className="btn btn-danger btn-sm btn-block" onClick={onLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
