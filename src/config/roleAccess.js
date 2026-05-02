// Role-Based Screen Access Configuration
// Based on User Master document: Admin, HR, RBM, ABM, TBM, MR, Billing User

// Screen groups
export const SCREENS = {
  DASHBOARD: '/dashboard',
  USER_MANAGEMENT: '/user-management',
  DOCTORS_CHEMISTS: '/doctors-chemists',
  TERRITORY: '/territory-management',
  HEADQUARTER: '/headquarter-management',
  PRODUCT: '/product-management',
  SALES_PROJECTIONS: '/sales-projections',
  ACTIVITY_APPROVALS: '/activity-approvals',
  RULE_CONFIG: '/rule-config',
  REPORTS: '/reports',
  // Masters
  DOCTOR_CLASS: '/doctor-class',
  DOCTOR_CATEGORY: '/doctor-category',
  DOCTOR_SPECIALTY: '/doctor-specialty',
  DOCTOR_QUALIFICATION: '/doctor-qualification',
  CHEMIST_MASTER: '/chemist-master',
  APPROVALS: '/approvals',
  DIVISION: '/division-master',
  BRAND_GROUP: '/brand-group-master',
  PRODUCT_CATEGORY: '/product-category-master',
  PACK_SIZE: '/pack-size-master',
  STRENGTH: '/strength-master',
  INPUT_TYPE: '/input-type-master',
  INPUT_CLASS: '/input-class-master',
  INPUT_MASTER: '/input-master',
  SAMPLE_MASTER: '/sample-master',
  EXPENSE_TYPE: '/expense-type-master',
  TRAVEL_MODE: '/travel-mode-master',
  FARE_CHART: '/fare-chart-master',
  EXPENSE_MANAGEMENT: '/expense-management',
  SYSTEM_SETUP: '/system-setup'
  , MASTER_ADMINISTRATION: '/master-administration'
}

// Role definitions with allowed screens
export const ROLE_ACCESS = {
  // Full system control
  admin: [
    SCREENS.DASHBOARD, SCREENS.USER_MANAGEMENT, SCREENS.DOCTORS_CHEMISTS,
    SCREENS.TERRITORY, SCREENS.HEADQUARTER, SCREENS.PRODUCT,
    SCREENS.SALES_PROJECTIONS, SCREENS.ACTIVITY_APPROVALS, SCREENS.RULE_CONFIG,
    SCREENS.REPORTS, SCREENS.DOCTOR_CLASS, SCREENS.DOCTOR_CATEGORY,
    SCREENS.DOCTOR_SPECIALTY, SCREENS.DOCTOR_QUALIFICATION, SCREENS.CHEMIST_MASTER,
    SCREENS.APPROVALS,
    SCREENS.DIVISION, SCREENS.BRAND_GROUP, SCREENS.PRODUCT_CATEGORY,
    SCREENS.PACK_SIZE, SCREENS.STRENGTH, SCREENS.INPUT_TYPE, SCREENS.INPUT_CLASS,
    SCREENS.INPUT_MASTER, SCREENS.SAMPLE_MASTER, SCREENS.EXPENSE_TYPE,
    SCREENS.TRAVEL_MODE, SCREENS.FARE_CHART, SCREENS.EXPENSE_MANAGEMENT,
    SCREENS.SYSTEM_SETUP, SCREENS.MASTER_ADMINISTRATION
  ],
  // HR - Employee & salary focus
  HR: [
    SCREENS.DASHBOARD, SCREENS.USER_MANAGEMENT, SCREENS.REPORTS,
    SCREENS.EXPENSE_MANAGEMENT, SCREENS.FARE_CHART
  ],
  // NSM - National overview
  NSM: [
    SCREENS.DASHBOARD, SCREENS.USER_MANAGEMENT, SCREENS.DOCTORS_CHEMISTS,
    SCREENS.TERRITORY, SCREENS.HEADQUARTER, SCREENS.PRODUCT,
    SCREENS.SALES_PROJECTIONS, SCREENS.ACTIVITY_APPROVALS, SCREENS.REPORTS,
    SCREENS.DOCTOR_CLASS, SCREENS.DOCTOR_CATEGORY, SCREENS.DOCTOR_SPECIALTY,
    SCREENS.DOCTOR_QUALIFICATION, SCREENS.CHEMIST_MASTER, SCREENS.APPROVALS, SCREENS.DIVISION,
    SCREENS.BRAND_GROUP, SCREENS.PRODUCT_CATEGORY, SCREENS.PACK_SIZE,
    SCREENS.STRENGTH, SCREENS.INPUT_TYPE, SCREENS.INPUT_CLASS,
    SCREENS.INPUT_MASTER, SCREENS.SAMPLE_MASTER, SCREENS.EXPENSE_TYPE,
    SCREENS.TRAVEL_MODE, SCREENS.FARE_CHART, SCREENS.EXPENSE_MANAGEMENT,
    SCREENS.SYSTEM_SETUP, SCREENS.MASTER_ADMINISTRATION
  ],
  // RBM - Regional management
  RBM: [
    SCREENS.DASHBOARD, SCREENS.DOCTORS_CHEMISTS, SCREENS.SALES_PROJECTIONS,
    SCREENS.ACTIVITY_APPROVALS, SCREENS.REPORTS, SCREENS.APPROVALS,
    SCREENS.EXPENSE_MANAGEMENT, SCREENS.USER_MANAGEMENT, SCREENS.SYSTEM_SETUP
  ],
  // ABM - Area management
  ABM: [
    SCREENS.DASHBOARD, SCREENS.DOCTORS_CHEMISTS, SCREENS.SALES_PROJECTIONS,
    SCREENS.ACTIVITY_APPROVALS, SCREENS.EXPENSE_MANAGEMENT, SCREENS.SYSTEM_SETUP
  ],
  // TBM - Territory
  TBM: [
    SCREENS.DASHBOARD, SCREENS.DOCTORS_CHEMISTS, SCREENS.SALES_PROJECTIONS,
    SCREENS.EXPENSE_MANAGEMENT
  ],
  // MR - Field representative (limited)
  'Field Representative': [
    SCREENS.DASHBOARD, SCREENS.DOCTORS_CHEMISTS, SCREENS.SALES_PROJECTIONS,
    SCREENS.EXPENSE_MANAGEMENT
  ],
  // Billing User
  'Billing User': [
    SCREENS.DASHBOARD, SCREENS.PRODUCT, SCREENS.REPORTS
  ],
  // Legacy roles
  user: [SCREENS.DASHBOARD, SCREENS.DOCTORS_CHEMISTS, SCREENS.SALES_PROJECTIONS, SCREENS.EXPENSE_MANAGEMENT],
  manager: [SCREENS.DASHBOARD, SCREENS.DOCTORS_CHEMISTS, SCREENS.SALES_PROJECTIONS, SCREENS.ACTIVITY_APPROVALS, SCREENS.REPORTS, SCREENS.EXPENSE_MANAGEMENT]
}

