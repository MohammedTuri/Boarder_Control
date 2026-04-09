# Migration & Deployment Checklist

- [x] **Phase 1: Local Migration**
    - [x] Run `robocopy` to mirror source code to `D:\ICS-BOARDER`.
    - [x] Exclude `node_modules` and metadata/logs.
- [x] **Phase 2: Deployment Configuration**
    - [x] Create `deploy.md` with Render/Vercel instructions.
    - [x] Create `.env.example` templates for backend and frontend.
    - [x] Create database export script (`export_db.ps1`).
- [x] **Phase 3: Verification**
    - [x] Confirm file presence on Drive D:.
    - [x] Verify `deploy.md` accessibility.
