# Implementation Plan: Phase 6 - Biometric Forensic Intelligence

To truly achieve a **Forensic Intelligence Center** for the Ethiopian ICS, we must move beyond text-based searches. Phase 6 introduces a simulated **Biometric Verification Engine** to the traveler processing and application review workflows.

## User Review Required

> [!IMPORTANT]
> This phase will simulate a **Biometric Facial Recognition** check. When a traveler's photo is processed, the system will perform an automated identity verification against the National Passport Archive.

> [!CAUTION]
> If a "Low Confidence" match is detected, the system will trigger an **Identity Anomaly Alert**, requiring a manual supervisor override.

## Proposed Changes

### 👁️ Biometric Verification Engine

#### [MODIFY] [Processing.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/Processing.jsx)
- **Biometric Panel**: Add a dynamic "Facial Recognition" scanning animation and result panel.
- **Identity Confidence**: Display a "Matching Score" (e.g., 99.4% Match to National Archive).
- **Anomaly Detection**: Show a "Warning" if the biometric signature deviates from the passport records.

#### [MODIFY] [ApplicationReview.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/ApplicationReview.jsx)
- **Visa Photo Integrity**: Add a "Biometric Scan" result to the applicant detail drawer, helping officers detect document fraud or impersonation.

### 🧠 Backend Intelligence

#### [MODIFY] [server.js](file:///c:/Users/Mohammed/.gemini/antigravity/ics-backend/server.js)
- **Biometric Logic**: Implement a `simulatedFaceMatch` logic based on passport number and uploaded photo data.
- **Identity Logs**: Record every biometric check in the `audit_logs` table for forensic tracing.

### 🛡️ Dashboard Transparency

#### [MODIFY] [Dashboard.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/Dashboard.jsx)
- **Biometric Alerts**: Add an indicator for the number of "Identity Anomaly Alerts" resolved today.

## Open Questions

- **Anomaly Behavior**: Should a low-confidence match (below 70%) automatically "Reject" a crossing, or only "Flag" it for a 2nd-tier officer review? (I recommend "Flagging" for manual adjudication).
- **Visuals**: Should we use a high-tech "Scanning Grid" overlay for the photo display during processing? (I highly recommend this for the 'WOW' factor).

## Verification Plan

### Manual Verification
1. Open the "Traveler Processing" module.
2. Enter a passport and upload/scan a photo.
3. Verify the **Biometric Analysis** animation starts and provides a confidence score.
4. Verify that high-risk travelers (watchlist) trigger a low-confidence or "Identity Flag" alert.
5. Review the biometric forensic entry in the **Traveler Intelligence Profile**.
