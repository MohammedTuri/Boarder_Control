# Public Portal & Secure Command Center Integration

- [ ] Public Portal Layout
  - [ ] Implement `src/components/PublicLayout.jsx`
  - [ ] Implement `src/components/PublicHeader.jsx`
  - [ ] Implement `src/components/PublicFooter.jsx`
- [ ] Public Pages
  - [ ] Build `/` (Landing Home Page)
  - [ ] Build `/about`
  - [ ] Build `/information`
  - [ ] Build `/apply` (E-Visa / Crossing Pre-Approval Form)
  - [ ] Build `/contact`
- [ ] Application Routing & Security
  - [ ] Restructure `src/App.jsx` to map public routes vs `/admin/*` routes
  - [ ] Implement global `AuthContext.jsx` for RBAC mapping
  - [ ] Modify `Sidebar.jsx` to respect roles (Admin, Supervisor, Officer)
- [ ] Admin Portal Upgrades
  - [ ] Update `Login.jsx` to leverage new Auth Context
  - [ ] Add `TravelerSearch.jsx` & profile lookup features
  - [ ] Add Administrator `UserManagement.jsx` page
- [ ] Backend Data Integration
  - [ ] Update `schema.sql` (users, applications tables)
  - [ ] Update `server.js` API endpoints
  - [ ] Build `seed.js` for local data population

