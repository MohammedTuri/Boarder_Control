import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

// The Neon database URL from your environment or manually pasted here if needed.
// We'll use the one from Render. I'll ask the user to provide it or we can just 
// run this if they have it in their local .env file.
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:F1S0DInpAmdO@ep-hidden-cloud-alm3op0e.eu-central-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function resetDB() {
  try {
    console.log('Dropping old broken tables...');
    await pool.query(`
      DROP TABLE IF EXISTS users, applications, crossings, watchlist, biometric_archive, notifications, audit_logs CASCADE;
    `);
    console.log('Tables dropped successfully! The next seed run will recreate them properly.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

resetDB();
