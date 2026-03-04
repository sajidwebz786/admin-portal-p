document.addEventListener('DOMContentLoaded', function() {
    // Initialize AdminLTE components
    if (typeof $ !== 'undefined') {
        // Initialize AdminLTE components
        $('[data-widget="treeview"]').Treeview('init');
        $('.main-sidebar').removeClass('sidebar-collapse');
    }

    // Navigation functionality for AdminLTE sidebar
    const navLinks = document.querySelectorAll('.nav-sidebar .nav-link');
    const sections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Add active class to clicked link
            this.classList.add('active');

            // Show corresponding section
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');

                // Update page title and breadcrumb
                updatePageTitle(targetId);
            }
        });
    });

    // Set first nav link and section as active by default
    if (navLinks.length > 0) {
        navLinks[0].classList.add('active');
        sections[0].classList.add('active');
        updatePageTitle('dashboard');
    }

    // Initialize tooltips and popovers if available
    if (typeof $ !== 'undefined') {
        $('[data-toggle="tooltip"]').tooltip();
        $('[data-toggle="popover"]').popover();
    }
    
    // Approval buttons functionality for AdminLTE cards
    const approveButtons = document.querySelectorAll('.approve-btn');
    const rejectButtons = document.querySelectorAll('.reject-btn');

    approveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.card');
            const cardTitle = card.querySelector('.card-title').textContent;

            // Show AdminLTE confirmation dialog
            if (confirm(`Are you sure you want to approve "${cardTitle}"?`)) {
                // Add fade effect and remove the card
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    card.remove();
                    // Update pending approvals count
                    updatePendingApprovals();
                    // Show success notification
                    showNotification('Request approved successfully!', 'success');
                }, 300);
            }
        });
    });

    rejectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.card');
            const cardTitle = card.querySelector('.card-title').textContent;

            // Show AdminLTE confirmation dialog
            if (confirm(`Are you sure you want to reject "${cardTitle}"?`)) {
                // Add fade effect and remove the card
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    card.remove();
                    // Update pending approvals count
                    updatePendingApprovals();
                    // Show danger notification
                    showNotification('Request rejected!', 'danger');
                }, 300);
            }
        });
    });

    // Function to update pending approvals count
    function updatePendingApprovals() {
        const approvalCount = document.querySelectorAll('#approvalList .card').length;
        const pendingCountElement = document.getElementById('pendingCount');
        if (pendingCountElement) {
            pendingCountElement.textContent = approvalCount;
        }
    }
    
    // Tab functionality for AdminLTE nav tabs
    const tabButtons = document.querySelectorAll('.nav-tabs .nav-link');
    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            // Remove active class from all buttons and tab contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(content => content.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Show corresponding tab content
            const tabId = this.getAttribute('href');
            const targetTab = document.querySelector(tabId);
            if (targetTab) {
                targetTab.classList.add('active');
            }
        });
    });

    // Save button functionality for rule configuration
    const saveButtons = document.querySelectorAll('.btn[type="submit"]');
    saveButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('Settings saved successfully!', 'success');
        });
    });

    // Search functionality for AdminLTE input groups
    const searchButtons = document.querySelectorAll('.input-group-append .btn');
    searchButtons.forEach(button => {
        button.addEventListener('click', function() {
            const inputGroup = this.closest('.input-group');
            const searchInput = inputGroup.querySelector('input[type="text"]');
            if (searchInput && searchInput.value.trim() !== '') {
                showNotification(`Searching for: ${searchInput.value}`, 'info');
            }
        });
    });
    
    // Report generation functionality
    const generateButtons = document.querySelectorAll('.generate-btn');
    generateButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const reportType = document.getElementById('reportType');
            const startDate = document.getElementById('startDate');
            const endDate = document.getElementById('endDate');

            if (!reportType || !startDate || !endDate) {
                alert('Please fill in all report parameters');
                return;
            }

            if (!startDate.value || !endDate.value) {
                alert('Please select both start and end dates');
                return;
            }

            try {
                const reportData = await adminAPI.getReports(
                    reportType.value,
                    startDate.value,
                    endDate.value
                );

                displayReport(reportData);
                alert(`Report generated successfully!`);
            } catch (error) {
                console.error('Report generation error:', error);
                alert('Error generating report: ' + error.message);
            }
        });
    });
    
    // Load dashboard data
    loadDashboardData();

    // Load user management data
    loadUserData();

    // Initialize charts if Chart.js is available
    initializeCharts();

    // Initialize DataTables if available
    initializeDataTables();
});

// Function to update page title and breadcrumb
function updatePageTitle(sectionId) {
    const pageTitle = document.getElementById('pageTitle');
    const breadcrumbActive = document.getElementById('breadcrumbActive');

    const titles = {
        'dashboard': 'Dashboard',
        'user-management': 'User Management',
        'doctors-chemists': 'Doctors & Chemists',
        'sales-projections': 'Sales & Projections',
        'activity-approvals': 'Activity Approvals',
        'rule-config': 'Rule Configuration',
        'notification-rules': 'Notification Rules',
        'reports': 'Reports'
    };

    if (pageTitle) {
        pageTitle.textContent = titles[sectionId] || 'Dashboard';
    }

    if (breadcrumbActive) {
        breadcrumbActive.textContent = titles[sectionId] || 'Dashboard';
    }
}

