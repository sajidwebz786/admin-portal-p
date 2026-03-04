# PAMSFORCE Admin Portal - Complete Workflow Guide

## Overview
The PAMSFORCE Admin Portal is a comprehensive web-based management system designed for overseeing field force operations, managing users, configuring business rules, and generating reports. This document provides a complete workflow guide for administrators.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Dashboard Overview](#dashboard-overview)
4. [User Management](#user-management)
5. [Doctor & Chemist Management](#doctor--chemist-management)
6. [Sales & Projections](#sales--projections)
7. [Activity Approvals](#activity-approvals)
8. [Rule Configuration](#rule-configuration)
9. [Notification Rules](#notification-rules)
10. [Reports](#reports)
11. [API Integration](#api-integration)
12. [Troubleshooting](#troubleshooting)

## Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Access to PAMSFORCE backend API

### Initial Setup
1. Ensure the backend server is running on `http://192.168.1.12:5000`
2. Open `admin-portal/login.html` in your web browser
3. Use admin credentials to log in

## Authentication

### Login Process
1. Navigate to the login page
2. Enter your credentials:
   - **Username**: Your registered email address
   - **Password**: Your account password
3. Click "Sign In"
4. On successful authentication, you'll be redirected to the main dashboard

### Session Management
- Sessions are maintained using browser localStorage
- Tokens are automatically included in API requests
- Logout automatically redirects to login page

### Password Reset
- Click "Forgot your password?" link on login page
- Enter your registered email address
- Check your email for reset instructions

## Dashboard Overview

### Dashboard Sections
The main dashboard provides a comprehensive overview of:
- **Total Users**: Current number of registered users
- **Pending Approvals**: Activities awaiting admin approval
- **Monthly Sales**: Current month's sales figures
- **Recent Activity**: Latest system activities

### Navigation
Use the top navigation bar to access different sections:
- Dashboard
- User Management
- Doctors/Chemists
- Sales & Projections
- Activity Approvals
- Rule Configuration
- Notification Rules
- Reports

## User Management

### Overview
Manage all system users including field representatives, area managers, and other admin users.

### Adding New Users
1. Navigate to "User Management" section
2. Click "Add New User" button
3. Fill in the user details:
   - **First Name** (required)
   - **Last Name** (required)
   - **Email** (required, must be unique)
   - **Role** (Field Representative, Area Manager, Regional Manager, Admin)
   - **Status** (Active/Inactive)
4. Click "Save User"
5. User will receive login credentials via email

### Editing Users
1. Click "Edit" button next to any user in the table
2. Modify user details in the modal form
3. Click "Save User" to update

### Deleting Users
1. Click "Delete" button next to user
2. Confirm deletion in the popup dialog
3. User will be permanently removed from the system

### User Roles and Permissions
- **Field Representative**: Can submit activities, sales data, and projections
- **Area Manager**: Can approve activities and view reports for their area
- **Regional Manager**: Can manage multiple areas and generate comprehensive reports
- **Admin**: Full system access including user management and rule configuration

## Doctor & Chemist Management

### Doctor Management
1. Navigate to "Doctors/Chemists" section
2. Select "Doctors" tab
3. View all registered doctors in a table format
4. Use search bar to find specific doctors
5. Click "Add New Doctor" to register new doctors
6. Edit or delete existing doctor records

### Doctor Information Fields
- **Name**: Full name of the doctor
- **Specialty**: Medical specialization
- **Location**: City and state
- **Status**: Active/Inactive
- **Contact Information**: Phone, email, address

### Chemist Management
1. Select "Chemists" tab
2. View all registered chemists
3. Add new chemists using "Add New Chemist" button
4. Manage chemist records (edit/delete)

### Chemist Information Fields
- **Name**: Pharmacy/medical store name
- **Location**: Address and area
- **Status**: Active/Inactive
- **Contact Information**: Phone, email

## Sales & Projections

### Sales Overview
- View monthly, quarterly, and annual sales data
- Compare actual sales vs projections
- Monitor performance against targets
- Visualize data with interactive charts

### Projection Management
1. View monthly projection data
2. Compare actual sales vs projected figures
3. Analyze variance and trends
4. Export projection reports

### Sales Entry Process
1. Field representatives enter sales data through mobile app
2. Data is validated against business rules
3. Admin can review and approve sales entries
4. Approved data appears in sales reports

## Activity Approvals

### Approval Workflow
1. Field representatives submit activity reports
2. System validates against configured rules
3. Activities requiring approval appear in approval queue
4. Admin reviews and approves/rejects activities

### Review Process
1. Navigate to "Activity Approvals" section
2. Use filters to sort by type and status
3. Review each activity details:
   - User information
   - Activity description
   - Reason for exception (if any)
   - Date and time
4. Click "Approve" or "Reject" for each item

### Approval Types
- **Activity Exception**: Deviations from normal activity patterns
- **Day Call Exception**: Issues with daily call reporting
- **Sales Entry**: Sales data requiring validation

### Bulk Operations
- Select multiple items for batch approval/rejection
- Use filters to process specific types of approvals
- Track approval statistics and trends

## Rule Configuration

### Activity Rules
Configure rules for activity reporting:
- **Minimum Activities per Month**: Set required activity count
- **Approval Threshold**: Percentage requiring admin approval
- **Admin Approval Required**: Enable/disable approval workflow

### Sales Rules
Configure sales-related business rules:
- **Secondary Sales Entry Window**: Define valid entry dates (e.g., 1-2)
- **Minimum Chemist Calls Per Day**: Set daily call requirements
- **Projection Entry Deadline**: Set monthly projection deadline
- **Business Entry Deadline**: Set business data entry deadline

### Reporting Rules
Configure reporting and compliance rules:
- **My Day Plan Lock Time**: Time when daily plans are locked
- **My Day Plan Unlock Time**: Time when plans can be modified
- **Minimum Working Hours**: Define full day requirements
- **Reason Prompt**: Require explanation for incomplete days

## Notification Rules

### Automated Notifications
Configure system notifications:
- **Primary Objective Reminder**: Alert for unfulfilled objectives
- **Business Entry Reminder**: Remind about entry deadlines
- **Projection Entry Reminder**: Alert for projection deadlines
- **Activity Incomplete Reminder**: Notify about incomplete activities

### Notification Settings
- **Email Notifications**: Choose notification level (All/Critical/None)
- **Notification Preview**: Test notification appearance
- **Schedule Configuration**: Set timing for automated reminders

## Reports

### Report Generation
1. Navigate to "Reports" section
2. Select report type:
   - Activity Reports
   - Sales Reports
   - Projection Reports
   - Performance Reports
3. Choose date range
4. Click "Generate Report"

### Report Types

#### Activity Reports
- Total activities by user/area
- Completion rates and trends
- Exception reporting
- Compliance monitoring

#### Sales Reports
- Daily/weekly/monthly sales summaries
- Product-wise breakdown
- Performance against targets
- Regional comparisons

#### Projection Reports
- Monthly business projections
- Actual vs projected analysis
- Variance reporting
- Trend analysis

#### Performance Reports
- User performance metrics
- Area-wise performance
- Goal achievement tracking
- Improvement recommendations

### Export Options
- **PDF Export**: Professional formatted reports
- **Excel Export**: Data for further analysis
- **CSV Export**: Raw data for integration

## API Integration

### Backend Connection
The admin portal connects to the PAMSFORCE backend API:
- **Base URL**: `http://192.168.0.3:5000/api`
- **Authentication**: JWT token-based
- **Data Format**: JSON

### API Endpoints Used
- `/auth/login` - User authentication
- `/users` - User management
- `/doctors` - Doctor management
- `/chemists` - Chemist management
- `/activities` - Activity management
- `/sales` - Sales data
- `/projections` - Projection data
- `/notifications` - Notification management
- `/reports` - Report generation

### Error Handling
- Network errors are gracefully handled
- API failures show user-friendly messages
- Automatic retry for transient failures
- Fallback to static data when API unavailable

## Troubleshooting

### Common Issues

#### Login Problems
- **Issue**: Cannot login with valid credentials
- **Solution**: Check backend server status and API connectivity
- **Alternative**: Verify user account status in database

#### Data Not Loading
- **Issue**: Dashboard or tables show no data
- **Solution**: Check API connectivity and authentication token
- **Alternative**: Verify backend services are running

#### Approval Queue Issues
- **Issue**: Approvals not appearing in queue
- **Solution**: Check activity submission process and rule configuration
- **Alternative**: Verify user permissions and activity status

#### Report Generation Failures
- **Issue**: Reports fail to generate or export
- **Solution**: Check date ranges and data availability
- **Alternative**: Verify user permissions for report access

### Performance Optimization
- Minimize concurrent API calls
- Implement data caching for frequently accessed information
- Use pagination for large datasets
- Optimize images and assets

### Security Best Practices
- Use HTTPS for production deployments
- Implement proper session management
- Regular security audits
- User access logging and monitoring

## Support and Maintenance

### Regular Tasks
- Monitor system performance
- Review and process pending approvals
- Generate and review regular reports
- Update user permissions as needed
- Configure business rules based on requirements

### System Updates
- Keep backend API updated
- Monitor for security patches
- Regular data backups
- Performance monitoring and optimization

### User Training
- Provide training on new features
- Document workflow changes
- Create user guides and tutorials
- Conduct regular training sessions

## Conclusion

The PAMSFORCE Admin Portal provides comprehensive management capabilities for field force operations. By following this workflow guide, administrators can effectively manage users, monitor activities, configure business rules, and generate insightful reports.

For technical support or feature requests, contact the development team or refer to the system documentation.