import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ics_db',
  password: 'root',
  port: 5433,
});

async function migrate() {
  try {
    console.log('Starting migration for Phase 8: Traveler Movement Context...');
    await pool.query('ALTER TABLE crossings ADD COLUMN IF NOT EXISTS point_of_entry VARCHAR(100);');
    await pool.query('ALTER TABLE crossings ALTER COLUMN nationality TYPE VARCHAR(50);');
    console.log('Database schema updated successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
