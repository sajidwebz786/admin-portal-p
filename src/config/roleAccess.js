// Role-Based Screen Access Configuration

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
  DOCTOR_MASTER: '/doctor-master',
  DOCTOR_CLASS: '/doctor-class',
  DOCTOR_CATEGORY: '/doctor-category',
  DOCTOR_SPECIALTY: '/doctor-specialty',
  DOCTOR_QUALIFICATION: '/doctor-qualification',
  CHEMIST_MASTER: '/chemist-master',
  STOCKIST_MASTER: '/stockist-master',
  HOSPITAL_MASTER: '/hospital-master',
  SVL_MASTER: '/svl-master',
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
  INPUT_ALLOCATION: '/input-allocation',
  RATE_FIXATION: '/rate-fixation',
  NOTICE_UPLOAD: '/notice-upload',
  SOP_MASTER: '/sop-master',
  EXPENSE_TYPE: '/expense-type-master',
  TRAVEL_MODE: '/travel-mode-master',
  FARE_CHART: '/fare-chart-master',
  EXPENSE_MANAGEMENT: '/expense-management',
  SYSTEM_SETUP: '/system-setup',
  ADDITION_DELETION_CONTROL: '/addition-deletion-control',
  BULK_UPLOADS: '/bulk-uploads'
}

const FULL_MASTER_ACCESS = [
  SCREENS.DOCTOR_MASTER, SCREENS.CHEMIST_MASTER, SCREENS.STOCKIST_MASTER,
  SCREENS.HOSPITAL_MASTER, SCREENS.SVL_MASTER, SCREENS.DOCTOR_CLASS,
  SCREENS.DOCTOR_CATEGORY, SCREENS.DOCTOR_SPECIALTY, SCREENS.DOCTOR_QUALIFICATION,
  SCREENS.DIVISION, SCREENS.BRAND_GROUP, SCREENS.PRODUCT_CATEGORY,
  SCREENS.PACK_SIZE, SCREENS.STRENGTH, SCREENS.PRODUCT, SCREENS.INPUT_TYPE,
  SCREENS.INPUT_CLASS, SCREENS.INPUT_MASTER, SCREENS.SAMPLE_MASTER,
  SCREENS.INPUT_ALLOCATION, SCREENS.RATE_FIXATION, SCREENS.NOTICE_UPLOAD,
  SCREENS.SOP_MASTER, SCREENS.EXPENSE_TYPE, SCREENS.TRAVEL_MODE,
  SCREENS.FARE_CHART, SCREENS.HEADQUARTER, SCREENS.TERRITORY
]

export const ROLE_ACCESS = {
  admin: [
    SCREENS.DASHBOARD, SCREENS.USER_MANAGEMENT, SCREENS.DOCTORS_CHEMISTS,
    SCREENS.SALES_PROJECTIONS, SCREENS.ACTIVITY_APPROVALS, SCREENS.RULE_CONFIG,
    SCREENS.REPORTS, SCREENS.APPROVALS, SCREENS.EXPENSE_MANAGEMENT,
    SCREENS.SYSTEM_SETUP, SCREENS.ADDITION_DELETION_CONTROL, SCREENS.BULK_UPLOADS, ...FULL_MASTER_ACCESS
  ],
  HR: [
    SCREENS.DASHBOARD, SCREENS.USER_MANAGEMENT, SCREENS.REPORTS,
    SCREENS.EXPENSE_MANAGEMENT, SCREENS.FARE_CHART
  ],
  NSM: [
    SCREENS.DASHBOARD, SCREENS.USER_MANAGEMENT, SCREENS.DOCTORS_CHEMISTS,
    SCREENS.SALES_PROJECTIONS, SCREENS.ACTIVITY_APPROVALS, SCREENS.REPORTS,
    SCREENS.APPROVALS, SCREENS.EXPENSE_MANAGEMENT, SCREENS.SYSTEM_SETUP,
    SCREENS.ADDITION_DELETION_CONTROL, SCREENS.BULK_UPLOADS, ...FULL_MASTER_ACCESS
  ],
  RBM: [
    SCREENS.DASHBOARD, SCREENS.DOCTORS_CHEMISTS, SCREENS.SALES_PROJECTIONS,
    SCREENS.ACTIVITY_APPROVALS, SCREENS.REPORTS, SCREENS.APPROVALS,
    SCREENS.ADDITION_DELETION_CONTROL, SCREENS.BULK_UPLOADS, SCREENS.EXPENSE_MANAGEMENT,
    SCREENS.USER_MANAGEMENT, SCREENS.SYSTEM_SETUP
  ],
  ABM: [
    SCREENS.DASHBOARD, SCREENS.DOCTORS_CHEMISTS, SCREENS.SALES_PROJECTIONS,
    SCREENS.ACTIVITY_APPROVALS, SCREENS.ADDITION_DELETION_CONTROL, SCREENS.BULK_UPLOADS,
    SCREENS.EXPENSE_MANAGEMENT, SCREENS.SYSTEM_SETUP
  ],
  TBM: [
    SCREENS.DASHBOARD, SCREENS.DOCTORS_CHEMISTS, SCREENS.SALES_PROJECTIONS,
    SCREENS.EXPENSE_MANAGEMENT
  ],
  'Field Representative': [
    SCREENS.DASHBOARD, SCREENS.DOCTORS_CHEMISTS, SCREENS.SALES_PROJECTIONS,
    SCREENS.EXPENSE_MANAGEMENT
  ],
  'Billing User': [
    SCREENS.DASHBOARD, SCREENS.PRODUCT, SCREENS.REPORTS
  ],
  user: [SCREENS.DASHBOARD, SCREENS.DOCTORS_CHEMISTS, SCREENS.SALES_PROJECTIONS, SCREENS.EXPENSE_MANAGEMENT],
  manager: [SCREENS.DASHBOARD, SCREENS.DOCTORS_CHEMISTS, SCREENS.SALES_PROJECTIONS, SCREENS.ACTIVITY_APPROVALS, SCREENS.REPORTS, SCREENS.EXPENSE_MANAGEMENT]
}

export const getAllowedScreens = (role) => {
  if (!role) return [SCREENS.DASHBOARD]
  if (ROLE_ACCESS[role]) return ROLE_ACCESS[role]

  for (const [key, screens] of Object.entries(ROLE_ACCESS)) {
    if (key.toLowerCase() === role.toLowerCase()) return screens
  }

  return [SCREENS.DASHBOARD]
}

export const canAccessScreen = (role, screenPath) => {
  const allowed = getAllowedScreens(role)
  return allowed.includes(screenPath)
}

export const MENU_SECTIONS = {
  territory: {
    items: []
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
      { id: 'strength', label: 'Strength', icon: 'fas fa-flask', path: SCREENS.STRENGTH }
    ]
  },
  inputs: {
    items: [
      { id: 'input-type', label: 'Input Type', icon: 'fas fa-tags', path: SCREENS.INPUT_TYPE },
      { id: 'input-class', label: 'Input Class', icon: 'fas fa-layer-group', path: SCREENS.INPUT_CLASS }
    ]
  },
  policy: {
    items: []
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
