import axios from "axios";

// -------------------------
// Axios Base Configuration
// -------------------------
// Production server URL - render.com
const PRODUCTION_API_URL = 'https://serverapp-a8wy.onrender.com/api';

const api = axios.create({
  baseURL: PRODUCTION_API_URL,
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
}

// -------------------------
// Export Singleton Instance
// -------------------------
const adminAPI = new AdminAPIService();
export default adminAPI;
