# Implementation Plan: Traveler Movement Context (Phase 8)

To achieve full operational transparency, traveler processing must include the **Type of Movement** (Entry vs. Exit) and the specific **Point of Entry**. Phase 8 enhances the processing form and database schema to capture this critical forensic metadata.

## User Review Required

> [!IMPORTANT]
> This update involves a **Database Schema Migration**. I will add a `point_of_entry` column to the `crossings` table to ensure historical movements can be audited per station.

> [!TIP]
> The **Point of Entry** will be a curated dropdown list of official Ethiopian Border Posts (e.g., Addis Ababa, Moyale, Metema, etc.), ensuring data standardization.

## Proposed Changes

### 🗄️ Database Evolution

#### [MODIFY] [schema.sql](file:///c:/Users/Mohammed/.gemini/antigravity/ics-backend/schema.sql)
- **Schema Update**: Explicitly add the `point_of_entry` column to the `crossings` table definition.

#### [COMMAND] [Database Migration](file:///c:/Users/Mohammed/.gemini/antigravity/ics-backend/server.js)
- **Live Migration**: Execute an `ALTER TABLE crossings ADD COLUMN point_of_entry VARCHAR(100);` command to update the live production-ready database.

### 🧠 Backend Integration

#### [MODIFY] [server.js](file:///c:/Users/Mohammed/.gemini/antigravity/ics-backend/server.js)
- **Endpoint Update**: Modify the `POST /api/crossings` handler to accept, validate, and persist the `point_of_entry` and `type` fields.
- **Audit Enhancement**: Ensure the audit logs record the movement type for forensic traceability.

### 🛂 Frontend Intelligence

#### [MODIFY] [Processing.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/Processing.jsx)
- **Form Expansion**: Add a new row to the "Document Data" section containing:
  - **Traveler Type**: Dropdown (`Entry` / `Exit`).
  - **Point of Entry**: Dropdown with the curated list of Ethiopian stations.
- **State Management**: Update the `formData` initialization and submission logic to include these new forensic markers.

## Open Questions

- **Default Point**: Should the "Point of Entry" default to the station name set in the system settings? (I recommend this for operational speed).
- **List Scope**: Are there specific regional border posts (e.g., specific to the Somali or Sudanese borders) that must be included beyond the major ones?

## Verification Plan

### Automated Verification
1. Run a test application submission and crossing process.
2. Verify that the `crossings` table now correctly contains the movement type and station name.

### Manual Verification
1. Open the **Traveler Processing** module.
2. Fill out a traveler profile.
3. Select **Exit** and **Moyale** from the new dropdowns.
4. Process the traveler and verify the "CLEARED" status.
5. Check the **Dashboard Mission Feed** to see the enriched movement record.
