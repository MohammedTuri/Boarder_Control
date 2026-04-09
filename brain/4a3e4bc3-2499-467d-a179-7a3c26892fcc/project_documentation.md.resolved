# Project Documentation: Ethiopian ICS Border Control System

## 1. Executive Overview
The **Ethiopian Immigration and Citizenship Service (ICS) Border Control System** is a mission-critical, full-stack enterprise application designed to industrialize and secure Ethiopia’s border management. It bridges the gap between public-facing e-Visa applications and highly secured administrative adjudication and real-time border processing.

The system is built on a **Security-First Architecture**, ensuring that every traveler identity is biometrically verified against national watchlist archives and forensic risk profiles.

---

## 2. Technical Architecture
The system utilizes a modern, decoupled architecture:

*   **Frontend**: React 19 (Vite) - A high-performance, responsive SPA (Single Page Application) with premium glassmorphism aesthetics.
*   **Backend**: Node.js / Express - A secure API gateway managing identity matching, audit logging, and document generation.
*   **Database**: PostgreSQL 16 - A relational database optimized for forensic queries and high-concurrency crossing audits.
*   **Authentication**: JSON Web Token (JWT) - Secure, stateless communication between the Command Center and the API.

---

## 3. Core Modules

### A. The Public Traveler Portal
Designed for global accessibility, this portal allows international citizens to:
- **E-Visa Application**: Electronic submission of personal and travel documentation.
- **Identity Tracking**: Real-time status lookup using application reference numbers and passport IDs.
- **Document Issuance**: Downloadable, printable high-fidelity Pre-Approval certificates for entry.

### B. The Admin Command Center
The heartbeat of the operation, featuring:
- **Mission Integrity Dashboard**: Real-time telemetry on arrival volumes and security matches.
- **Visa Adjudication Hub**: Secure workflow for officers to Approve, Reject, or Hold applications.
- **Border Processing Station**: Real-time entry/exit processing with biometric scanning simulation.
- **National Watchlist**: A centralized database of flagged identities for immediate intercept.
- **Forensic Reporting Hub**: Advanced analytics on crossing trends and nationality distributions.
- **Mission Integrity Feed**: A live, automated audit trail of all security-sensitive events.

---

## 4. Installation & Deployment Guide

### Prerequisites
Before running the project, ensure you have the following installed:
1.  **Node.js** (v18.0.0 or higher)
2.  **PostgreSQL** (Active instance on port 5433 or 5432)
3.  **VS Code** (Optional, for editing)

### Step 1: Database Setup
1.  Create a database named `ics_db`.
2.  The backend will automatically initialize the following tables on first run:
    - `users` (Personnel data)
    - `applications` (Visa requests)
    - `crossings` (Border entries)
    - `watchlist` (Security flags)
    - `audit_logs` (Security tracking)
    - `notifications` (Communication logs)

### Step 2: Backend Initialization (`ics-backend`)
1.  Open a terminal in the `ics-backend` folder.
2.  Install dependencies: `npm install`
3.  Create a `.env` file with the following:
    ```env
    PORT=5000
    DB_USER=postgres
    DB_PASSWORD=root
    DB_HOST=localhost
    DB_NAME=ics_db
    DB_PORT=5433
    JWT_SECRET=ics_secure_command_center_2026
    ```
4.  Launch the server: `npm start`
    *The API will run at `http://localhost:5000`*

### Step 3: Frontend Initialization (`ics-frontend`)
1.  Open a second terminal in the `ics-frontend` folder.
2.  Install dependencies: `npm install`
3.  Launch the development server: `npm run dev`
    *The Portal will open at `http://localhost:5173`*

---

## 5. Security & Protocol
- **Officer Roles**: The system enforces three levels of access: `Administrator` (Full access), `Supervisor` (Adjudication & Logs), and `Agent` (Basic Processing).
- **Forensic Matching**: Every border entry triggers a background biometric conflict check against the national archive to prevent identity fraud.
- **Audit Consistency**: Every decision (Approval, Rejection, Login) is logged with the officer’s ID, timestamp, and IP address.

---
*© 2026 Federal Democratic Republic of Ethiopia - Immigration and Citizenship Service. All rights reserved.*
