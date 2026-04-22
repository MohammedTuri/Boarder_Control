import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcrypt';
import 'dotenv/config';

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  : new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'ics_db',
      password: process.env.DB_PASSWORD || 'root',
      port: parseInt(process.env.DB_PORT) || 5433
    });

async function runSeed() {
  try {
    console.log('Starting seed process...');

    // 1. Create Schema if it doesn't exist
    console.log('Seed: Initializing schema...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        agent_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        reference_number VARCHAR(50) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        passport_number VARCHAR(50) NOT NULL,
        nationality VARCHAR(100) NOT NULL,
        dob DATE NOT NULL,
        purpose VARCHAR(100),
        travel_date DATE,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS crossings (
        id SERIAL PRIMARY KEY,
        passport VARCHAR(50) NOT NULL,
        full_name VARCHAR(200) NOT NULL,
        nationality VARCHAR(100) NOT NULL,
        dob DATE NOT NULL,
        expiry DATE,
        type VARCHAR(20) NOT NULL,
        point_of_entry VARCHAR(100),
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS watchlist (
        id SERIAL PRIMARY KEY,
        passport VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(200) NOT NULL,
        reason TEXT,
        risk_level VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS biometric_archive (
        id SERIAL PRIMARY KEY,
        passport VARCHAR(50) UNIQUE NOT NULL,
        signature_hash TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Seed: Schema initialized.');

    // 2. Clean the tables
    await pool.query('TRUNCATE users, applications, crossings, watchlist RESTART IDENTITY CASCADE');
    console.log('Seed: Tables truncated.');

    // 3. Create a few users
    const defaultPassword = await bcrypt.hash('password123', 10);
    
    await pool.query(`
      INSERT INTO users (agent_id, name, role, password_hash)
      VALUES 
        ('ADM-001', 'Almaz Tadesse', 'Administrator', $1),
        ('SUP-142', 'Dawit Mekonnen', 'Supervisor', $1),
        ('AGT-882', 'Kalkidan Girma', 'Officer', $1)
    `, [defaultPassword]);
    console.log('Seed: Users created.');

    // 4. Create some applications
    await pool.query(`
      INSERT INTO applications (reference_number, first_name, last_name, passport_number, nationality, dob, purpose, travel_date, status)
      VALUES 
        ('APP-81203X', 'Ahmed', 'Ousmane', 'P8812932X', 'Senegal', '1985-04-12', 'Tourism', '2026-05-01', 'Approved'),
        ('APP-10293Y', 'Sarah', 'Jenkins', 'GB1293812', 'United Kingdom', '1990-11-20', 'Business', '2026-04-15', 'Pending')
    `);
    console.log('Seed: Applications created.');

    // 5. Create initial watchlist
    await pool.query(`
      INSERT INTO watchlist (passport, full_name, reason, risk_level)
      VALUES 
        ('EP1234567', 'Marcus Vane', 'Suspected of illicit trade activities', 'High'),
        ('US9876543', 'Elena Rodriguez', 'Wanted for questioning by federal authorities', 'Critical')
    `);
    console.log('Seed: Watchlist entries created.');

    // 6. Create some crossings
    await pool.query(`
      INSERT INTO crossings (passport, full_name, nationality, dob, expiry, type, point_of_entry, status, created_at)
      VALUES 
        ('P8812932X', 'Ahmed Ousmane', 'Senegal', '1985-04-12', '2030-01-01', 'Entry', 'Addis Ababa (Bole)', 'Cleared', NOW() - INTERVAL '2 hours'),
        ('GB1293812', 'Sarah Jenkins', 'United Kingdom', '1990-11-20', '2030-11-20', 'Entry', 'Addis Ababa (Bole)', 'Cleared', NOW() - INTERVAL '5 hours'),
        ('EP1234567', 'Marcus Vane', 'USA', '1975-06-15', '2030-06-15', 'Entry', 'Moyale', 'Flagged', NOW() - INTERVAL '8 hours'),
        ('FR5566778', 'Marie Dupont', 'France', '1992-03-10', '2031-03-10', 'Entry', 'Togochale', 'Cleared', NOW() - INTERVAL '12 hours'),
        ('ET9900112', 'Abebe Bikila', 'Ethiopia', '1980-08-01', '2030-08-01', 'Exit', 'Addis Ababa (Bole)', 'Cleared', NOW() - INTERVAL '1 hour')
    `);
    console.log('Seed: Crossings records created.');

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed();
