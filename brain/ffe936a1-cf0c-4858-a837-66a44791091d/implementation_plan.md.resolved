# Migration & Deployment Plan - ICS Border Control System

The objective is to migrate the entire system codebase to a high-performance local directory (`D:\ICS-BOARDER`) and prepare it for online production deployment.

## User Review Required

> [!IMPORTANT]
> **Drive D: Space Check**: Please ensure Drive D: has at least 5GB of free space if you wish to include all assets.
> **Environment Secrets**: The migration will copy `.env` files. Ensure these are updated with production credentials before publishing to any public repository.

## Proposed Changes

### [System Migration](file:///D:/ICS-BOARDER)

#### [NEW] Local Migration to D:\ICS-BOARDER
- **Tool**: Use `robocopy` for a high-speed mirror of the project.
- **Exclusions**: `node_modules`, `brain`, `scratch`, `conversations`, and `html_artifacts` will be excluded to ensure a clean, deployable codebase.
- **Retention**: All source code (`src`, `server.js`, `package.json`) and configuration files will be preserved.

### [Deployment Preparation](file:///c:/Users/Mohammed/.gemini/antigravity/deploy.md)

#### [NEW] [deploy.md](file:///c:/Users/Mohammed/.gemini/antigravity/deploy.md)
- **Production Roadmap**: Detailed instructions for deploying to **Render** (Backend) and **Vercel/Netlify** (Frontend).
- **Database Strategy**: Guidance on setting up a managed PostgreSQL instance (e.g., Supabase or Render Postgres).
- **Environment Templates**: Creation of `.env.example` files to facilitate secure configuration during deployment.

## Open Questions

1. **Database Persistence**: Do you want me to include a script to export the current local `ics_db` data for import into the online production database?
2. **Hosting Preference**: Do you have a preferred cloud provider (e.g., AWS, Azure, Render, Heroku)?

## Verification Plan

### Manual Verification
- Verify the existence of `D:\ICS-BOARDER\ics-backend` and `D:\ICS-BOARDER\ics-frontend`.
- Confirm that `npm install` runs successfully in the new directory.
- Validate that the `deploy.md` roadmap covers all necessary infrastructure steps.
