# Implementation Plan: Phase 7 - Mission Integrity & Situational Awareness

To truly achieve top-tier **situational awareness** for the Ethiopian ICS, Phase 7 introduces a unified **Mission Integrity Feed**. This feature centralizes all high-level system activity into a single, high-fidelity chronological timeline on the primary dashboard.

## User Review Required

> [!IMPORTANT]
> The Mission Feed will aggregate data from three different forensic sources: **Audit Logs**, **Traveler Notifications**, and **Border Crossings**.

> [!TIP]
> This feature allows supervisors to immediately identify and investigate high-risk events (e.g., a "Watchlist Hit" or an "Identity Anomaly") directly from the dashboard feed.

## Proposed Changes

### 🛰️ Mission Intelligence Feed

#### [MODIFY] [Dashboard.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/Dashboard.jsx)
- **Feed Component**: Refactor the "Recent Primary Events" section into a high-fidelity **Mission Integrity Feed**.
- **Specialized Icons**: Use unique icons and colors for each event type:
  - 👁️ **Biometric Analysis** (Blue)
  - 🛂 **Visa Adjudication** (Purple)
  - 🚩 **Watchlist Match** (Red)
  - 📡 **Notification Dispatch** (Green)
  - 📥 **Secure Data Export** (Amber)
- **Deep Links**: Add buttons to each feed item to jump directly to the relevant record or audit log.

#### [NEW] [Mission Feed Endpoint](file:///c:/Users/Mohammed/.gemini/antigravity/ics-backend/server.js)
- **Unified Query**: Implement `/api/mission-feed` that uses a `UNION ALL` or aggregated query to retrieve the 20 most recent mission-critical events.
- **Payload Enrichment**: Include the agent ID and the traveler reference associated with each event.

### 🍱 Dashboard Polish

#### [MODIFY] [Dashboard.css](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/Dashboard.css)
- **Feed Styles**: Add specialized styles for the mission feed items, emphasizing real-time "Forensic Pulse" animations.

## Open Questions

- **Live Polling**: Should the feed use real-time polling (every 30s) or stay as a manual-refresh view? (I recommend a 30s auto-refresh for situational awareness).
- **Event Scope**: Should we include "Personnel Logins" in the public mission feed, or keep it strictly to traveler-related operations? (I recommend including it for total visibility).

## Verification Plan

### Manual Verification
1. Perform a variety of actions:
   - Approve a visa application.
   - Process a border crossing with a photo scan.
   - Export a CSV report.
2. Return to the **Command Overview (Dashboard)**.
3. Verify that the **Mission Integrity Feed** correctly visualizes all three actions in chronological order with appropriate icons and metadata.
4. Verify the auto-refresh behavior.
