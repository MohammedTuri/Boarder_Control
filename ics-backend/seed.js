import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcrypt';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
    console.log('Seed: Initializing schema from schema.sql...');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const schemaPath = path.join(__dirname, 'schema.sql');
    
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSql);
      console.log('Seed: Schema initialized from file.');
    } else {
      console.error('CRITICAL ERROR: schema.sql not found! Cannot initialize database.');
      process.exit(1);
    }

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
