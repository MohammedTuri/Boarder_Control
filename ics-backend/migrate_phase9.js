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
    console.log('Starting migration for Phase 9: Advanced Forensic Intelligence...');
    
    // Create Biometric Archive table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS biometric_archive (
        id SERIAL PRIMARY KEY,
        passport VARCHAR(50) NOT NULL,
        signature_hash VARCHAR(64) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create unique index to speed up conflict lookups (simplified for demo)
    await pool.query('CREATE INDEX IF NOT EXISTS idx_biometric_signature ON biometric_archive(signature_hash);');

    console.log('Database schema for identity integrity finalized.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
