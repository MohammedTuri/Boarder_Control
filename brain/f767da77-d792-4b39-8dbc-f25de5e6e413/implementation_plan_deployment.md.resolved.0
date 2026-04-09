# Deployment & Automation Plan: ICS Border Control System

This plan outlines the steps to move the ICS Border Control System from local development to a live, production-ready environment using modern cloud hosting and GitHub automation.

## User Review Required

> [!IMPORTANT]
> **Hosting Choice**: I have selected **Vercel** for the frontend and **Render** for the backend/database. These are industry standards that integrate seamlessly with GitHub for free. You will need to create accounts on both [Vercel.com](https://vercel.com) and [Render.com](https://render.com).

> [!WARNING]
> **File Uploads**: Currently, the backend saves uploaded photos (traveler photos) to its local disk. On cloud servers like Render, these files are deleted every time the server restarts or code is updated. For a "Mission Critical" system, we eventually need to move these to a permanent storage service like Cloudinary or S3.

## Proposed Changes

### Phase A: Frontend Deployment (Vercel)
- Create a `vercel.json` configuration to handle single-page application routing.
- Set up the `VITE_API_URL` environment variable in the Vercel dashboard.

### Phase B: Backend & Database Deployment (Render)
- **Database**: Initialize a new PostgreSQL database on Render.
- **Backend**: Deploy the Express server.
- **Config**: Set up Environment Variables (`DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`, `JWT_SECRET`).
- [MODIFY] [server.js](file:///c:/Users/Mohammed/.gemini/antigravity/ics-backend/server.js): Adjust database connection logic to support SSL (required by most cloud databases).

### Phase C: Setup Automation (GitHub Actions)
- [NEW] [.github/workflows/ci.yml](file:///c:/Users/Mohammed/.gemini/antigravity/.github/workflows/ci.yml): Automated linting and build checks to ensure code quality before merging or pushing.

## Open Questions

- Do you have a preference for other hosting providers (e.g., Netlify, Railway, Heroku)?
- Would you like me to create the PostgreSQL migration scripts for the cloud database?

## Verification Plan

### Automated Tests
- GitHub Actions will run `npm run lint` and `npm run build` on every push.
- I will verify the `server.js` starts correctly with mock database environment variables.

### Manual Verification
- After deployment, we will verify:
    1. The frontend loads at its new URL.
    2. The frontend can successfully "Login" by calling the Backend API.
    3. New applications can be submitted and saved to the Cloud Database.
