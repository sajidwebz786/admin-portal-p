import axios from "axios";

// -------------------------
// Axios Base Configuration
// -------------------------
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
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
  getDoctors() {
    return this.request("/doctors");
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
  getProducts() {
    return this.request("/products");
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
