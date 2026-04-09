# Implementation Plan - Finalizing Forensic Industrialization

This plan outlines the final steps to complete the industrialization of the ICS Border Control System, focusing on real-time forensic intelligence, hardware telemetry, and advanced reporting capabilities.

## User Review Required

> [!IMPORTANT]
> The "Operational Integrity Metrics" on the dashboard (Identity Integrity, Biometric Verification Rate) are currently hardcoded. This plan moves them to real-time database-driven calculations which may fluctuate based on current data.

> [!TIP]
> We will be adding a "Hardware Telemetry" simulation to the main dashboard to enhance the "Mission Control" aesthetic, providing real-time status of document readers and biometric scanners.

## Proposed Changes

### 1. Dashboard & Mission Control

#### [MODIFY] [Dashboard.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/Dashboard.jsx)
- Replace hardcoded "Operational Integrity Metrics" with real-time calculations from a new backend endpoint.
- Integrate a **Live Hardware Telemetry** panel showing the status of simulated scanners and system links.
- Add a "Biometric Event" trigger to the Mission Integrity Feed for real-time visibility of identity conflicts.

### 2. Forensic Intelligence Enhancements

#### [MODIFY] [TravelerProfile.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/TravelerProfile.jsx)
- Sync the forensic UI with `ApplicationReview.jsx` to include the **Biometric Integrity** section.
- Display detailed identity conflict warnings if the traveler's signature matches another document in the archives.

#### [MODIFY] [server.js](file:///C:/Users/Mohammed/.gemini/antigravity/ics-backend/server.js)
- Implement `api/stats/integrity` endpoint to calculate real-time integrity percentages:
  - `Identity Integrity`: % of cleared crossings vs total.
  - `Biometric Rate`: % of crossings with valid photo signature.
  - `Watchlist Accuracy`: Based on confirmed hits.
- Enhance `calculateRiskScore` with additional forensic rules:
  - Proximity to document expiry.
  - Multiple application overlaps.

### 3. Mission Reporting Hub

#### [MODIFY] [History.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/History.jsx)
- Add a new report template: **"Biometric Integrity Audit"**.
- This report will list all crossings where "Identity Conflict" or "Anomaly Detected" was triggered, allowing for forensic post-entry review.

## Open Questions

- Should the "Hardware Telemetry" simulation be purely visual, or should it affect the ability to process new crossings in the "Processing" page? (Currently proposing visual-only with periodic "Recalibration" requirements).

## Verification Plan

### Automated Tests
- `npm run test` (if available) to verify backend logic.
- Manual verification of dashboard metric updates after inserting new data via the Processing page.

### Manual Verification
1. Open the Dashboard to verify real-time integrity metrics and hardware telemetry.
2. Process a crossing with a passport starting with "ETH-" to trigger a Biometric Conflict and verify it appears in the Mission Feed and Traveler Profile.
3. Generate a "Biometric Integrity Audit" report in the Reporting Hub.
