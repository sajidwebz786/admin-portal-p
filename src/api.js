// Admin Portal API Integration
class AdminAPI {
    constructor() {
        // Use environment variable or fallback to localhost for development
        this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        this.token = localStorage.getItem('adminToken');
    }

    // Authentication methods
    async login(username, password) {
        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: username, password: password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                localStorage.setItem('adminToken', this.token);
                localStorage.setItem('adminUser', JSON.stringify(data.user));
                return { success: true, data };
            } else {
                return { success: false, error: data.message };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please check your connection.' };
        }
    }

    logout() {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        this.token = null;
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            }
        };

        const finalOptions = { ...defaultOptions, ...options };

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, finalOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    // User Management
    async getUsers() {
        return this.request('/users');
    }

    async createUser(userData) {
        return this.request('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async updateUser(userId, userData) {
        return this.request(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async deleteUser(userId) {
        return this.request(`/users/${userId}`, {
            method: 'DELETE'
        });
    }

    // Doctor Management
    async getDoctors() {
        return this.request('/doctors');
    }

    async createDoctor(doctorData) {
        return this.request('/doctors', {
            method: 'POST',
            body: JSON.stringify(doctorData)
        });
    }

    async updateDoctor(doctorId, doctorData) {
        return this.request(`/doctors/${doctorId}`, {
            method: 'PUT',
            body: JSON.stringify(doctorData)
        });
    }

    async deleteDoctor(doctorId) {
        return this.request(`/doctors/${doctorId}`, {
            method: 'DELETE'
        });
    }

    // Chemist Management
    async getChemists() {
        return this.request('/chemists');
    }

    async createChemist(chemistData) {
        return this.request('/chemists', {
            method: 'POST',
            body: JSON.stringify(chemistData)
        });
    }

    async updateChemist(chemistId, chemistData) {
        return this.request(`/chemists/${chemistId}`, {
            method: 'PUT',
            body: JSON.stringify(chemistData)
        });
    }

    async deleteChemist(chemistId) {
        return this.request(`/chemists/${chemistId}`, {
            method: 'DELETE'
        });
    }

    // Activity Management
    async getActivities() {
        return this.request('/activities');
    }

    async approveActivity(activityId) {
        return this.request(`/activities/${activityId}/approve`, {
            method: 'POST'
        });
    }

    async rejectActivity(activityId, reason) {
        return this.request(`/activities/${activityId}/reject`, {
            method: 'POST',
            body: JSON.stringify({ reason })
        });
    }

    // Sales Management
    async getSales() {
        return this.request('/sales');
    }

    async getProjections() {
        return this.request('/projections');
    }

    // Notification Management
    async getNotifications() {
        return this.request('/notifications');
    }

    async createNotification(notificationData) {
        return this.request('/notifications', {
            method: 'POST',
            body: JSON.stringify(notificationData)
        });
    }

    // Dashboard Statistics
    async getDashboardStats() {
        return this.request('/admin/dashboard-stats');
    }

    // Recent Activity
    async getRecentActivity() {
        return this.request('/admin/recent-activity');
    }

    // Reports
    async getReports(reportType, startDate, endDate) {
        const params = new URLSearchParams({
            type: reportType,
            startDate,
            endDate
        });
        return this.request(`/reports?${params}`);
    }
}

// Create global API instance and export it
const adminAPI = new AdminAPI();
export default adminAPI;