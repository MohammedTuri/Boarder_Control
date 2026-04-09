# Implementation Plan: Phase 5 - Mission Communication & Governance

The internal mission is complete, but a modern government platform requires **Transparency and Governance**. Phase 5 introduces a centralized system for tracking all automated communications dispatched to travelers.

## User Review Required

> [!IMPORTANT]
> This phase introduces a **Communication Log**, ensuring that every Approval, Rejection, or e-Visa issuance is accompanied by a verifiable notification entry.

> [!TIP]
> This feature will be integrated into the **Admin Command Center**, providing supervisors with a single view of all outbound messaging.

## Proposed Changes

### 📡 Automated Messaging & Governance

#### [NEW] [History.jsx Refinement](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/History.jsx)
- **New Template**: Add "Communication Dispatch Log" to the Report Templates. This will allow officers to query all messages sent within a specific period.

#### [NEW] [Notification Table](file:///c:/Users/Mohammed/.gemini/antigravity/ics-backend/server.js)
- **Database Schema**: Initialize a `notifications` table to store message history.
  - `id`, `application_id`, `type` (Status Update, Issuance), `channel` (Email), `recipient`, `status` (Delivered/Failed), `created_at`.

### 🛡️ Backend Integration

#### [MODIFY] [server.js](file:///c:/Users/Mohammed/.gemini/antigravity/ics-backend/server.js)
- **Auto-Log Logic**: Update the status transition logic (`PATCH /status`) to automatically insert a notification record whenever a visa is approved or rejected.
- **Issuance Log**: Log a "Document Dispatched" notification whenever an e-Visa is generated.
- **GET /api/notifications**: New endpoint for retrieving communication history.

### 📊 Dashboard Enhancement

#### [MODIFY] [Dashboard.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/Dashboard.jsx)
- **Communication Stat**: Add a "Notifications Dispatched" stat card to the main dashboard.
- **Health Indicator**: Show the success rate of dispatched messages.

## Open Questions

- **Message Content**: Should the log store the absolute content of the email, or just the status/type? (I recommend storing the "Type" and "Recipients" to save database space while maintaining forensic tracking).

## Verification Plan

### Automated Tests
1. Approve a visa and verify that a new notification entry appears in the `notifications` table.
2. Generate an e-Visa and verify the issuance log entry.

### Manual Verification
1. Open the **Operational Reporting Hub**.
2. Select the new **Communication Dispatch Log**.
3. Verify that all recent status changes and document issuances are accurately listed.
4. Check the **Dashboard** for the updated communication throughput metrics.
