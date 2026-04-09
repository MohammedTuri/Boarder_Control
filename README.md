# ICS Border Control System (Industrialized)

A professional, high-fidelity administrative command center and traveler portal designed for the **Ethiopian Immigration and Citizenship Service (ICS)**.

## 🚀 Mission Startup Procedures

The system is architected as a decentralized full-stack application (React Frontend + Node.js/PostgreSQL Backend).

### 1. Backend Security Gateway (API)
- **Directory**: `/ics-backend`
- **Port**: `5000`
- **Execution**:
  ```bash
  cd ics-backend
  npm start
  ```
- **Prerequisites**: Ensure the `.env` file is present with valid `JWT_SECRET` and `DATABASE_URL` (PostgreSQL 5433).

### 2. Administrative Command Center (Frontend)
- **Directory**: `/ics-frontend`
- **Port**: `5173`
- **Execution**:
  ```bash
  cd ics-frontend
  npm run dev
  ```
- **Typography**: Uses `Inter` (Sans) and `JetBrains Mono` (Forensic Code) for elite precision.

---

## 🛠️ Operational Features

- **Mission Hub**: Real-time traveler processing with case-insensitive watchlist intercepts.
- **Reporting Center**: On-demand forensic reporting (Visa stats, Crossing activity).
- **Forensic Logs**: Tamper-evident Audit Trail for Level 4 Administrators.
- **Personnel Hub**: Full Role-Based Access Control (RBAC) for agents and supervisors.
- **Watchlist**: Real-time enrollment and national intercept logic.
- **Public Portal**: Secure application status tracker for international travelers.

## 🗄️ Database Architecture
The system utilizes a **PostgreSQL** backend for industrial-grade data persistence. 
- **Tables**: `users`, `crossings`, `watchlist`, `applications`, `audit_logs`.
- **Integrity**: Enforces chronological date validaton and document length security protocols.

---
**Mission Operational Status**: 100% Finalized.
