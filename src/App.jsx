import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import UserManagement from './components/UserManagement'
import DoctorChemistManagement from './components/DoctorChemistManagement'
import TerritoryManagement from './components/TerritoryManagement'
import ProductManagement from './components/ProductManagement'
import HeadquarterManagement from './components/HeadquarterManagement'
import SalesProjections from './components/SalesProjections'
import ActivityApprovals from './components/ActivityApprovals'
import RuleConfiguration from './components/RuleConfiguration'
import Reports from './components/Reports'
import Sidebar from './components/Sidebar'

// Doctor Master Data Components
import DoctorClassMaster from './components/DoctorClassMaster'
import DoctorCategoryMaster from './components/DoctorCategoryMaster'
import DoctorSpecialtyMaster from './components/DoctorSpecialtyMaster'
import DoctorQualificationMaster from './components/DoctorQualificationMaster'
import ApprovalDashboard from './components/ApprovalDashboard'

// Product Master Data Components
import DivisionMaster from './components/DivisionMaster'
import BrandGroupMaster from './components/BrandGroupMaster'
import ProductCategoryMaster from './components/ProductCategoryMaster'
import PackSizeMaster from './components/PackSizeMaster'
import StrengthMaster from './components/StrengthMaster'

import './App.css'

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('adminToken')
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
    navigate('/dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setIsAuthenticated(false)
    navigate('/')
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="admin-portal">
      <Sidebar onLogout={handleLogout} />

      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/doctors-chemists" element={<DoctorChemistManagement />} />
          <Route path="/territory-management" element={<TerritoryManagement />} />
          <Route path="/product-management" element={<ProductManagement />} />
          <Route path="/headquarter-management" element={<HeadquarterManagement />} />
          <Route path="/sales-projections" element={<SalesProjections />} />
          <Route path="/activity-approvals" element={<ActivityApprovals />} />
          <Route path="/rule-config" element={<RuleConfiguration />} />
          <Route path="/reports" element={<Reports />} />
          
          {/* Doctor Master Data Routes */}
          <Route path="/doctor-class" element={<DoctorClassMaster />} />
          <Route path="/doctor-category" element={<DoctorCategoryMaster />} />
          <Route path="/doctor-specialty" element={<DoctorSpecialtyMaster />} />
          <Route path="/doctor-qualification" element={<DoctorQualificationMaster />} />
          <Route path="/approvals" element={<ApprovalDashboard />} />
          
          {/* Product Master Data Routes */}
          <Route path="/division-master" element={<DivisionMaster />} />
          <Route path="/brand-group-master" element={<BrandGroupMaster />} />
          <Route path="/product-category-master" element={<ProductCategoryMaster />} />
          <Route path="/pack-size-master" element={<PackSizeMaster />} />
          <Route path="/strength-master" element={<StrengthMaster />} />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
