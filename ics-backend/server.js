import { resolve4 } from 'node:dns/promises';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import pkg from 'pg';
const { Pool } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'ics_secure_command_center_2026';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// PostgreSQL Connection Pool
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 20
    })
  : new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'ics_db',
      password: process.env.DB_PASSWORD || 'root',
      port: process.env.DB_PORT || 5433
    });

// Handle pool errors to prevent crashes
pool.on('error', (err) => {
  console.error('ICS: Database pool error:', err.message);
});

// Auto-initialize Audit & Notification Tables and Core Schema
const initDb = async () => {
  try {
    // 1. First, always ensure schema exists
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSql);
      console.log('Forensic systems initialized. Database schema verified.');
    }

    // 2. Migration Guard: Check if users table is populated
    const checkUsers = await pool.query("SELECT COUNT(*) FROM users");
    if (parseInt(checkUsers.rows[0].count) === 0) {
      console.warn('WARNING: The "users" table is empty. You must seed the database.');
      console.warn('Attempting to automatically run seed process...');
      try {
         const { execSync } = await import('child_process');
         execSync('npm run db:seed', { stdio: 'inherit', env: process.env });
         console.log('Auto-seed completed.');
      } catch (seedErr) {
         console.error('Auto-seed failed:', seedErr.message);
      }
    } else {
      console.log('Database integrity verified: Users table populated.');
    }
  } catch (err) {
    console.error('ICS MISSION CONTROL: Database initialization failed!', err);
  }
};
initDb();

// Audit Logger Helper
const auditLog = async (req, action, details) => {
  const agentId = req.user?.id || 'SYSTEM';
  const ip = req.ip || req.connection.remoteAddress;
  try {
    await pool.query(
      'INSERT INTO audit_logs (agent_id, action, details, ip_address) VALUES ($1, $2, $3, $4)',
      [agentId, action, JSON.stringify(details), ip]
    );
  } catch (err) {
    console.error('CRITICAL: Audit logging failed:', err);
  }
};

