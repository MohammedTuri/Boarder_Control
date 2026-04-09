# Industrializing the ICS Border Control System

This plan transitions the Ethiopian Immigration and Citizenship Service (ICS) prototype from a "look-alike" UI into a functional full-stack application. We will implement real authentication, connect all frontend modules to the PostgreSQL backend, and add critical government features like Watchlist management and Public Application Tracking.

## User Review Required

> [!IMPORTANT]
> **Port Change**: We will standardize the React frontend to communicate with the Node.js backend on **Port 5000**.
> **Credentials**: The initial login for testing will be `ADM-001` with the password `password123` (once the seed is run).

## Proposed Changes

### 1. Backend Core & Security
Grouped enhancements to `server.js` and `schema.sql`.

#### [MODIFY] [schema.sql](file:///c:/Users/Mohammed/.gemini/antigravity/ics-backend/schema.sql)
- Add `watchlist` table to store flagged individuals (Name, Passport, Reason, Risk Level).
- Ensure `users` table is correctly structured for bcrypt hashes.

#### [MODIFY] [server.js](file:///c:/Users/Mohammed/.gemini/antigravity/ics-backend/server.js)
- Implement `POST /api/login` with JWT generation.
- Add `JWT` middleware to protect `/admin/*` routes.
- Add `GET/POST/DELETE /api/users` (Admin only).
- Add `GET/POST/DELETE /api/watchlist`.
- Add `GET /api/applications/:refNum` for public status checks.
- Add `PATCH /api/applications/:id` for processing approvals.

---

### 2. Public Portal Enhancements

#### [MODIFY] [Apply.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/public/Apply.jsx)
- Update API endpoint to `localhost:5000`.
- Ensure multi-part/form-data for document uploads is handled correctly.

#### [NEW] [Status.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/public/Status.jsx)
- A new page for travelers to check their E-Visa status using Reference Number + Passport Number.

#### [MODIFY] [PublicHeader.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/components/PublicHeader.jsx)
- Add "Check Status" link to navigation.

---

### 3. Command Center (Admin) Logic

#### [MODIFY] [AuthContext.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/context/AuthContext.jsx)
- Update `login` method to call the backend and store the JWT token.
- Add axios interceptor or standard fetch wrapper for authenticated requests.

#### [MODIFY] [Login.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/Login.jsx)
- Replace mock login logic with real API call to `/api/login`.

#### [MODIFY] [Processing.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/Processing.jsx)
- Replace `MOCK_WATCHLIST` with a real-time backend check during processing.
- Save traveler records to the database upon clearance.

#### [MODIFY] [UserManagement.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/UserManagement.jsx)
- Fetch real personnel data and implement "Add Personnel" functionality.

---

### 4. Database Setup

#### [MODIFY] [seed.js](file:///c:/Users/Mohammed/.gemini/antigravity/ics-backend/seed.js)
- Add initial watchlist entries for testing.
- Reset/Update user entries to align with the login requirements.

## Open Questions

- Should we implement automated "MRZ" (Machine Readable Zone) scanning from photos, or is manual entry sufficient for this prototype? (Currently mocking scan results)
- Do you have a preferred JWT expiration time for the Command Center? (Default: 8 hours)

## Verification Plan

### Automated Tests/Verification
- `npm run dev` for both frontend and backend.
- Use `Postman` or `curl` to verify JWT protection on admin routes.
- Verify that `Apply.jsx` correctly saves data to the `applications` table.

### Manual Verification
- Log in as `ADM-001` and verify access to Personnel Management.
- Log in as `AGT-882` and verify access is DENIED for Personnel Management but works for Processing.
- Process a traveler whose passport is in the `watchlist` and verify the "INTERCEPT REQUIRED" alert.
- Check a real reference number on the Public Status page.
