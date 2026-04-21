# Ethiopian ICS Border Control System

The **Immigration and Citizenship Service (ICS)** Border Control System is an industrialized, full-stack application designed for secure traveler processing, biometric verification, and visa adjudication for the Federal Democratic Republic of Ethiopia.

## 🚀 System Architecture

- **Frontend Portal (Sovereign Gateway)**: Built with React 19, Vite, and Lucide React.
  - **Live URL**: [https://boarder-control-one.vercel.app](https://boarder-control-one.vercel.app)
- **Backend API (Mission Logic)**: Node.js Express server with PostgreSQL integration.
  - **Live URL**: [https://ics-backend-production.onrender.com](https://ics-backend-production.onrender.com)
- **Database (Sovereign Persistence)**: Managed PostgreSQL (Supabase/Neon) with forensic audit capability.

## 🛠 Features

- **Public Portal**: Secure E-Visa applications and real-time status tracking.
- **Biometric Forensics**: Simulated neural biometric matching for identity conflict detection.
- **Risk Assessment**: Automated risk scoring engine based on traveler history and watchlist interdiction.
- **Officer Dashboard**: Comprehensive traveler query, visa adjudication, and audit logging.
- **Hardware Telemetry**: Real-time monitoring of document readers and biometric sensors.

## 💻 Local Development

### Prerequisites
- Node.js (v18+)
- PostgreSQL (Default port: `5433`)

### Installation
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   ```

2. **Backend Setup**:
   ```bash
   cd ics-backend
   npm install
   # Configure .env with your DB credentials
   node seed.js  # Initialize database
   npm run dev   # Starts on port 5000
   ```

3. **Frontend Setup**:
   ```bash
   cd ics-frontend
   npm install
   npm run dev   # Starts on port 5173
   ```

## 🌐 Production Configuration

The system is pre-configured for cloud deployment on **Vercel** and **Render**.

- **CORS Hardening**: The backend only allows requests from the authorized Vercel domain.
- **API Routing**: The frontend dynamically detects its environment and points to the live Render API.
- **Persistence**: Ensure your Render instance is connected to the production database via the `DATABASE_URL` environment variable.

---
**Sovereign Operational Status**: Authorized Deployment.
© 2026 Immigration and Citizenship Service. All rights reserved.
