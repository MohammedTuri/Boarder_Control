# Goal Description

The objective is to develop a high-fidelity, real-world web prototype for the Ethiopian Immigration and Citizenship Service (ICS) to manage land border control. This application will feature a premium, highly secure "Command Center" aesthetic employing dark-mode glassmorphism, dynamic micro-animations, and live data visualizations. It will allow border agents to securely process traveler entries/exits, monitor watchlists, and view crossing histories.

## User Review Required

> [!IMPORTANT]
> Because you requested that project files be written to your preferred workspace, I will initialize the Vite React project at `c:\Users\Mohammed\.gemini\ics-frontend` instead of your Desktop. Please confirm this location is acceptable.

## Proposed Changes

---

### Project Initialization

#### [NEW] `c:/Users/Mohammed/.gemini/ics-frontend`
- Create a new React application using Vite (`npx -y create-vite@latest ics-frontend --template react`).
- Install necessary dependencies including `react-router-dom` for navigation, `lucide-react` for premium iconography, and `recharts` for complex data visualizations.
- Clean up default Vite boilerplate (e.g., remove default logos and default `App.css` styles).

---

### Core UI Layout & Theming

#### [MODIFY] `ics-frontend/src/index.css`
- Engineer a structural **Dark Mode Glassmorphism** aesthetic. Use deep space-navy and black color palettes along with neon-emerald and gold accents.
- Implement frosted acrylic components using `backdrop-filter: blur(16px)` and dynamic CSS glows/shadows for interactive elements.

#### [NEW] `ics-frontend/src/components/Layout.jsx`, `Sidebar.jsx`, `Header.jsx`
- Build a global responsive layout.
- Include a live, ticking **UTC System Clock** integrated seamlessly into the Header alongside operational status tags to simulate a real-world command center.

---

### Dashboard Implementation

#### [NEW] `ics-frontend/src/pages/Dashboard.jsx`
- Construct top-level statistics cards (e.g., Total Entries, Watchlist Hits) featuring smooth drop-in animations and neon hover glows.
- Integrate **Recharts** to render an interactive area chart projecting crossing volume trends over 24 hours.
- Build a "Recent Crossings" summary table.

---

### Traveler Processing & Watchlist

#### [NEW] `ics-frontend/src/pages/Processing.jsx`
- Design a high-security form for Passport/MRZ data entry.
- Build an interactive "dropzone" to accept traveler photo uploads.
- Implement local validation logic and simulated state persistence (mock database) so you can fully interact with the prototype.
- Integrate an alert/interception system to warn the user if a scanned individual matches a mock watchlist database.

#### [NEW] `ics-frontend/src/pages/History.jsx`
- Render a comprehensive chronological table of all processed travelers, integrating any uploaded thumbnails and detailed crossing metadata.

## Open Questions

- Should I include sample code to connect this React frontend to a Node.js/PostgreSQL backend in the future (as alluded to in some of your previous project histories)? For now, I will build out the frontend as a fully functional standalone prototype using local state/browser storage for mock persistence.

## Verification Plan

### Automated Tests
- N/A

### Manual Verification
1. I will boot up the Vite frontend development server locally.
2. I will ask you to navigate through the Dashboard, submit a mock traveler crossing in the Processing tab, and verify that the Watchlist intercept triggers correctly.
3. You will verify that the layout achieves the required "premium command center" visual specifications.