app.use(cors({
  origin: ['https://boarder-control-one.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'Administrator') {
    return res.status(403).json({ error: 'Administrative clearance required' });
  }
  next();
};

// Set up Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// --- AUTH ROUTES ---

app.post('/api/login', async (req, res) => {
  try {
    const { agentId, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE agent_id = $1', [agentId.toUpperCase()]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const token = jwt.sign(
      { id: user.id, agentId: user.agent_id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        agentId: user.agent_id,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- PUBLIC ROUTES ---

app.post('/api/applications', upload.single('document'), async (req, res) => {
  try {
    const { firstName, lastName, passportNumber, nationality, dob, purpose, travelDate } = req.body;
    const refNum = `APP-${Math.floor(100000 + Math.random() * 900000)}X`;
    
    const result = await pool.query(
      `INSERT INTO applications (reference_number, first_name, last_name, passport_number, nationality, dob, purpose, travel_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [refNum, firstName, lastName, passportNumber, nationality, dob, purpose, travelDate]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/applications/status/:refNum', async (req, res) => {
  try {
    const { refNum } = req.params;
    const { passport } = req.query;

    const result = await pool.query(
      'SELECT reference_number, first_name, last_name, status, created_at FROM applications WHERE reference_number = $1 AND passport_number = $2',
      [refNum, passport]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/visa/pre-approval/:refNum', async (req, res) => {
  try {
    const { refNum } = req.params;
    const result = await pool.query('SELECT * FROM applications WHERE reference_number = $1', [refNum]);
    if (result.rows.length === 0) return res.status(404).send('<h1>Certificate Not Found</h1>');
    
    const app = result.rows[0];
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ICS Document - ${app.reference_number}</title>
        <style>
          body { font-family: 'Arial', sans-serif; padding: 40px; background: #f8fafc; color: #1e293b; }
          .certificate { background: white; border: 2px solid #1c519d; border-radius: 12px; padding: 40px; max-width: 800px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #1c519d; margin: 0 0 10px 0; }
          .header p { color: #64748b; margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; }
          .content { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .field { margin-bottom: 20px; }
          .field label { display: block; font-size: 12px; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; font-weight: bold; }
          .field .val { font-size: 18px; font-weight: bold; color: #0f2c57; }
          .status { grid-column: 1 / -1; text-align: center; margin-top: 30px; padding: 20px; background: #f0fdf4; border: 1px solid #16a34a; border-radius: 8px; color: #16a34a; font-weight: bold; font-size: 24px; text-transform: uppercase; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; }
          @media print { body { background: white; padding: 0; } .certificate { border: none; box-shadow: none; } }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">
            <h1>ICS Gateway Official Document</h1>
            <p>Federal Democratic Republic of Ethiopia</p>
          </div>
          <div class="content">
            <div class="field"><label>Reference Number</label><div class="val">${app.reference_number}</div></div>
            <div class="field"><label>Issue Date</label><div class="val">${new Date().toLocaleDateString()}</div></div>
            <div class="field"><label>Full Name</label><div class="val">${app.first_name} ${app.last_name}</div></div>
            <div class="field"><label>Passport Number</label><div class="val">${app.passport_number}</div></div>
            <div class="field"><label>Nationality</label><div class="val">${app.nationality}</div></div>
            <div class="field"><label>Purpose of Visit</label><div class="val">${app.purpose}</div></div>
            <div class="status">${app.status}</div>
          </div>
          <div class="footer">
            <p>This document is electronically generated and serves as official proof of application processing.</p>
            <p>&copy; ${new Date().getFullYear()} Immigration and Citizenship Service. All rights reserved.</p>
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


// --- ADMIN SECURE ROUTES ---

app.get('/api/crossings', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, passport, nationality, type } = req.query;
    let query = 'SELECT * FROM crossings WHERE 1=1';
    const params = [];

    if (startDate) {
      params.push(startDate);
      query += ` AND created_at >= $${params.length}`;
    }
    if (endDate) {
      params.push(`${endDate} 23:59:59`);
      query += ` AND created_at <= $${params.length}`;
    }
    if (passport) {
      params.push(`%${passport.toUpperCase()}%`);
      query += ` AND passport ILIKE $${params.length}`;
    }
    if (nationality) {
      params.push(`%${nationality.toUpperCase()}%`);
      query += ` AND nationality ILIKE $${params.length}`;
    }
    if (type) {
      params.push(type);
      query += ` AND type = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC LIMIT 500';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/crossings', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    const { passport, fullName, nationality, dob, expiry, type, pointOfEntry } = req.body;
    const photoPath = req.file ? req.file.path : null;

    // 1. Biometric Check (Simulated Forensic Engine)
    const biometric = await calculateBiometricMatch(passport, !!photoPath);
    if (biometric.status === 'Identity Conflict') {
       return res.status(409).json({ error: 'CRITICAL ID CONFLICT: Biometric signature already associated with another document.', conflict: biometric.conflict });
    }

    // 2. Watchlist check
    const watchlistResult = await pool.query('SELECT * FROM watchlist WHERE UPPER(passport) = UPPER($1)', [passport]);
    const status = watchlistResult.rows.length > 0 ? 'Flagged' : 'Cleared';
    
    // 3. Risk Assessment
    const risk = await calculateRiskScore(passport);

    const result = await pool.query(
      `INSERT INTO crossings (passport, full_name, nationality, dob, expiry, type, point_of_entry, photo_path, status, biometric_status, biometric_score, risk_score, risk_level, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW()) RETURNING *`,
      [passport, fullName, nationality, dob, expiry, type || 'Entry', pointOfEntry || 'Addis Ababa (Bole)', photoPath, status, biometric.status, biometric.score, risk.score, risk.level]
    );

    const record = result.rows[0];
    await auditLog(req, 'BIOMETRIC_CHECK', { passport, status: biometric.status, score: biometric.score, riskLevel: risk.level });

    // Auto-enroll biometric signature into archive if cleared
    if (biometric.status === 'Verified') {
      await pool.query(
        'INSERT INTO biometric_archive (passport, signature_hash) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [passport, biometric.signature]
      );
    }

    res.status(201).json({ ...record, biometric });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/applications', authenticateToken, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT * FROM applications WHERE 1=1';
    const params = [];

    if (status && status !== 'All') {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    if (search) {
      params.push(`%${search.toUpperCase()}%`);
      query += ` AND (passport_number ILIKE $${params.length} OR first_name ILIKE $${params.length} OR last_name ILIKE $${params.length} OR reference_number ILIKE $${params.length})`;
    }

    query += ' ORDER BY created_at DESC LIMIT 500';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/applications/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM applications WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.patch('/api/applications/:id/status', authenticateToken, async (req, res) => {
  if (!['Administrator', 'Supervisor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient clearance for visa adjudication' });
  }
  const { status, reason } = req.body;
  const validStatuses = ['Pending', 'Approved', 'Rejected', 'Under Review'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }
  try {
    const existing = await pool.query('SELECT * FROM applications WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    const app = existing.rows[0];
    const result = await pool.query(
      'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    await auditLog(req, 'VISA_STATUS_CHANGED', {
      applicationId: app.reference_number,
      applicant: `${app.first_name} ${app.last_name}`,
      passport: app.passport_number,
      previousStatus: app.status,
      newStatus: status,
      reason: reason || 'No reason provided'
    });
    // Auto-log automated communication dispatch
    await pool.query(
      'INSERT INTO notifications (application_id, type, recipient) VALUES ($1, $2, $3)',
      [req.params.id, `Visa ${status}`, `${app.first_name[0]}*** ${app.last_name}`]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Visa adjudication failed' });
  }
});

app.get('/api/watchlist', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM watchlist ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/watchlist', authenticateToken, async (req, res) => {
  if (!['Administrator', 'Supervisor'].includes(req.user.role)) return res.status(403).json({ error: 'Unauthorized' });
  const { passport, fullName, nationality, reason, riskLevel } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO watchlist (passport, full_name, nationality, reason, risk_level) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [passport, fullName, nationality || 'ETH', reason, riskLevel]
    );
    await auditLog(req, 'WATCHLIST_ENTRY_ADDED', { passport, fullName, riskLevel });
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Watchlist operation failed' });
  }
});

app.delete('/api/watchlist/:id', authenticateToken, async (req, res) => {
  if (!['Administrator', 'Supervisor'].includes(req.user.role)) return res.status(403).json({ error: 'Unauthorized' });
  try {
    const entry = await pool.query('SELECT * FROM watchlist WHERE id = $1', [req.params.id]);
    await pool.query('DELETE FROM watchlist WHERE id = $1', [req.params.id]);
    if (entry.rows[0]) {
      await auditLog(req, 'WATCHLIST_ENTRY_REMOVED', { passport: entry.rows[0].passport, name: entry.rows[0].full_name });
    }
    res.json({ message: 'Watchlist subject removed' });
  } catch (error) {
    res.status(500).json({ error: 'Deletion failed' });
  }
});

app.get('/api/audit', authenticateToken, async (req, res) => {
  if (req.user.role !== 'Administrator') return res.status(403).json({ error: 'Admin Clearance Required' });
  try {
    const result = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Audit retrieval failed' });
  }
});

app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, agent_id, name, role, status, created_at FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'Administrator') return res.status(403).json({ error: 'Denied' });
  const { agentId, name, role, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (agent_id, name, role, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, agent_id, name, role',
      [agentId.toUpperCase(), name, role, hash]
    );
    await auditLog(req, 'PERSONNEL_CREATED', { targetId: agentId, name, role });
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Personnel registration failed' });
  }
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'Administrator') return res.status(403).json({ error: 'Denied' });
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    const targetUser = userRes.rows[0];
    if (targetUser) {
      await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
      await auditLog(req, 'PERSONNEL_DECOMMISSIONED', { agentId: targetUser.agent_id, name: targetUser.name });
    }
    res.json({ message: 'Personnel record removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to decommission personnel' });
  }
});

app.get('/api/search', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json({ profile: null, history: [], applications: [] });

    const q = `%${query.toUpperCase()}%`;
    
    // Search in crossings (Primary profile source)
    const crossings = await pool.query(
      'SELECT DISTINCT ON (passport) * FROM crossings WHERE passport ILIKE $1 OR full_name ILIKE $1 ORDER BY passport, created_at DESC',
      [q]
    );

    // Search in applications
    const applications = await pool.query(
      'SELECT * FROM applications WHERE passport_number ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1 ORDER BY created_at DESC',
      [q]
    );

    // Watchlist check
    const watchlist = await pool.query(
      'SELECT * FROM watchlist WHERE passport ILIKE $1 OR full_name ILIKE $1',
      [q]
    );

    // All crossing history for the found passport(s)
    let history = [];
    if (crossings.rows.length > 0) {
      const passports = crossings.rows.map(r => r.passport);
      const historyRes = await pool.query(
        'SELECT * FROM crossings WHERE passport = ANY($1) ORDER BY created_at DESC',
        [passports]
      );
      history = historyRes.rows;
    }

    res.json({
      profile: crossings.rows[0] ? {
        ...crossings.rows[0],
        photo_url: crossings.rows[0].photo_path ? `/uploads/${path.basename(crossings.rows[0].photo_path)}` : null
      } : null,
      history,
      applications: applications.rows,
      watchlist: watchlist.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Search and other utilities here...

app.post('/api/settings/password', authenticateToken, async (req, res) => {
  try {
    const { current, newPass } = req.body;
    
    // Get current user
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    // Verify current
    const valid = await bcrypt.compare(current, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Incorrect current passcode' });

    // Hash and update
    const hashed = await bcrypt.hash(newPass, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashed, req.user.id]);
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update passcode' });
  }
});

app.get('/api/reports/applications', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, status, nationality, purpose } = req.query;
    let query = 'SELECT * FROM applications WHERE 1=1';
    const params = [];

    if (startDate) {
      params.push(startDate);
      query += ` AND created_at >= $${params.length}`;
    }
    if (endDate) {
      params.push(`${endDate} 23:59:59`);
      query += ` AND created_at <= $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    if (nationality) {
      params.push(`%${nationality.toUpperCase()}%`);
      query += ` AND nationality ILIKE $${params.length}`;
    }
    if (purpose) {
      params.push(purpose);
      query += ` AND purpose = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC LIMIT 500';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Visa report engine failure' });
  }
});

// --- HARDWARE & LOGISTICS SIMULATION (PHASE 10) ---
const MOCK_MRZ_DATA = [
  { passport: 'EP7722101', nationality: 'GBR', fullName: 'SARAH JENKINS', dob: '1990-11-20', expiry: '2030-11-20' },
  { passport: 'ETH-902123', nationality: 'ETH', fullName: 'ALEMAYEHU BEKELE', dob: '1985-05-14', expiry: '2028-05-14' },
  { passport: 'US8822003', nationality: 'USA', fullName: 'MICHAEL OBRYAN', dob: '1978-12-01', expiry: '2032-12-01' },
  { passport: 'FR5511002', nationality: 'FRA', fullName: 'EMMA DUBOIS', dob: '1995-07-22', expiry: '2029-07-22' }
];

app.get('/api/hardware/status', authenticateToken, (req, res) => {
  res.json({
    doc_reader: 'Online',
    bio_camera: 'Online',
    sys_link: 'Priority-1',
    last_calibration: new Date().toISOString()
  });
});

app.get('/api/hardware/mrz-scan', authenticateToken, (req, res) => {
  const random = MOCK_MRZ_DATA[Math.floor(Math.random() * MOCK_MRZ_DATA.length)];
  res.json(random);
});

app.post('/api/hardware/calibrate', authenticateToken, async (req, res) => {
  await auditLog(req, 'HARDWARE_CALIBRATE', { details: 'Full sensor recalibration performed by officer.' });
  res.json({ message: 'Calibration Success. Status: Online' });
});

app.get('/api/reports/stats', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate || '1970-01-01';
    const end = endDate ? `${endDate} 23:59:59` : new Date().toISOString();

    // Crossings Stats
    const crossingStats = await pool.query(
      `SELECT status, COUNT(*) FROM crossings 
       WHERE created_at BETWEEN $1 AND $2 
       GROUP BY status`,
      [start, end]
    );

    // Application Stats (Visa Requests)
    const applicationStats = await pool.query(
      `SELECT status, COUNT(*) FROM applications 
       WHERE created_at BETWEEN $1 AND $2 
       GROUP BY status`,
      [start, end]
    );

    // Nationality counts (Merged from both for comprehensive origin audit)
    const nationalityStats = await pool.query(
      `SELECT nationality, COUNT(*) FROM (
         SELECT nationality FROM crossings WHERE created_at BETWEEN $1 AND $2
         UNION ALL
         SELECT nationality FROM applications WHERE created_at BETWEEN $1 AND $2
       ) AS combined 
       GROUP BY nationality 
       ORDER BY count DESC LIMIT 10`,
      [start, end]
    );

    // Volume Trends (Time-series data for Area Charts)
    const crossingTrends = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) FROM crossings 
       WHERE created_at BETWEEN $1 AND $2 
       GROUP BY DATE(created_at) 
       ORDER BY date ASC`,
      [start, end]
    );

    const applicationTrends = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) FROM applications 
       WHERE created_at BETWEEN $1 AND $2 
       GROUP BY DATE(created_at) 
       ORDER BY date ASC`,
      [start, end]
    );
    
    // Station-based metrics (High-resolution distribution)
    const stationStats = await pool.query(
      `SELECT point_of_entry as station, COUNT(*) FROM crossings 
       WHERE created_at BETWEEN $1 AND $2 
       GROUP BY point_of_entry 
       ORDER BY count DESC`,
      [start, end]
    );

    res.json({
      crossings: crossingStats.rows,
      applications: applicationStats.rows,
      nationalities: nationalityStats.rows,
      stations: stationStats.rows,
      trends: {
        crossings: crossingTrends.rows,
        applications: applicationTrends.rows
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Reporting engine failure' });
  }
});

app.get('/api/reports/notifications', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = 'SELECT * FROM notifications WHERE 1=1';
    const params = [];
    if (startDate) {
      params.push(startDate);
      query += ` AND created_at >= $${params.length}`;
    }
    if (endDate) {
      params.push(`${endDate} 23:59:59`);
      query += ` AND created_at <= $${params.length}`;
    }
    query += ' ORDER BY created_at DESC LIMIT 500';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Notification report failure' });
  }
});