// Function to show AdminLTE notifications
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 500px;
    `;

    notification.innerHTML = `
        <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
        <i class="icon fas fa-${type === 'success' ? 'check' : type === 'danger' ? 'ban' : 'info'}"></i>
        ${message}
    `;

    document.body.appendChild(notification);

    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);

    // Add click handler for close button
    const closeBtn = notification.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
    }
}

async function loadDashboardData() {
    try {
        // Load dashboard statistics
        const stats = await adminAPI.getDashboardStats();
        updateDashboardStats(stats);

        // Load recent activity
        const activities = await adminAPI.getRecentActivity();
        updateRecentActivity(activities);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Show error message to user
        showError('Failed to load dashboard data. Please refresh the page.');
    }
}

async function loadUserData() {
    try {
        const users = await adminAPI.getUsers();
        updateUsersTable(users);
    } catch (error) {
        console.error('Error loading user data:', error);
        // Keep existing static data if API fails
    }
}

function updateDashboardStats(stats) {
    if (stats) {
        document.getElementById('totalUsers').textContent = stats.totalUsers || '142';
        document.getElementById('pendingApprovals').textContent = stats.pendingApprovals || '24';
        document.getElementById('monthlySales').textContent = stats.monthlySales || '₹1,24,500';
    }
}

function updateRecentActivity(activities) {
    const activityList = document.getElementById('recentActivity');
    if (activities && activities.length > 0) {
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <p><strong>${activity.user}</strong> ${activity.action}</p>
                <span class="activity-time">${activity.time}</span>
            </div>
        `).join('');
    }
}

