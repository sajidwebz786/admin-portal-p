import axios from "axios";

// -------------------------
// Axios Base Configuration
// -------------------------
// Use environment variable or fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// -------------------------
// Request Interceptor (Auth Token)
// -------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -------------------------
// Response Interceptor (Error Handling)
// -------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    if (response?.status === 401) {
      console.warn("Authentication failed, redirecting to login...");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      window.location.href = "/";
    }
    return Promise.reject(
      response?.data?.message || "API request failed. Please try again."
    );
  }
);

// Export axios instance for direct API calls (used by master data components)
export { api };

// -------------------------
// Admin API Service
// -------------------------
class AdminAPIService {
  // ----- Auth -----
  async login(username, password) {
    try {
      const res = await api.post("/auth/login", {
        email: username,
        password,
      });

      if (res.data.token) {
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem("adminUser", JSON.stringify(res.data.user));
      }

      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Network error. Please try again.",
      };
    }
  }

  logout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
  }

  // ----- Generic Request -----
  async request(endpoint, options = {}) {
    try {
      const res = await api(endpoint, options);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "API request failed");
    }
  }

  // ----- User Management -----
  getUsers() {
    return this.request("/admin/users");
  }

  createUser(data) {
    return this.request("/admin/users", { method: "POST", data });
  }

  updateUser(id, data) {
    return this.request(`/admin/users/${id}`, { method: "PUT", data });
  }

  deleteUser(id) {
    return this.request(`/admin/users/${id}`, { method: "DELETE" });
  }

  // ----- Doctor Management -----
  getDoctors(params = {}) {
    return this.request(`/doctors${Object.keys(params).length ? `?${new URLSearchParams(params)}` : ''}`);
  }

  createDoctor(data) {
    return this.request("/doctors", { method: "POST", data });
  }

  updateDoctor(id, data) {
    return this.request(`/doctors/${id}`, { method: "PUT", data });
  }

  deleteDoctor(id) {
    return this.request(`/doctors/${id}`, { method: "DELETE" });
  }

  // ----- Doctor Master Supporting Data -----
  getDoctorClasses(status = 'active') {
    return this.request(`/master/doctor-classes?status=${status}`);
  }

  getDoctorCategories(status = 'active') {
    return this.request(`/master/doctor-categories?status=${status}`);
  }

  getDoctorSpecialties(status = 'active') {
    return this.request(`/master/doctor-specialties?status=${status}`);
  }

  getDoctorQualifications(status = 'active') {
    return this.request(`/master/doctor-qualifications?status=${status}`);
  }

  // ----- Chemist Management -----
  getChemists() {
    return this.request("/chemists");
  }

  createChemist(data) {
    return this.request("/chemists", { method: "POST", data });
  }

  updateChemist(id, data) {
    return this.request(`/chemists/${id}`, { method: "PUT", data });
  }

  deleteChemist(id) {
    return this.request(`/chemists/${id}`, { method: "DELETE" });
  }

  // ----- Territory Management -----
  getTerritories() {
    return this.request("/territories");
  }

  getTerritoriesByHQ(hqId) {
    return this.request(`/territories/by-hq/${hqId}`);
  }

  createTerritory(data) {
    return this.request("/territories", { method: "POST", data });
  }

  updateTerritory(id, data) {
    return this.request(`/territories/${id}`, { method: "PUT", data });
  }

  deleteTerritory(id) {
    return this.request(`/territories/${id}`, { method: "DELETE" });
  }

  // ----- Product Management -----
  getProducts(params = {}) {
    const queryString = Object.keys(params).length ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/products${queryString}`);
  }

  getActiveProducts() {
    return this.request("/products/active");
  }

  getProduct(id) {
    return this.request(`/products/${id}`);
  }

  createProduct(data) {
    return this.request("/products", { method: "POST", data });
  }

  updateProduct(id, data) {
    return this.request(`/products/${id}`, { method: "PUT", data });
  }

  deleteProduct(id) {
    return this.request(`/products/${id}`, { method: "DELETE" });
  }

  getProductPriceHistory(id) {
    return this.request(`/products/${id}/price-history`);
  }

  // ----- Division Master -----
  getDivisions(status = 'active') {
    return this.request(`/products/divisions?status=${status}`);
  }

  createDivision(data) {
    return this.request("/products/divisions", { method: "POST", data });
  }

  updateDivision(id, data) {
    return this.request(`/products/divisions/${id}`, { method: "PUT", data });
  }

  deleteDivision(id) {
    return this.request(`/products/divisions/${id}`, { method: "DELETE" });
  }

  // ----- Product Category Master -----
  getProductCategories(status = 'active') {
    return this.request(`/products/categories?status=${status}`);
  }

  createProductCategory(data) {
    return this.request("/products/categories", { method: "POST", data });
  }

  updateProductCategory(id, data) {
    return this.request(`/products/categories/${id}`, { method: "PUT", data });
  }

  deleteProductCategory(id) {
    return this.request(`/products/categories/${id}`, { method: "DELETE" });
  }

  // ----- Pack Size Master -----
  getPackSizes(status = 'active') {
    return this.request(`/products/pack-sizes?status=${status}`);
  }

  createPackSize(data) {
    return this.request("/products/pack-sizes", { method: "POST", data });
  }

  updatePackSize(id, data) {
    return this.request(`/products/pack-sizes/${id}`, { method: "PUT", data });
  }

  deletePackSize(id) {
    return this.request(`/products/pack-sizes/${id}`, { method: "DELETE" });
  }

  // ----- Brand Group Master -----
  getBrandGroups(status = 'active', division_id = null) {
    const params = new URLSearchParams({ status });
    if (division_id) params.append('division_id', division_id);
    return this.request(`/products/brand-groups?${params}`);
  }

  createBrandGroup(data) {
    return this.request("/products/brand-groups", { method: "POST", data });
  }

  updateBrandGroup(id, data) {
    return this.request(`/products/brand-groups/${id}`, { method: "PUT", data });
  }

  deleteBrandGroup(id) {
    return this.request(`/products/brand-groups/${id}`, { method: "DELETE" });
  }

  // ----- Strength Master -----
  getStrengths(status = 'active') {
    return this.request(`/products/strengths?status=${status}`);
  }

  createStrength(data) {
    return this.request("/products/strengths", { method: "POST", data });
  }

  updateStrength(id, data) {
    return this.request(`/products/strengths/${id}`, { method: "PUT", data });
  }

  deleteStrength(id) {
    return this.request(`/products/strengths/${id}`, { method: "DELETE" });
  }

  // ----- Headquarter Management -----
  getHeadquarters() {
    return this.request("/headquarters");
  }

  createHeadquarter(data) {
    return this.request("/headquarters", { method: "POST", data });
  }

  updateHeadquarter(id, data) {
    return this.request(`/headquarters/${id}`, { method: "PUT", data });
  }

  deleteHeadquarter(id) {
    return this.request(`/headquarters/${id}`, { method: "DELETE" });
  }

  // ----- Business Rules -----
  getBusinessRulesStatus() {
    return this.request("/business-rules/status");
  }

  validateDoctorCall(doctorData) {
    return this.request("/business-rules/validate-doctor-call", {
      method: "POST",
      data: { doctorData },
    });
  }

  checkFeatureAccess(feature) {
    return this.request(`/business-rules/feature-access/${feature}`);
  }

  requestAdminOverride(userId, feature, reason) {
    return this.request("/business-rules/admin-override", {
      method: "POST",
      data: { userId, feature, reason },
    });
  }

  // ----- Activity Management -----
  getActivities() {
    return this.request("/activities");
  }

  approveActivity(id) {
    return this.request(`/activities/${id}/approve`, { method: "POST" });
  }

  rejectActivity(id, reason) {
    return this.request(`/activities/${id}/reject`, {
      method: "POST",
      data: { reason },
    });
  }

  // ----- Sales Management -----
  getSales() {
    return this.request("/sales");
  }

  getProjections() {
    return this.request("/projections");
  }

  // ----- Notifications -----
  getNotifications() {
    return this.request("/notifications");
  }

  createNotification(data) {
    return this.request("/notifications", { method: "POST", data });
  }

  // ----- Dashboard -----
  getDashboardStats() {
    return this.request("/admin/dashboard-stats");
  }

  getRecentActivity() {
    return this.request("/admin/recent-activity");
  }

  // ----- Reports -----
  getReports(reportType, startDate, endDate) {
    const params = new URLSearchParams({ type: reportType, startDate, endDate });
    return this.request(`/admin/reports?${params}`);
  }

  getMonthlyStatsReport(startDate, endDate) {
    const params = new URLSearchParams({ startDate, endDate });
    return this.request(`/admin/reports/monthly-stats?${params}`);
  }

  getDailyVisitsReport(date) {
    return this.request(`/admin/reports/daily-visits?date=${date}`);
  }

  getSalesReport(startDate, endDate) {
    const params = new URLSearchParams({ startDate, endDate });
    return this.request(`/admin/reports/sales?${params}`);
  }

  // ----- Input Type Master -----
  getInputTypes(status = null) {
    const params = status ? `?status=${status}` : '';
    return this.request(`/master/input-types${params}`);
  }

  createInputType(data) {
    return this.request("/master/input-types", { method: "POST", data });
  }

  updateInputType(id, data) {
    return this.request(`/master/input-types/${id}`, { method: "PUT", data });
  }

  deleteInputType(id) {
    return this.request(`/master/input-types/${id}`, { method: "DELETE" });
  }

  // ----- Input Class Master -----
  getInputClasses(status = null) {
    const params = status ? `?status=${status}` : '';
    return this.request(`/master/input-classes${params}`);
  }

  createInputClass(data) {
    return this.request("/master/input-classes", { method: "POST", data });
  }

  updateInputClass(id, data) {
    return this.request(`/master/input-classes/${id}`, { method: "PUT", data });
  }

  deleteInputClass(id) {
    return this.request(`/master/input-classes/${id}`, { method: "DELETE" });
  }

  // ----- Input Master -----
  getInputs(params = {}) {
    const queryString = Object.keys(params).length ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/master/inputs${queryString}`);
  }

  getActiveInputs() {
    return this.request("/master/inputs/active");
  }

  createInput(data) {
    return this.request("/master/inputs", { method: "POST", data });
  }

  updateInput(id, data) {
    return this.request(`/master/inputs/${id}`, { method: "PUT", data });
  }

  deleteInput(id) {
    return this.request(`/master/inputs/${id}`, { method: "DELETE" });
  }

  // ----- Sample Master -----
  getSamples(params = {}) {
    const queryString = Object.keys(params).length ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/master/samples${queryString}`);
  }

  getActiveSamples() {
    return this.request("/master/samples/active");
  }

  createSample(data) {
    return this.request("/master/samples", { method: "POST", data });
  }

  updateSample(id, data) {
    return this.request(`/master/samples/${id}`, { method: "PUT", data });
  }

  deleteSample(id) {
    return this.request(`/master/samples/${id}`, { method: "DELETE" });
  }

  // ----- Role Management (User Master RBAC) -----
  getRoles(status = null) {
    const params = status ? `?status=${status}` : '';
    return this.request(`/roles${params}`);
  }

  createRole(data) {
    return this.request("/roles", { method: "POST", data });
  }

  updateRole(id, data) {
    return this.request(`/roles/${id}`, { method: "PUT", data });
  }

  deleteRole(id) {
    return this.request(`/roles/${id}`, { method: "DELETE" });
  }

  getRolePermissions(roleId) {
    return this.request(`/roles/${roleId}/permissions`);
  }

  assignRolePermissions(roleId, permissionIds) {
    return this.request(`/roles/${roleId}/permissions`, { method: "POST", data: { permission_ids: permissionIds } });
  }

  getAllPermissions() {
    return this.request("/roles/permissions/all");
  }

  createPermission(data) {
    return this.request("/roles/permissions", { method: "POST", data });
  }

  // ----- Expense Type Master -----
  getExpenseTypes(status = null) {
    const params = status ? `?status=${status}` : '';
    return this.request(`/expenses/expense-types${params}`);
  }

  createExpenseType(data) {
    return this.request("/expenses/expense-types", { method: "POST", data });
  }

  updateExpenseType(id, data) {
    return this.request(`/expenses/expense-types/${id}`, { method: "PUT", data });
  }

  deleteExpenseType(id) {
    return this.request(`/expenses/expense-types/${id}`, { method: "DELETE" });
  }

  // ----- Travel Mode Master -----
  getTravelModes(status = null) {
    const params = status ? `?status=${status}` : '';
    return this.request(`/expenses/travel-modes${params}`);
  }

  createTravelMode(data) {
    return this.request("/expenses/travel-modes", { method: "POST", data });
  }

  updateTravelMode(id, data) {
    return this.request(`/expenses/travel-modes/${id}`, { method: "PUT", data });
  }

  deleteTravelMode(id) {
    return this.request(`/expenses/travel-modes/${id}`, { method: "DELETE" });
  }

  // ----- Standard Fare Chart -----
  getFareCharts(params = {}) {
    const queryString = Object.keys(params).length ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/expenses/fare-charts${queryString}`);
  }

  getFareChart(id) {
    return this.request(`/expenses/fare-charts/${id}`);
  }

  createFareChart(data) {
    return this.request("/expenses/fare-charts", { method: "POST", data });
  }

  updateFareChart(id, data) {
    return this.request(`/expenses/fare-charts/${id}`, { method: "PUT", data });
  }

  deleteFareChart(id) {
    return this.request(`/expenses/fare-charts/${id}`, { method: "DELETE" });
  }

  // ----- Expense Management -----
  getExpenses(params = {}) {
    const queryString = Object.keys(params).length ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/expenses${queryString}`);
  }

  getExpense(id) {
    return this.request(`/expenses/${id}`);
  }

  getExpenseReport(params) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/expenses/report?${queryString}`);
  }

  createExpense(data) {
    return this.request("/expenses", { method: "POST", data });
  }

  updateExpense(id, data) {
    return this.request(`/expenses/${id}`, { method: "PUT", data });
  }

  deleteExpense(id) {
    return this.request(`/expenses/${id}`, { method: "DELETE" });
  }

  submitExpense(id) {
    return this.request(`/expenses/${id}/submit`, { method: "POST" });
  }

  approveExpense(id) {
    return this.request(`/expenses/${id}/approve`, { method: "POST" });
  }

  rejectExpense(id, reason) {
    return this.request(`/expenses/${id}/reject`, { method: "POST", data: { rejection_reason: reason } });
  }

  addExpenseAddition(expenseId, data) {
    return this.request(`/expenses/${expenseId}/additions`, { method: "POST", data });
  }

  getExpenseAdditions(expenseId) {
    return this.request(`/expenses/${expenseId}/additions`);
  }

  deleteExpenseAddition(id) {
    return this.request(`/expenses/additions/${id}`, { method: "DELETE" });
  }

  // ----- System Setup (Rule Engine) -----
  // Call Average Setup
  getCallAverageSetups() {
    return this.request("/system-setup/call-average");
  }

  createCallAverageSetup(data) {
    return this.request("/system-setup/call-average", { method: "POST", data });
  }

  updateCallAverageSetup(id, data) {
    return this.request(`/system-setup/call-average/${id}`, { method: "PUT", data });
  }

  deleteCallAverageSetup(id) {
    return this.request(`/system-setup/call-average/${id}`, { method: "DELETE" });
  }

  // Coverage Setup
  getCoverageSetups() {
    return this.request("/system-setup/coverage");
  }

  createCoverageSetup(data) {
    return this.request("/system-setup/coverage", { method: "POST", data });
  }

  updateCoverageSetup(id, data) {
    return this.request(`/system-setup/coverage/${id}`, { method: "PUT", data });
  }

  deleteCoverageSetup(id) {
    return this.request(`/system-setup/coverage/${id}`, { method: "DELETE" });
  }

  // Work Type Setup
  getWorkTypeSetups() {
    return this.request("/system-setup/work-type");
  }

  createWorkTypeSetup(data) {
    return this.request("/system-setup/work-type", { method: "POST", data });
  }

  updateWorkTypeSetup(id, data) {
    return this.request(`/system-setup/work-type/${id}`, { method: "PUT", data });
  }

  deleteWorkTypeSetup(id) {
    return this.request(`/system-setup/work-type/${id}`, { method: "DELETE" });
  }

  // Work Type Master
  getWorkTypeMasters() {
    return this.request("/system-setup/work-type-master");
  }

  createWorkTypeMaster(data) {
    return this.request("/system-setup/work-type-master", { method: "POST", data });
  }

  // Leave Policy
  getLeavePolicies() {
    return this.request("/system-setup/leave-policy");
  }

  createLeavePolicy(data) {
    return this.request("/system-setup/leave-policy", { method: "POST", data });
  }

  updateLeavePolicy(id, data) {
    return this.request(`/system-setup/leave-policy/${id}`, { method: "PUT", data });
  }

  deleteLeavePolicy(id) {
    return this.request(`/system-setup/leave-policy/${id}`, { method: "DELETE" });
  }

  // User Leave Balance
  getUserLeaveBalance(userId, year = null) {
    const params = year ? `?year=${year}` : '';
    return this.request(`/system-setup/leave-balance/${userId}${params}`);
  }

  initializeLeaveBalance(userId, year, leavePolicies) {
    return this.request("/system-setup/leave-balance/initialize", { method: "POST", data: { user_id: userId, year, leavePolicies } });
  }

  // Compliance Dashboard
  getUserCompliance(userId) {
    return this.request(`/system-setup/compliance/${userId}`);
  }

  getAllCompliance(params = {}) {
    const queryString = Object.keys(params).length ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/system-setup/compliance${queryString}`);
  }

  // ----- Seed Data -----
  async migrate() {
    return this.request("/master/migrate", { method: "POST" });
  }

  async seedData() {
    return this.request("/master/seed-data", { method: "POST" });
  }

  async getDataCounts() {
    return this.request("/master/data-counts");
  }
}

// -------------------------
// Export Singleton Instance
// -------------------------
const adminAPI = new AdminAPIService();
export default adminAPI;