// Explicit Audit Logging for client-side actions (e.g. Exports)
app.post('/api/audit/log', authenticateToken, async (req, res) => {
  try {
    const { action, details } = req.body;
    await auditLog(req, action, details);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Audit log failed' });
  }
});

app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const totalResult = await pool.query('SELECT COUNT(*) FROM crossings');
    const todayResult = await pool.query("SELECT COUNT(*) FROM crossings WHERE created_at >= CURRENT_DATE");
    const watchlistResult = await pool.query('SELECT COUNT(*) FROM watchlist');
    const alertsResult = await pool.query("SELECT COUNT(*) FROM crossings WHERE status = 'Flagged'");
    const pendingAppsResult = await pool.query("SELECT COUNT(*) FROM applications WHERE status = 'Pending'");
    const totalAppsResult = await pool.query('SELECT COUNT(*) FROM applications');
    const notifyResult = await pool.query('SELECT COUNT(*) FROM notifications');

    res.json({
      total: parseInt(totalResult.rows[0].count),
      today: parseInt(todayResult.rows[0].count),
      watchlist: parseInt(watchlistResult.rows[0].count),
      alerts: parseInt(alertsResult.rows[0].count),
      pendingApplications: parseInt(pendingAppsResult.rows[0].count),
      totalApplications: parseInt(totalAppsResult.rows[0].count),
      totalNotifications: parseInt(notifyResult.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/mission-feed', authenticateToken, async (req, res) => {
  try {
    // Collect last 10 audit logs, last 10 notifications, and last 10 crossings
    const [audits, notifications, crossings] = await Promise.all([
      pool.query('SELECT created_at, action as title, details, agent_id as user_id, \'AUDIT\' as type FROM audit_logs ORDER BY created_at DESC LIMIT 15'),
      pool.query('SELECT created_at, type as title, recipient as details, \'SYSTEM\' as user_id, \'NOTIFY\' as type FROM notifications ORDER BY created_at DESC LIMIT 10'),
      pool.query('SELECT created_at, full_name as title, status as details, passport as user_id, risk_level as priority, \'CROSS\' as type FROM crossings ORDER BY created_at DESC LIMIT 15')
    ]);

    const combined = [
      ...audits.rows,
      ...notifications.rows,
      ...crossings.rows.map(c => ({
        ...c,
        title: c.priority === 'Critical' ? `CRITICAL INTERDICTION: ${c.title}` : c.title
      }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 30);

    res.json(combined);
  } catch (err) {
    console.error('Mission feed failure:', err);
    res.status(500).json({ error: 'Failed to aggregate mission data' });
  }
});

app.get('/api/stats/integrity', authenticateToken, async (req, res) => {
  try {
    const totalCount = await pool.query('SELECT COUNT(*) FROM crossings');
    const total = parseInt(totalCount.rows[0].count) || 1; // Avoid div by zero

    const identityIntegrity = await pool.query("SELECT COUNT(*) FROM crossings WHERE biometric_status = 'Verified'");
    const biometricRate = await pool.query("SELECT COUNT(*) FROM crossings WHERE biometric_score > 0");
    const watchlistHitAccuracy = await pool.query("SELECT COUNT(*) FROM crossings WHERE status = 'Flagged'");
    
    // Simulated Time processing (In production this would be calculated from hardware logs)
    const avgTime = await pool.query("SELECT AVG(risk_score) FROM crossings"); // Using risk score as a proxy for complexity/time

    res.json({
      identityIntegrity: ((parseInt(identityIntegrity.rows[0].count) / total) * 100).toFixed(1),
      biometricRate: ((parseInt(biometricRate.rows[0].count) / total) * 100).toFixed(1),
      watchlistAccuracy: total > 0 ? (94.2 + (Math.random() * 2)).toFixed(1) : 0, // Baseline accuracy simulation
      avgProcessingTime: Math.max(30, Math.min(60, 42 + Math.floor(Math.random() * 10))),
      systemAvailability: 100
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Integrity metrics engine failure' });
  }
});

// --- RISK ASSESSMENT ENGINE (FORENSIC INTELLIGENCE) ---

const calculateRiskScore = async (passport) => {
  let score = 0;
  let factors = [];

  try {
    // 1. Check Watchlist (CRITICAL)
    const watchlist = await pool.query('SELECT * FROM watchlist WHERE passport = $1', [passport]);
    if (watchlist.rows.length > 0) {
      const entry = watchlist.rows[0];
      const weight = entry.risk_level === 'High' ? 100 : 60;
      score += weight;
      factors.push(`CRITICAL: Match found in national watchlist (${entry.risk_level} Priority).`);
    }

    // 2. Check Application History (ELEVATED)
    const applications = await pool.query('SELECT status FROM applications WHERE passport_number = $1', [passport]);
    const rejections = applications.rows.filter(a => a.status === 'Rejected').length;
    if (rejections > 0) {
      score += rejections * 25;
      factors.push(`${rejections} previously rejected visa application(s) detected.`);
    }

    // 3. Check Crossing Frequency & Station Proximity
    const crossings = await pool.query('SELECT created_at, point_of_entry, expiry FROM crossings WHERE passport = $1 ORDER BY created_at DESC', [passport]);
    
    if (crossings.rows.length > 5) {
      score += 15;
      factors.push('High frequency crossing pattern detected (6+ entries).');
    }

    if (crossings.rows.length >= 2) {
      const last = crossings.rows[0];
      const prev = crossings.rows[1];
      // If different stations and within short time (e.g. 2 hours) - potential multi-point entry attempt
      const timeDiff = (new Date(last.created_at) - new Date(prev.created_at)) / (1000 * 3600);
      if (last.point_of_entry !== prev.point_of_entry && timeDiff < 4) {
        score += 40;
        factors.push(`Anomalous Mobility: Detected at multiple border points (${prev.point_of_entry} -> ${last.point_of_entry}) within ${timeDiff.toFixed(1)} hours.`);
      }
    }

    // 4. Station Anomaly (Multiple border points over time)
    const uniqueStations = new Set(crossings.rows.map(c => c.point_of_entry)).size;
    if (uniqueStations > 3) {
      score += 20;
      factors.push(`Regional Distribution: Entry/Exit patterns spanning ${uniqueStations} different border stations.`);
    }

    // 5. Document Proximity
    if (crossings.rows[0]?.expiry) {
      const expiryDate = new Date(crossings.rows[0].expiry);
      const daysToExpiry = (expiryDate.getTime() - Date.now()) / (1000 * 3600 * 24);
      if (daysToExpiry < 30 && daysToExpiry > 0) {
        score += 30;
        factors.push('Forensic Alert: Travel document expires in less than 30 days.');
      }
    }

    if (applications.rows.some(a => a.status === 'Under Review')) {
      score += 10;
      factors.push('Note: Active visa application currently under second-tier forensic review.');
    }

    // 6. Determine Level
    let level = 'Low';
    if (score >= 75) level = 'Critical';
    else if (score >= 40) level = 'High';
    else if (score >= 20) level = 'Elevated';

    return { score, level, factors };
  } catch (err) {
    console.error('Risk calculation failure:', err);
    return { score: 0, level: 'Unknown', factors: ['Internal integrity check failure.'] };
  }
};

// --- BIOMETRIC FORENSIC ENGINE (SIMULATED) ---
const calculateBiometricMatch = async (passport, photoProvided) => {
  if (!photoProvided) return { score: 0, status: 'Not Performed', details: 'No biometric signature detected.' };
  
  // Simulated signature generation (Demo: specific prefix logic)
  let signature = `SIG-${Buffer.from(passport).toString('hex').slice(0, 12)}`;
  if (passport.startsWith('ETH-')) {
    signature = 'SIG-SHARED-ETH-IND-001'; // Constant signature to trigger conflict
  }

  // Forensic Archive Lookup
  const archive = await pool.query('SELECT * FROM biometric_archive WHERE signature_hash = $1', [signature]);
  const conflicts = archive.rows.filter(r => r.passport.toUpperCase() !== passport.toUpperCase());

  if (conflicts.length > 0) {
    return {
      score: 100,
      status: 'Identity Conflict',
      details: 'CRITICAL: This biometric signature is already registered to a different passport document in the national archives.',
      conflict: conflicts[0].passport,
      signature
    };
  }

  let score = 98.2;
  let status = 'Verified';
  let details = 'Strong match against National Passport Archive.';

  if (passport.startsWith('EPX')) {
    score = 42.1;
    status = 'Anomaly Detected';
    details = 'Biometric signature mismatch. Identity conflict found in historical records.';
  } else if (passport.includes('123')) {
    score = 88.4;
    status = 'Low Confidence';
    details = 'Partial biometric match. Secondary identity verification recommended.';
  }

  return { score, status, details, signature };
};

app.get('/api/biometric/check/:passport', authenticateToken, async (req, res) => {
  const { passport } = req.params;
  const result = await calculateBiometricMatch(passport, true);
  res.json(result);
});

// Public e-Visa Verification Service (for QR Codes)
app.get('/api/verify/visa/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    const result = await pool.query(
      'SELECT first_name, last_name, passport_number, status, created_at, travel_date FROM applications WHERE reference_number = $1',
      [reference]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'AUTHENTICITY FAILED: Document reference not found in national archives.' });
    }

    const visa = result.rows[0];
    
    // Log issuance event if not already logged recently (simplified)
    await pool.query(
      'INSERT INTO notifications (application_id, type, recipient) VALUES ((SELECT id FROM applications WHERE reference_number = $1), $2, $3)',
      [reference, 'Document Issued', `${visa.first_name[0]}***${visa.last_name}`]
    );

    res.json({
      valid: visa.status === 'Approved',
      holder: `${visa.first_name[0]}*** ${visa.last_name}`,
      document: `PN-***${visa.passport_number.slice(-3)}`,
      status: visa.status,
      issued: visa.created_at,
      expiry: visa.travel_date // Simplified expiry for demo
    });
  } catch (err) {
    res.status(500).json({ error: 'Verification service offline' });
  }
});

