# Pamsforce Admin Portal

This is the web-based admin portal for the Pamsforce field force management system.

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [File Structure](#file-structure)
4. [Authentication](#authentication)
5. [Data Management](#data-management)
6. [Reporting](#reporting)
7. [Configuration](#configuration)
8. [Development](#development)

## Overview

The admin portal is a web-based interface designed for management teams to oversee field operations, manage users, configure business rules, and generate reports. It connects to the same backend API as the mobile application.

## Features

### Dashboard
- Overview of key metrics and statistics
- Quick access to important sections

### Doctor & Chemist Management
- View, add, edit, and delete doctors and chemists
- Search and filter capabilities
- Export data to CSV/Excel

### Sales & Projections
- View sales data and projections
- Monitor performance against targets
- Visualize data with charts

### Activity Approvals
- Review and approve activity exceptions
- Track pending approvals
- View approval history

### Rule Configuration
- Configure business rules and restrictions
- Set minimum activity requirements
- Define reporting deadlines

### Notification Rules
- Configure automated notifications
- Set reminder schedules
- Customize notification content

### Reports
- Generate detailed reports on various metrics
- Export reports to PDF and Excel
- Schedule automated report generation

## File Structure

```
admin-portal/
├── index.html          # Main dashboard page
├── login.html          # Login page
├── styles.css          # Global styles
├── script.js           # Main JavaScript functionality
├── src/
│   ├── assets/         # Images and other assets
│   ├── components/      # Reusable UI components
│   └── screens/        # Individual screen components
└── README.md           # This file
```

## Authentication

The admin portal uses the same authentication system as the mobile app:
1. Users navigate to `login.html`
2. Enter admin credentials
3. System validates credentials against the backend API
4. On successful authentication, user is redirected to `index.html`
5. Session is maintained using browser storage

## Data Management

### Doctors/Chemists
- CRUD operations for doctors and chemists
- Bulk import/export functionality
- Status management (active/inactive)

### Users
- Manage field representatives and other admin users
- Assign roles and permissions
- Reset passwords

## Reporting

### Sales Reports
- Daily, weekly, and monthly sales summaries
- Performance against targets
- Product-wise breakdown

### Activity Reports
- Field representative activity tracking
- Compliance monitoring
- Exception reporting

### Projection Reports
- Monthly business projections
- Actual vs projected comparison
- Trend analysis

## Configuration

### Activity Rules
- Minimum activities per month
- Block reporting if incomplete activities
- Admin approval requirements

### Sales Rules
- Secondary sales entry window
- Minimum chemist calls per day
- Projection and business entry deadlines

### Reporting Rules
- My Day Plan lock/unlock times
- Minimum working hours requirements
- Reason prompting for less than required hours

### Notification Rules
- Primary objective reminders
- Business and projection entry reminders
- Activity incomplete reminders
- Email notification preferences

## Development

### Running the Application
The admin portal is a static web application that can be served directly from the `admin-portal` directory using any web server.

### Customization
- Modify `styles.css` to change the look and feel
- Update `script.js` to add new functionality
- Add new HTML files for additional screens

### Integration with Backend
All data operations are performed through the RESTful API:
- Data is fetched using XMLHttpRequest or Fetch API
- JSON is used for data exchange
- Authentication tokens are included in request headers

## Security

### Authentication
- All API requests include authentication tokens
- Session timeouts are handled gracefully
- Passwords are never stored in plain text

### Data Protection
- Sensitive data is encrypted in transit
- Access controls are enforced on the backend
- Regular security audits are recommended

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.