import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcrypt';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ics_db',
  password: 'root',
  port: 5433,
});

async function runSeed() {
  try {
    console.log('Starting seed process...');

    // 0. Clean the tables
    await pool.query('TRUNCATE users, applications, crossings, watchlist RESTART IDENTITY CASCADE');
    console.log('Seed: Tables truncated.');

    // 1. Create a few users
    const defaultPassword = await bcrypt.hash('password123', 10);
    
    await pool.query(`
      INSERT INTO users (agent_id, name, role, password_hash)
      VALUES 
        ('ADM-001', 'Almaz Tadesse', 'Administrator', $1),
        ('SUP-142', 'Dawit Mekonnen', 'Supervisor', $1),
        ('AGT-882', 'Kalkidan Girma', 'Officer', $1)
    `, [defaultPassword]);

    console.log('Seed: Users created.');

    // 2. Create some applications
    await pool.query(`
      INSERT INTO applications (reference_number, first_name, last_name, passport_number, nationality, dob, purpose, travel_date, status)
      VALUES 
        ('APP-81203X', 'Ahmed', 'Ousmane', 'P8812932X', 'Senegal', '1985-04-12', 'Tourism', '2026-05-01', 'Approved'),
        ('APP-10293Y', 'Sarah', 'Jenkins', 'GB1293812', 'United Kingdom', '1990-11-20', 'Business', '2026-04-15', 'Pending')
    `);

    console.log('Seed: Applications created.');

    // 3. Create initial watchlist
    await pool.query(`
      INSERT INTO watchlist (passport, full_name, reason, risk_level)
      VALUES 
        ('EP1234567', 'Marcus Vane', 'Suspected of illicit trade activities', 'High'),
        ('US9876543', 'Elena Rodriguez', 'Wanted for questioning by federal authorities', 'Critical')
    `);

    console.log('Seed: Watchlist entries created.');

    // 4. Create some crossings with point_of_entry
    await pool.query(`
      INSERT INTO crossings (passport, full_name, nationality, dob, expiry, type, point_of_entry, status, created_at)
      VALUES 
        ('P8812932X', 'Ahmed Ousmane', 'Senegal', '1985-04-12', '2030-01-01', 'Entry', 'Addis Ababa (Bole)', 'Cleared', NOW() - INTERVAL '2 hours'),
        ('GB1293812', 'Sarah Jenkins', 'United Kingdom', '1990-11-20', '2030-11-20', 'Entry', 'Addis Ababa (Bole)', 'Cleared', NOW() - INTERVAL '5 hours'),
        ('EP1234567', 'Marcus Vane', 'USA', '1975-06-15', '2030-06-15', 'Entry', 'Moyale', 'Flagged', NOW() - INTERVAL '8 hours'),
        ('FR5566778', 'Marie Dupont', 'France', '1992-03-10', '2031-03-10', 'Entry', 'Togochale', 'Cleared', NOW() - INTERVAL '12 hours'),
        ('ET9900112', 'Abebe Bikila', 'Ethiopia', '1980-08-01', '2030-08-01', 'Exit', 'Addis Ababa (Bole)', 'Cleared', NOW() - INTERVAL '1 hour'),
        ('ET9900112', 'Abebe Bikila', 'Ethiopia', '1980-08-01', '2030-08-01', 'Entry', 'Galafi', 'Cleared', NOW() - INTERVAL '15 hours'),
        ('CN6677889', 'Li Wei', 'China', '1988-12-05', '2029-12-05', 'Entry', 'Addis Ababa (Bole)', 'Cleared', NOW() - INTERVAL '3 hours'),
        ('IN3344556', 'Priya Sharma', 'India', '1995-02-28', '2032-02-28', 'Entry', 'Dire Dawa (Aba Tenna)', 'Cleared', NOW() - INTERVAL '6 hours')
    `);

    console.log('Seed: Crossings records with points of entry created.');

    // 5. Pre-seed Biometric Archive for conflict testing
    await pool.query(`
      INSERT INTO biometric_archive (passport, signature_hash)
      VALUES 
        ('ETH-ORIGINAL-001', 'SIG-SHARED-ETH-IND-001')
      ON CONFLICT DO NOTHING
    `);
    console.log('Seed: Biometric archive pre-seeded for conflict testing.');

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

runSeed();