// Get allowed screens for a role
export const getAllowedScreens = (role) => {
  if (!role) return [SCREENS.DASHBOARD]
  // Normalize role
  const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1)
  
  // Check exact match first
  if (ROLE_ACCESS[role]) return ROLE_ACCESS[role]
  
  // Check normalized
  for (const [key, screens] of Object.entries(ROLE_ACCESS)) {
    if (key.toLowerCase() === role.toLowerCase()) return screens
  }
  
  // Default: only dashboard
  return [SCREENS.DASHBOARD]
}

// Check if a specific screen is accessible
export const canAccessScreen = (role, screenPath) => {
  const allowed = getAllowedScreens(role)
  return allowed.includes(screenPath)
}

// Menu items grouped by section
export const MENU_SECTIONS = {
  territory: {
    items: [
      { id: 'headquarter', label: 'HQ Master', icon: 'fas fa-building', path: SCREENS.HEADQUARTER },
      { id: 'territory', label: 'Patch/Route', icon: 'fas fa-map-marked-alt', path: SCREENS.TERRITORY }
    ]
  },
  doctors: {
    items: [
      { id: 'doctor-class', label: 'Doctor Class', icon: 'fas fa-tags', path: SCREENS.DOCTOR_CLASS },
      { id: 'doctor-category', label: 'Doctor Category', icon: 'fas fa-list-alt', path: SCREENS.DOCTOR_CATEGORY },
      { id: 'doctor-specialty', label: 'Doctor Specialty', icon: 'fas fa-stethoscope', path: SCREENS.DOCTOR_SPECIALTY },
      { id: 'doctor-qualification', label: 'Doctor Qualification', icon: 'fas fa-graduation-cap', path: SCREENS.DOCTOR_QUALIFICATION }
    ]
  },
  products: {
    items: [
      { id: 'division', label: 'Division', icon: 'fas fa-building', path: SCREENS.DIVISION },
      { id: 'brand-group', label: 'Brand Group', icon: 'fas fa-layer-group', path: SCREENS.BRAND_GROUP },
      { id: 'product-category', label: 'Category', icon: 'fas fa-tags', path: SCREENS.PRODUCT_CATEGORY },
      { id: 'pack-size', label: 'Pack Size', icon: 'fas fa-box', path: SCREENS.PACK_SIZE },
      { id: 'strength', label: 'Strength', icon: 'fas fa-flask', path: SCREENS.STRENGTH },
      { id: 'product', label: 'Product', icon: 'fas fa-pills', path: SCREENS.PRODUCT }
    ]
  },
  inputs: {
    items: [
      { id: 'input-type', label: 'Input Type', icon: 'fas fa-tags', path: SCREENS.INPUT_TYPE },
      { id: 'input-class', label: 'Input Class', icon: 'fas fa-layer-group', path: SCREENS.INPUT_CLASS },
      { id: 'input-master', label: 'Input Master', icon: 'fas fa-file-alt', path: SCREENS.INPUT_MASTER },
      { id: 'sample-master', label: 'Sample Master', icon: 'fas fa-prescription-bottle', path: SCREENS.SAMPLE_MASTER }
    ]
  },
  expense: {
    items: [
      { id: 'expense-type', label: 'Expense Type', icon: 'fas fa-tags', path: SCREENS.EXPENSE_TYPE },
      { id: 'travel-mode', label: 'Travel Mode', icon: 'fas fa-car', path: SCREENS.TRAVEL_MODE },
      { id: 'fare-chart', label: 'Standard Fare Chart', icon: 'fas fa-table', path: SCREENS.FARE_CHART }
    ]
  }
}

export default { ROLE_ACCESS, getAllowedScreens, canAccessScreen, SCREENS, MENU_SECTIONS }
