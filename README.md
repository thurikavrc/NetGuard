# NetGuard – Network Monitoring and Alert System

## Overview

NetGuard is a full-stack network monitoring application designed to monitor the availability and health of network devices through a centralized dashboard. It provides device management, network status monitoring, scan history, and alert management to improve network visibility and simplify monitoring.

## Problem Statement

Monitoring multiple network devices manually can make it difficult to identify unavailable devices, track network activity, and respond to issues quickly. NetGuard aims to provide a centralized system for monitoring devices, maintaining scan history, and managing network alerts.

## Features

* **Centralized Dashboard** – View network devices and their current status.
* **Device Management** – Add and manage network devices through the application.
* **Device Status Monitoring** – Monitor the availability of configured devices.
* **Network Scanning** – Perform basic network and port scanning for configured devices.
* **Scan History** – Maintain records of previous network scans.
* **Alert Management** – Record and manage alerts generated during monitoring.
* **REST APIs** – Backend APIs for communication between the frontend and backend.
* **Database Integration** – Store device, scan history, and alert information using MySQL.

## Technology Stack

### Frontend

* React.js
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui

### Backend

* Python
* FastAPI
* REST APIs

### Database

* MySQL

### Tools

* Git & GitHub
* VS Code
* Postman

## Project Structure

```text
NetGuard/
│
├── backend/
│   ├── routes/
│   ├── services/
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
└── netguard_queries.sql
```

## Backend Components

The FastAPI backend is organized into separate modules for better maintainability:

* **Routes** – Handles API endpoints for devices, alerts, and scans.
* **Services** – Contains monitoring, alert, and port-scanning logic.
* **Models** – Defines database models used by the application.
* **Database** – Handles MySQL database connectivity.

## Database

NetGuard uses MySQL to store:

* Device information
* Scan history
* Network alerts

The `netguard_queries.sql` file contains sample queries for viewing the stored device, scan history, and alert data.

## Future Enhancements

* Real-time network monitoring improvements
* Automated email and notification workflows
* Advanced network analytics and visualization
* Improved security monitoring capabilities
* Enhanced device health and performance metrics

## Project Status

NetGuard is currently under development, with the core frontend and backend components implemented and additional monitoring and automation features planned.

## Author

**Thurika R**

B.Tech Information Technology
