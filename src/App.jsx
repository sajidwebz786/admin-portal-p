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
import { canAccessScreen } from './config/roleAccess'

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

// Input & Sample Master Data Components
import InputTypeMaster from './components/InputTypeMaster'
import InputClassMaster from './components/InputClassMaster'
import InputMaster from './components/InputMaster'
import SampleMaster from './components/SampleMaster'

// Expense Master Data Components
import ExpenseTypeMaster from './components/ExpenseTypeMaster'
import TravelModeMaster from './components/TravelModeMaster'
import StandardFareChartMaster from './components/StandardFareChartMaster'
import ExpenseManagement from './components/ExpenseManagement'

// System Setup Components
import SystemSetup from './components/SystemSetup'
import AdditionDeletionControl from './components/AdditionDeletionControl'
import GenericMasterScreen from './components/GenericMasterScreen'

import './App.css'

// Get user role from localStorage
const getUserRole = () => {
  try {
    const userStr = localStorage.getItem('adminUser')
    if (userStr) {
      const user = JSON.parse(userStr)
      return user.role || user.employeeType || 'user'
    }
  } catch (e) {}
  return 'user'
}

// Protected Route component that checks role access
function ProtectedRoute({ path, element }) {
  const role = getUserRole()
  if (!canAccessScreen(role, path)) {
    return <Navigate to="/dashboard" replace />
  }
  return element
}

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState('user')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      setIsAuthenticated(true)
      setUserRole(getUserRole())
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (isAuthenticated && window.location.pathname === '/') {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleLogin = () => {
    setIsAuthenticated(true)
    setUserRole(getUserRole())
    navigate('/dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setIsAuthenticated(false)
    setUserRole('user')
    navigate('/')
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="admin-portal">
      <Sidebar onLogout={handleLogout} userRole={userRole} />

      <main className="main-content">
        <Routes>
          {/* Dashboard - always accessible */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Protected routes with role-based access */}
          <Route path="/user-management" element={<ProtectedRoute path="/user-management" element={<UserManagement />} />} />
          <Route path="/doctors-chemists" element={<ProtectedRoute path="/doctors-chemists" element={<DoctorChemistManagement />} />} />
          <Route path="/doctor-master" element={<Navigate to="/addition/doctor-master" replace />} />
          <Route path="/chemist-master" element={<Navigate to="/addition/chemist-master" replace />} />
          <Route path="/addition/doctor-master" element={<ProtectedRoute path="/doctor-master" element={<GenericMasterScreen masterKey="doctors" mode="addition" />} />} />
          <Route path="/deletion/doctor-master" element={<ProtectedRoute path="/doctor-master" element={<GenericMasterScreen masterKey="doctors" mode="deletion" />} />} />
          <Route path="/addition/chemist-master" element={<ProtectedRoute path="/chemist-master" element={<GenericMasterScreen masterKey="chemists" mode="addition" />} />} />
          <Route path="/deletion/chemist-master" element={<ProtectedRoute path="/chemist-master" element={<GenericMasterScreen masterKey="chemists" mode="deletion" />} />} />
          <Route path="/territory-management" element={<Navigate to="/addition/territory-management" replace />} />
          <Route path="/addition/territory-management" element={<ProtectedRoute path="/territory-management" element={<TerritoryManagement mode="addition" />} />} />
          <Route path="/deletion/territory-management" element={<ProtectedRoute path="/territory-management" element={<TerritoryManagement mode="deletion" />} />} />
          <Route path="/product-management" element={<Navigate to="/addition/product-management" replace />} />
          <Route path="/addition/product-management" element={<ProtectedRoute path="/product-management" element={<ProductManagement mode="addition" />} />} />
          <Route path="/deletion/product-management" element={<ProtectedRoute path="/product-management" element={<ProductManagement mode="deletion" />} />} />
          <Route path="/headquarter-management" element={<Navigate to="/addition/headquarter-management" replace />} />
          <Route path="/addition/headquarter-management" element={<ProtectedRoute path="/headquarter-management" element={<HeadquarterManagement mode="addition" />} />} />
          <Route path="/deletion/headquarter-management" element={<ProtectedRoute path="/headquarter-management" element={<HeadquarterManagement mode="deletion" />} />} />
          <Route path="/sales-projections" element={<ProtectedRoute path="/sales-projections" element={<SalesProjections />} />} />
          <Route path="/activity-approvals" element={<ProtectedRoute path="/activity-approvals" element={<ActivityApprovals />} />} />
          <Route path="/rule-config" element={<ProtectedRoute path="/rule-config" element={<RuleConfiguration />} />} />
          <Route path="/reports" element={<ProtectedRoute path="/reports" element={<Reports />} />} />

          {/* Doctor Master */}
          <Route path="/doctor-class" element={<ProtectedRoute path="/doctor-class" element={<DoctorClassMaster />} />} />
          <Route path="/doctor-category" element={<ProtectedRoute path="/doctor-category" element={<DoctorCategoryMaster />} />} />
          <Route path="/doctor-specialty" element={<ProtectedRoute path="/doctor-specialty" element={<DoctorSpecialtyMaster />} />} />
          <Route path="/doctor-qualification" element={<ProtectedRoute path="/doctor-qualification" element={<DoctorQualificationMaster />} />} />
          <Route path="/approvals" element={<ProtectedRoute path="/approvals" element={<ApprovalDashboard />} />} />
          <Route path="/stockist-master" element={<Navigate to="/addition/stockist-master" replace />} />
          <Route path="/hospital-master" element={<Navigate to="/addition/hospital-master" replace />} />
          <Route path="/svl-master" element={<Navigate to="/addition/svl-master" replace />} />
          <Route path="/addition/stockist-master" element={<ProtectedRoute path="/stockist-master" element={<GenericMasterScreen masterKey="stockists" mode="addition" />} />} />
          <Route path="/deletion/stockist-master" element={<ProtectedRoute path="/stockist-master" element={<GenericMasterScreen masterKey="stockists" mode="deletion" />} />} />
          <Route path="/addition/hospital-master" element={<ProtectedRoute path="/hospital-master" element={<GenericMasterScreen masterKey="hospitals" mode="addition" />} />} />
          <Route path="/deletion/hospital-master" element={<ProtectedRoute path="/hospital-master" element={<GenericMasterScreen masterKey="hospitals" mode="deletion" />} />} />
          <Route path="/addition/svl-master" element={<ProtectedRoute path="/svl-master" element={<GenericMasterScreen masterKey="svl" mode="addition" />} />} />
          <Route path="/deletion/svl-master" element={<ProtectedRoute path="/svl-master" element={<GenericMasterScreen masterKey="svl" mode="deletion" />} />} />

          {/* Product Master */}
          <Route path="/division-master" element={<ProtectedRoute path="/division-master" element={<DivisionMaster />} />} />
          <Route path="/brand-group-master" element={<ProtectedRoute path="/brand-group-master" element={<BrandGroupMaster />} />} />
          <Route path="/product-category-master" element={<ProtectedRoute path="/product-category-master" element={<ProductCategoryMaster />} />} />
          <Route path="/pack-size-master" element={<ProtectedRoute path="/pack-size-master" element={<PackSizeMaster />} />} />
          <Route path="/strength-master" element={<ProtectedRoute path="/strength-master" element={<StrengthMaster />} />} />

          {/* Input & Sample */}
          <Route path="/input-type-master" element={<ProtectedRoute path="/input-type-master" element={<InputTypeMaster />} />} />
          <Route path="/input-class-master" element={<ProtectedRoute path="/input-class-master" element={<InputClassMaster />} />} />
          <Route path="/input-master" element={<Navigate to="/addition/input-master" replace />} />
          <Route path="/sample-master" element={<Navigate to="/addition/sample-master" replace />} />
          <Route path="/input-allocation" element={<Navigate to="/addition/input-allocation" replace />} />
          <Route path="/rate-fixation" element={<Navigate to="/addition/rate-fixation" replace />} />
          <Route path="/addition/input-master" element={<ProtectedRoute path="/input-master" element={<InputMaster mode="addition" />} />} />
          <Route path="/deletion/input-master" element={<ProtectedRoute path="/input-master" element={<InputMaster mode="deletion" />} />} />
          <Route path="/addition/sample-master" element={<ProtectedRoute path="/sample-master" element={<SampleMaster mode="addition" />} />} />
          <Route path="/deletion/sample-master" element={<ProtectedRoute path="/sample-master" element={<SampleMaster mode="deletion" />} />} />
          <Route path="/addition/input-allocation" element={<ProtectedRoute path="/input-allocation" element={<GenericMasterScreen masterKey="inputAllocations" mode="addition" />} />} />
          <Route path="/deletion/input-allocation" element={<ProtectedRoute path="/input-allocation" element={<GenericMasterScreen masterKey="inputAllocations" mode="deletion" />} />} />
          <Route path="/addition/rate-fixation" element={<ProtectedRoute path="/rate-fixation" element={<GenericMasterScreen masterKey="rateFixations" mode="addition" />} />} />
          <Route path="/deletion/rate-fixation" element={<ProtectedRoute path="/rate-fixation" element={<GenericMasterScreen masterKey="rateFixations" mode="deletion" />} />} />

          {/* Policy & Control Masters */}
          <Route path="/notice-upload" element={<Navigate to="/addition/notice-upload" replace />} />
          <Route path="/sop-master" element={<Navigate to="/addition/sop-master" replace />} />
          <Route path="/addition/notice-upload" element={<ProtectedRoute path="/notice-upload" element={<GenericMasterScreen masterKey="notices" mode="addition" />} />} />
          <Route path="/deletion/notice-upload" element={<ProtectedRoute path="/notice-upload" element={<GenericMasterScreen masterKey="notices" mode="deletion" />} />} />
          <Route path="/addition/sop-master" element={<ProtectedRoute path="/sop-master" element={<GenericMasterScreen masterKey="sopPolicies" mode="addition" />} />} />
          <Route path="/deletion/sop-master" element={<ProtectedRoute path="/sop-master" element={<GenericMasterScreen masterKey="sopPolicies" mode="deletion" />} />} />

          {/* Expense */}
          <Route path="/expense-type-master" element={<ProtectedRoute path="/expense-type-master" element={<ExpenseTypeMaster />} />} />
          <Route path="/travel-mode-master" element={<ProtectedRoute path="/travel-mode-master" element={<TravelModeMaster />} />} />
          <Route path="/fare-chart-master" element={<ProtectedRoute path="/fare-chart-master" element={<StandardFareChartMaster />} />} />
          <Route path="/expense-management" element={<ProtectedRoute path="/expense-management" element={<ExpenseManagement />} />} />

          {/* System Setup */}
          <Route path="/system-setup" element={<ProtectedRoute path="/system-setup" element={<SystemSetup />} />} />
          <Route path="/addition-deletion-control" element={<ProtectedRoute path="/addition-deletion-control" element={<AdditionDeletionControl />} />} />
          <Route path="/master-administration" element={<Navigate to="/addition-deletion-control" replace />} />

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
