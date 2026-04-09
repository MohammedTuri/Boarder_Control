# Comprehensive System Architecture: Public Portal & Secure Command Center

This updated implementation plan integrates your request to build public-facing application pages for standard travelers while retaining the secure, role-based backend architecture we discussed for the border agents.

## User Review Required

> [!IMPORTANT]
> Because you are introducing public-facing pages (About, Apply, Contact), the system must be split into two major experiences: a **Public Traveler Portal** and the **Secure Command Center**. Please confirm this architectural split and the questions below.

## Proposed Changes

---

### 1. Dual-Layout Routing Architecture
We will fundamentally restructure the frontend so standard users aren't met with a dark-mode military command dashboard when they want to read the "About" page.

#### [NEW] `src/components/PublicLayout.jsx`
- A clean, accessible layout wrapper for the public featuring a standard top navigation bar (Home, About, Contact, Information, Apply) and a standard footer.

#### [MODIFY] `src/App.jsx` Routing Logic
- **Public Routes (No Login Required):**
  - `/` (Home/Landing Page)
  - `/about`
  - `/contact`
  - `/information` (Visa/Border Guidelines)
  - `/apply` (Online application for entry pre-approval)
  - `/login` (Gateway portal connecting to the Secure Command Center)
- **Protected Routes (Requires Auth Role):**
  - `/admin/*` (The entire secure ICS Command Center: Dashboard, Processing, Users, Reports, and Settings)

---

### 2. Public Traveler Portal Implementation
#### [NEW] `src/pages/public/About.jsx`, `Contact.jsx`, `Information.jsx`
- Build responsive, professional public pages detailing the Ethiopian Immigration and Citizenship Service.

#### [NEW] `src/pages/public/Apply.jsx`
- Create a public application form where travelers can submit pre-arrival requests (e-Visas / Border Crossing Requests). 
- Captures passport details, intended purpose of visit, scheduled dates, and allows an initial document/photo upload.

---

### 3. Backend Enhancements (`ics-backend`)
#### [MODIFY] `schema.sql`
- Add a new table: `applications`. This stores secure pre-approval requests from the public `/apply` page with tracking statuses (`Pending`, `Approved`, `Denied`).
- Map out the `users` table for Administrators, Supervisors, and Officers.

#### [MODIFY] `server.js`
- Create public API endpoints (`POST /api/applications`) to securely accept submissions without authentication.
- Create private API endpoints to let Administrators/Officers review these pending applications in the Command Center.
- Include a `seed.js` script to instantly populate PostgreSQL with dummy history and user logins for testing.

---

### 4. Internal Command Center (Previous Scope)
- **Role-Based Access Control (RBAC):** Deploy `Administrator`, `Supervisor`, and `Officer` logic.
- **Traveler Profile & History:** Agents can search a passport and instantly retrieve any pending `applications` or past entry `crossings` natively from the database.

## Open Questions

> [!TIP]
> Tell me your thoughts on these before we begin coding.

1. **Aesthetic Choice:** Do you want the Public Portal to have the exact same "Dark-Mode Glassmorphism" high-tech aesthetic as the Command Center, or should I build it using a lighter, more traditional government website design (e.g., White/Gold/Green) to contrast the two experiences?
2. **Application Tracking:** Standard process usually provides a tracking id. Should I generate a random "Application Reference Number" (e.g., `APP-10293X`) for the traveler upon successfully submitting the `/apply` form?