function updateUsersTable(users) {
    const tableBody = document.getElementById('usersTableBody');
    if (users && users.length > 0) {
        tableBody.innerHTML = users.map(user => `
            <tr>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td><span class="status ${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</td>
                <td>
                    <button class="edit-btn" onclick="editUser(${user.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteUser(${user.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    }
}

// User Management Functions
function showUserModal(userId = null) {
    const modal = document.getElementById('userModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('userForm');

    if (userId) {
        title.textContent = 'Edit User';
        // Load user data and populate form
        loadUserForEdit(userId);
    } else {
        title.textContent = 'Add New User';
        form.reset();
    }

    // Show AdminLTE modal
    $(modal).modal('show');
}

function closeUserModal() {
    const modal = document.getElementById('userModal');
    $(modal).modal('hide');
}

// Initialize charts
function initializeCharts() {
    // Check if Chart.js is available
    if (typeof Chart !== 'undefined') {
        // Sales Chart
        const salesChartCanvas = document.getElementById('salesChart');
        if (salesChartCanvas) {
            const salesChartData = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Sales',
                    backgroundColor: 'rgba(60,141,188,0.9)',
                    borderColor: 'rgba(60,141,188,0.8)',
                    pointRadius: false,
                    pointColor: '#3b8bba',
                    pointStrokeColor: 'rgba(60,141,188,1)',
                    pointHighlightFill: '#fff',
                    pointHighlightStroke: 'rgba(60,141,188,1)',
                    data: [65, 59, 80, 81, 56, 55]
                }]
            };

            const salesChartOptions = {
                maintainAspectRatio: false,
                responsive: true,
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        gridLines: {
                            display: false
                        }
                    }],
                    yAxes: [{
                        gridLines: {
                            display: false
                        }
                    }]
                }
            };

            new Chart(salesChartCanvas, {
                type: 'line',
                data: salesChartData,
                options: salesChartOptions
            });
        }

        // Report Chart
        const reportChartCanvas = document.getElementById('reportChart');
        if (reportChartCanvas) {
            const reportChartData = {
                labels: ['Completed', 'Pending', 'Blocked'],
                datasets: [{
                    data: [128, 14, 0],
                    backgroundColor: ['#28a745', '#ffc107', '#dc3545']
                }]
            };

            new Chart(reportChartCanvas, {
                type: 'doughnut',
                data: reportChartData,
                options: {
                    maintainAspectRatio: false,
                    responsive: true,
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            });
        }
    }
}

// Initialize DataTables
function initializeDataTables() {
    // Check if DataTables is available
    if (typeof $ !== 'undefined' && $.fn.DataTable) {
        $('.table').DataTable({
            'responsive': true,
            'autoWidth': false,
            'ordering': true,
            'searching': true,
            'paging': true,
            'info': true,
            'language': {
                'search': 'Search:',
                'lengthMenu': 'Show _MENU_ entries',
                'info': 'Showing _START_ to _END_ of _TOTAL_ entries',
                'paginate': {
                    'first': 'First',
                    'last': 'Last',
                    'next': 'Next',
                    'previous': 'Previous'
                }
            }
        });
    }
}

async function loadUserForEdit(userId) {
    try {
        const user = await adminAPI.getUser(userId);
        document.getElementById('userFirstName').value = user.firstName;
        document.getElementById('userLastName').value = user.lastName;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userRole').value = user.role;
        document.getElementById('userStatus').value = user.isActive ? 'active' : 'inactive';
    } catch (error) {
        console.error('Error loading user for edit:', error);
        alert('Error loading user data');
    }
}

// User Form Submission
document.getElementById('userForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const userData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        role: formData.get('role'),
        isActive: formData.get('status') === 'active'
    };

    try {
        const result = await adminAPI.createUser(userData);
        showNotification('User created successfully!', 'success');
        closeUserModal();
        loadUserData(); // Refresh the users table
    } catch (error) {
        console.error('Error creating user:', error);
        showNotification('Error creating user: ' + error.message, 'danger');
    }
});

async function editUser(userId) {
    showUserModal(userId);
}

async function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        try {
            await adminAPI.deleteUser(userId);
            showNotification('User deleted successfully!', 'success');
            loadUserData(); // Refresh the users table
        } catch (error) {
            console.error('Error deleting user:', error);
            showNotification('Error deleting user: ' + error.message, 'danger');
        }
    }
}

// Authentication check
function checkAuthentication() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'login.html';
    }
}

// Check authentication on page load
checkAuthentication();

// Report display functionality
function displayReport(reportData) {
    const reportPreview = document.querySelector('.report-preview');
    const reportTitle = reportPreview.querySelector('h3');

    reportTitle.textContent = `${reportData.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Report - ${reportData.period.startDate} to ${reportData.period.endDate}`;

    let reportContent = '';

    if (reportData.summary) {
        reportContent += `
            <div class="report-summary">
                <div class="summary-item">
                    <h4>Total Records</h4>
                    <p>${reportData.summary.totalVisits || reportData.summary.totalSales || reportData.summary.totalActivities || 'N/A'}</p>
                </div>
                <div class="summary-item">
                    <h4>Summary</h4>
                    <p>${reportData.summary.totalDays ? `${reportData.summary.totalDays} days` : reportData.summary.averageTransactionValue ? `Avg: ₹${reportData.summary.averageTransactionValue}` : reportData.summary.completionRate ? `${reportData.summary.completionRate}% completion` : 'N/A'}</p>
                </div>
                <div class="summary-item">
                    <h4>Period</h4>
                    <p>${reportData.period.startDate} to ${reportData.period.endDate}</p>
                </div>
            </div>
        `;
    }

    if (reportData.dailyBreakdown) {
        reportContent += '<h4>Daily Breakdown:</h4>';
        reportContent += '<div class="daily-breakdown">';
        Object.entries(reportData.dailyBreakdown).forEach(([date, data]) => {
            reportContent += `
                <div class="daily-item">
                    <strong>${date}:</strong> ${data.totalVisits} visits
                </div>
            `;
        });
        reportContent += '</div>';
    }

    if (reportData.productBreakdown) {
        reportContent += '<h4>Product Breakdown:</h4>';
        reportContent += '<div class="product-breakdown">';
        Object.entries(reportData.productBreakdown).forEach(([product, data]) => {
            reportContent += `
                <div class="product-item">
                    <strong>${product}:</strong> ${data.quantity} units, ₹${data.revenue}
                </div>
            `;
        });
        reportContent += '</div>';
    }

    reportPreview.innerHTML = reportTitle.outerHTML + reportContent;

    // Add export buttons
    const exportButtons = document.querySelector('.report-actions');
    exportButtons.innerHTML = `
        <button class="export-btn" onclick="exportReport('${reportData.type}', 'pdf')">Export to PDF</button>
        <button class="export-btn" onclick="exportReport('${reportData.type}', 'excel')">Export to Excel</button>
        <button class="export-btn" onclick="exportReport('${reportData.type}', 'csv')">Export to CSV</button>
    `;
}

// Export functionality
async function exportReport(reportType, format) {
    try {
        const reportTypeElement = document.getElementById('reportType');
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');

        const reportData = await adminAPI.getReports(
            reportTypeElement.value,
            startDate.value,
            endDate.value
        );

        // In a real application, you would send this data to a server
        // that generates the actual file and returns it for download
        console.log(`Exporting ${reportType} report as ${format}:`, reportData);

        alert(`Report exported as ${format.toUpperCase()} successfully!`);

        // Simulate file download
        const blob = new Blob([JSON.stringify(reportData, null, 2)],
                            { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting report: ' + error.message);
    }
}

// Approval request functions
async function approveRequest(requestId) {
    try {
        await adminAPI.approveRequest(requestId);
        showNotification('Request approved successfully!', 'success');
        // Reload the page to refresh data
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } catch (error) {
        console.error('Error approving request:', error);
        showNotification('Error approving request: ' + error.message, 'danger');
    }
}

async function rejectRequest(requestId) {
    try {
        await adminAPI.rejectRequest(requestId);
        showNotification('Request rejected!', 'danger');
        // Reload the page to refresh data
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } catch (error) {
        console.error('Error rejecting request:', error);
        showNotification('Error rejecting request: ' + error.message, 'danger');
    }
}

// Error display function
function showError(message) {
    showNotification(message, 'danger');
}