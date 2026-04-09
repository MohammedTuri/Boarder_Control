# Implementation Plan: Phase 3 - Risk Assessment & Unified Traveler Profiles

The final step in industrializing the ICS Border Control System is to transition from simple "data records" to **Forensic Intelligence**. This phase introduces a **Risk Assessment Engine** that calculates traveler risk in real-time.

## User Review Required

> [!IMPORTANT]
> A new **Risk Score (Low, Elevated, Critical)** will be calculated for every traveler based on their consolidated history (Visas, Crossings, Watchlist hits).

> [!CAUTION]
> The **Risk Rating** will be prominently displayed to border agents during the crossing process, potentially triggering mandatory supervisor intervention for "Critical" matches.

## Proposed Changes

### 🧠 Forensic Intelligence: Risk Engine

#### [MODIFY] [server.js](file:///c:/Users/Mohammed/.gemini/antigravity/ics-backend/server.js)
- **Score Calculation Logic**: Implement a backend helper to aggregate data for a specific traveler (by passport) and assign a numerical score.
    - **Watchlist Hit**: Critical (+100)
    - **Rejected Visa**: Elevated (+30)
    - **Frequent Short Crossings**: Minor (+10)
- **Status Mapping**: Map scores to visual levels: 0-20 (Low), 21-60 (Elevated), 61+ (Critical).

### 🛂 Unified Traveler Profiles

#### [NEW] [TravelerProfile.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/TravelerProfile.jsx)
- **360-Degree View**: A dedicated dashboard for a specific traveler, accessible from Search, Application Review, and Live Processing.
- **Intelligence Timeline**: A combined chronological view of all Visas and Crossings.
- **Risk Breakdown**: Visual explanation of why a traveler has their current risk score.

### 🚥 Real-Time Integration

#### [MODIFY] [Processing.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/Processing.jsx)
- **Instant Risk Alert**: Display the risk score prominently as soon as a passport is scanned/entered.
- **Supervisor Lockdown**: Automatically require a supervisor PIN or "Hold" for travelers with a "Critical" risk rating.

#### [MODIFY] [ApplicationReview.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/ApplicationReview.jsx)
- Add **Risk Level Badge** to the application detail drawer to inform the approval/rejection process.

## Open Questions

- **Overstay Inference**: Should the risk score attempt to calculate overstays automatically? (I recommend yes, if the travel dates allow for it).
- **Manual Overrides**: Should supervisors be able to manually "flag" or "clear" a risk score? (I recommend a manual "Flag for Review" override).

## Verification Plan

### Automated Tests
1. Test score calculation for a "clean" traveler (expected: Low).
2. Test score calculation for a traveler with a watchlist hit (expected: Critical).

### Manual Verification
1. Search for a traveler in **National Immigration Query**.
2. Click on their name to view the new **Unified Profile**.
3. Verify the **Risk Score** accurately reflects their history.
4. Mock a border crossing and verify the **Risk Alert** appears in real-time.
