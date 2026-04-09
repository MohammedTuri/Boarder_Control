# Implementation Plan: Forensic Analytics & Secure Data Export

Elevate the **Operational Reporting Hub** from simple data tables to a high-fidelity forensic intelligence center. This update adds interactive visual analytics and secure data portability (CSV export).

## User Review Required

> [!IMPORTANT]
> The **Reporting Hub** will now feature a dual-view interface. Officers can toggle between a focus on **Raw Data** (Table) and **Intelligence Analysis** (Charts). 

> [!TIP]
> A new **"Secure Export (CSV)"** button will be added to all report templates, allowing authorized agents to take forensic data offline for official documentation.

## Proposed Changes

### 📊 Intelligence Visualization Module

#### [MODIFY] [History.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/History.jsx)
- **Visual Analytics Tab**: Integrate `Recharts` directly into the reporting flow. 
    - **Visa Lifecycle**: Pie chart showing Approved/Rejected/Pending ratios.
    - **Nationality Heatmap**: Bar chart showing top 10 nationalities.
    - **Volume Trends**: Area chart showing crossing or application volume over the selected date range.
- **Dynamic Summaries**: Real-time calculation of key performance indicators (KPIs) like "Approval to Rejection Ratio" and "Peak Crossing Hours".

### 📥 Portability: Data Export Engine

#### [MODIFY] [History.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/History.jsx)
- **CSV Generator**: Implement a client-side CSV generation utility that processes the current metadata and result set into a downloadable format.
- **Audit Integration**: Every export action will be logged in the **Forensic Audit Trail** for security compliance.

### 🔌 Backend Support

#### [MODIFY] [server.js](file:///c:/Users/Mohammed/.gemini/antigravity/ics-backend/server.js)
- **Aggregation Tuning**: Refine `/api/reports/stats` and other report endpoints to ensure data is returned in a format highly compatible with both the charting engine and the export utility.

## Open Questions

- **Export Scope**: Should exports include all fields in the database, or only those currently visible in the UI? (I recommend all relevant operational fields).
- **Chart Complexity**: Should we allow agents to customize chart types (e.g., change Bar to Line), or stick to mission-hardened defaults? (I recommend mission-hardened defaults for speed).

## Verification Plan

### Automated Tests
1. Verify report generation with a 1-year date range.
2. Verify CSV generation logic handles special characters (e.g., Ethiopian names correctly).

### Manual Verification
1. Generate a **Daily Crossing Audit**.
2. Toggle to **Intelligence View** and verify the charts reflect the table data.
3. Click **Secure Export (CSV)** and verify the downloaded file opens correctly in Excel/Google Sheets.
4. Verify the export event appears in the **Audit Trail**.
