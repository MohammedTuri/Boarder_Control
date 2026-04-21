# ICS Border Control System - Production Deployment Roadmap

This document outlines the authoritative procedures for deploying the industrialized ICS platform to a secure online environment.

## Infrastructure Requirements

### 1. Database (Sovereign Data Layer)
For production persistence, use a managed PostgreSQL provider:
- **Recommended**: [Supabase](https://supabase.com) or [Neon.tech](https://neon.tech).
- **Procedures**:
    1. Create a new PostgreSQL instance.
    2. Execute the `ics-backend/schema.sql` to initialize the sovereign table structure.
    3. Import existing data using the `export_db.ps1` script.

### 2. Backend API (Mission Logic)
Deploy the Node.js/Express server to a container-ready host:
- **Recommended**: [Render](https://render.com) or [Railway](https://railway.app).
- **Environment Variables**:
    - `PORT`: `5000`
    - `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`: Credentials from your managed DB.
    - `JWT_SECRET`: A high-entropy cryptographic string.
    - `NODE_ENV`: `production`

### 3. Frontend Portal (Sovereign Gateway)
Deploy the React application as a static site or SSR bundle:
- **Recommended**: [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
- **Build Settings**:
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
- **Configuration**: Ensure `VITE_API_URL` points to your production backend URL in the provider's dashboard.

## Security Hardening
1. **SSL/TLS**: All online traffic must be encrypted via HTTPS (TLS 1.3).
2. **CORS**: Update `ics-backend/server.js` to restrict origins to your specific production frontend domain.
3. **Audit Trails**: Ensure the `audit_logs` table is backed up regularly as per national data retention policies.

---
**Mission Operational Status**: Ready for Deployment.
