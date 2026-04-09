# Implementation Plan: System Restoration & Context Integration

A critical regression was identified following the Phase 8 update: the **Dashboard** and **National Query** components are crashing due to missing dependency imports and state hooks. This plan restores system stability and ensures the new **Point of Entry** metadata is correctly surfaced in all forensic views.

## User Review Required

> [!IMPORTANT]
> The **Dashboard** is currently inaccessible (blank screen). I will immediately restore the `Shield`, `Globe`, and `Plane` icon dependencies to bring the Command Center back online.

## Proposed Changes

### 🛠️ System Stability Restoration

#### [MODIFY] [Dashboard.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/Dashboard.jsx)
- **Dependency Fix**: Add `Shield`, `Globe`, and `Plane` to the `lucide-react` import list.
- **Robust Rendering**: Update the mission feed to handle potentially missing `point_of_entry` data gracefully.

#### [MODIFY] [TravelerSearch.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/TravelerSearch.jsx)
- **Hook Restoration**: Add `useState` and `useEffect` to the `react` import (currently missing).
- **Context Enhancement**: Update the search results to display the "Type" and "Point of Entry" for matching profiles.

### 🍱 Forensic Context Integration

#### [MODIFY] [TravelerProfile.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/TravelerProfile.jsx)
- **Dynamic Station Tracking**: Replace the hardcoded "STN-01" label with the dynamic `point_of_entry` from the traveler's movement history.
- **Timeline Enrichment**: Ensure the Integrated History Timeline clearly shows the crossing direction (Entry/Exit) and the station name.

## Open Questions

- **Historic Records**: For records created before Phase 8 (which have no `point_of_entry`), should we display "Legacy/Unknown" or the default "Addis Ababa (Bole)"? (I recommend "Legacy Station" for forensic accuracy).

## Verification Plan

### Automated Verification
1.  **Stability Check**: Run a browser subagent to verify that the Dashboard loads without a blank screen.
2.  **Logic Check**: Verify that `TravelerSearch` successfully runs a query for the TEST12345 record and shows "Moyale".

### Manual Verification
1.  Open the **Dashboard** and confirm the Mission Integrity Feed is visible.
2.  Search for traveler "**ADANECH ABEBE**" in the National Query.
3.  Open her **Forensic Profile** and confirm the timeline item shows "Moyale (Kenyan Border)".