app.get('/api/risk-profile/:passport', authenticateToken, async (req, res) => {
  try {
    const { passport } = req.params;
    const [profileRes, historyRes, appsRes, risk] = await Promise.all([
      pool.query('SELECT * FROM crossings WHERE passport = $1 ORDER BY created_at DESC LIMIT 1', [passport]),
      pool.query('SELECT * FROM crossings WHERE passport = $1 ORDER BY created_at DESC', [passport]),
      pool.query('SELECT * FROM applications WHERE passport_number = $1 ORDER BY created_at DESC', [passport]),
      calculateRiskScore(passport)
    ]);

    res.json({
      profile: profileRes.rows[0] || null,
      history: historyRes.rows,
      applications: appsRes.rows,
      risk,
      biometric: await calculateBiometricMatch(passport, !!(profileRes.rows[0]?.photo_path))
    });
  } catch (err) {
    res.status(500).json({ error: 'Forensic profile retrieval failed' });
  }
});

// --- REPORTING HUB ROUTES ---

app.get('/api/reports/stats', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if(!startDate || !endDate) return res.status(400).json({error: 'Dates required'});
    
    // Aggregates for applications
    const appsQuery = 'SELECT status, COUNT(*) FROM applications WHERE created_at >= $1 AND created_at <= $2 GROUP BY status';
    const applications = await pool.query(appsQuery, [startDate, `${endDate} 23:59:59`]);

    // Nationalities
    const natQuery = 'SELECT nationality, COUNT(*) FROM applications WHERE created_at >= $1 AND created_at <= $2 GROUP BY nationality ORDER BY count DESC LIMIT 10';
    const nationalities = await pool.query(natQuery, [startDate, `${endDate} 23:59:59`]);

    // Trends (Group by date)
    const trendsQuery = 'SELECT DATE(created_at) as date, COUNT(*) FROM applications WHERE created_at >= $1 AND created_at <= $2 GROUP BY DATE(created_at) ORDER BY date';
    const trendsResult = await pool.query(trendsQuery, [startDate, `${endDate} 23:59:59`]);

    // Station Distribution
    const stationQuery = 'SELECT point_of_entry as station, COUNT(*) FROM crossings WHERE created_at >= $1 AND created_at <= $2 GROUP BY point_of_entry ORDER BY count DESC';
    const stationResult = await pool.query(stationQuery, [startDate, `${endDate} 23:59:59`]);

    res.json({
      applications: applications.rows,
      nationalities: nationalities.rows,
      trends: { applications: trendsResult.rows },
      stations: stationResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate statistics report' });
  }
});

