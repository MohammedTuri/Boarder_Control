# Implementation Plan: Phase 4 - Digital Mission Documents (e-Visa Issuance)

The final mission objective is to close the gap between **Adjudication** and **Issuance**. Currently, applications are approved in the system, but the traveler does not receive a formal document. Phase 4 introduces a professional e-Visa issuance system.

## User Review Required

> [!IMPORTANT]
> The **e-Visa** will be a high-fidelity, downloadable document (HTML/PDF format) featuring secure elements like a simulated QR Code and digital signatures.

> [!TIP]
> This feature will be integrated into the **Public Status Portal**, allowing travelers to self-serve their approved documents without officer intervention.

## Proposed Changes

### 🛡️ Secure Document Generation

#### [NEW] [VisaDocument.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/VisaDocument.jsx)
- **Official Template**: A premium, dark-mode/light-mode compatible visa document.
- **Security Elements**: Includes Passport Photo, Barcode, QR Code (pointing to verification URL), and official ICS Seal.
- **Print Optimization**: Styled for high-quality PDF/Paper output.

### 🛂 Admin & Public Integration

#### [MODIFY] [ApplicationReview.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/ApplicationReview.jsx)
- **Issuance Action**: Add an "Issue e-Visa" button to the detail drawer for all "Approved" applications.
- **Preview Mode**: Allow officers to preview the document before final notification.

#### [MODIFY] [Status.jsx](file:///c:/Users/Mohammed/.gemini/antigravity/ics-frontend/src/pages/public/Status.jsx)
- **Self-Service Download**: If an application is "Approved", the status tracker will now provide a prominent "Download your e-Visa" button.

### 🧠 Backend Documentation Logic

#### [MODIFY] [server.js](file:///c:/Users/Mohammed/.gemini/antigravity/ics-backend/server.js)
- **Issuance Audit**: Log every document generation event in the forensic audit trail.
- **Verification Endpoint**: A new public endpoint `/api/verify/:reference` that the e-Visa QR code points to, allowing anyone to verify the document's authenticity.

## Open Questions

- **Layout Style**: Should the e-Visa follow the dark-mode aesthetic of the command center, or a traditional "Government White" for printing? (I recommend a clean, "Official White/Gold" for better print compatibility).
- **Security**: Should we add an "Expiry Date" for the download link itself?

## Verification Plan

### Automated Tests
1. Verify that an application must be in "Approved" status for the download button to appear.
2. Verify that the QR code link correctly points to the verification service.

### Manual Verification
1. Submit a public visa application.
2. Approve it in the Admin Command Center.
3. Visit the Public Status Portal and verify the "Download e-Visa" button works.
4. Open the generated document and verify its visual fidelity.
