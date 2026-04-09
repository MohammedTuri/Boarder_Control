# Implementation Plan: Security & Visa Reporting Hub

Overhaul the "History" page into a professional "Reporting Center" with specialized templates for crossings, visa lifecycles, and nationality statistics.

## User Review Required

> [!IMPORTANT]
> The current "History" link in the sidebar will be renamed to **"Operational Reports"**. The table will no longer be visible by default; instead, a catalog of specialized reports will be presented for selection.

## Proposed Changes

### 📊 [NEW] [Report Catalog UI](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/Reports.jsx)
Transform the existing History module into a two-stage reporting experience:
1. **Catalog View**: Cards representing different report types:
   - **Daily Crossing Audit**: Forensic list of traveler entries and exits.
   - **Visa Lifecycle Stats**: Statistical overview of Approved vs. Rejected applications.
   - **Nationality Analysis**: High-level distribution of travelers by country of origin.
2. **Criteria Configuration**: When a report is clicked, specialized filters (Start/End Date, Passport, Nationality, Status) will appear.
3. **Execution View**: Render results in a high-fidelity table or statistical summary panel.

### 🔌 [MODIFY] [Report API](file:///c:/Users/Mohammed/.gemini/antigravity/ics-backend/server.js)
Implement sophisticated aggregation in the `/api/crossings` and a new `/api/reports/stats` endpoint:
- **Statistics Aggregation**: Query the `applications` AND `crossings` tables to return counts for:
  - `Approved` vs `Rejected` vs `Pending` visas.
  - Total volume per nationality.
  - Volume in a specific date range.

### 🧭 [MODIFY] [Navigation Architecture](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/App.jsx)
Update the route and sidebar labels to reflect the broader scope of the "Reporting Hub."

## Open Questions

> [!IMPORTANT]
> Should the **Visa Statistics** report include data from the Public Applications table only, or combined with actual Border Crossings? Usually, "Visa Requests" come from the `applications` table, and "Entry History" comes from `crossings`. I propose providing a report that merges both.

## Verification Plan

### Manual Verification
1. Navigate to **Operational Reports**.
2. Select **Visa Lifecycle Stats**.
3. Choose a 1-month date range and click **Generate**.
4. Verify that the system correctly calculates:
   - Total Visa Requests.
   - Approved vs. Rejected ratios.
   - Distribution of traveler nationalities.
5. Repeat for **Daily Crossing Audit** and verify specific passport filtering.