app.get('/api/reports/applications', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, status, nationality, purpose } = req.query;
    if(!startDate || !endDate) return res.status(400).json({error: 'Dates required'});
    let query = 'SELECT * FROM applications WHERE created_at >= $1 AND created_at <= $2';
    const params = [startDate, `${endDate} 23:59:59`];

    if (status && status !== 'All') {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    if (nationality) {
      params.push(nationality);
      query += ` AND nationality ILIKE $${params.length}`;
    }
    if (purpose) {
      params.push(purpose);
      query += ` AND purpose = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate application report' });
  }
});

app.get('/api/reports/notifications', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if(!startDate || !endDate) return res.status(400).json({error: 'Dates required'});
    const query = 'SELECT * FROM notifications WHERE created_at >= $1 AND created_at <= $2 ORDER BY created_at DESC';
    const result = await pool.query(query, [startDate, `${endDate} 23:59:59`]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate notifications report' });
  }
});

app.get('/api/reports/biometric', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, nationality } = req.query;
    if(!startDate || !endDate) return res.status(400).json({error: 'Dates required'});
    
    let query = `
      SELECT * FROM crossings 
      WHERE created_at >= $1 AND created_at <= $2 
      AND (biometric_status != 'Verified' OR risk_level = 'Critical')
    `;
    const params = [startDate, `${endDate} 23:59:59`];

    if (nationality) {
      params.push(nationality);
      query += ` AND nationality ILIKE $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    
    // Aggregate for analytics (status breakdown)
    const analytics = await pool.query(`
      SELECT biometric_status, COUNT(*) FROM crossings 
      WHERE created_at >= $1 AND created_at <= $2 
      GROUP BY biometric_status
    `, [startDate, `${endDate} 23:59:59`]);

    res.json({ data: result.rows, analytics: analytics.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate biometric report' });
  }
});

app.listen(port, '0.0.0.0', async () => {
  console.log(`Command Center API running on port ${port} over 0.0.0.0`);
});
