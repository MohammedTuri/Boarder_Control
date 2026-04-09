const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 4000;
const JWT_SECRET = 'ics-secure-signature-key';

// Requires Postgres to be installed locally
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ics_borders',
    password: 'root', // UPDATE THIS WITH YOUR ACTUAL POSTGRES PASSWORD
    port: 5433,
});

// Auto-initialize tables and seed the first admin user
(async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS agents (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                checkpoint VARCHAR(100) NOT NULL,
                passcode_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'agent'
            );
            CREATE TABLE IF NOT EXISTS crossings (
                id SERIAL PRIMARY KEY,
                agent_id VARCHAR(50) REFERENCES agents(id),
                traveler_name VARCHAR(100) NOT NULL,
                passport_number VARCHAR(50) NOT NULL,
                direction VARCHAR(20) NOT NULL,
                checkpoint VARCHAR(100) NOT NULL,
                status VARCHAR(20) NOT NULL,
                photo_url VARCHAR(255),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS watchlists (
                passport_number VARCHAR(50) PRIMARY KEY,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // Auto-migrate crossing column if it doesn't exist
        try {
            await pool.query(`ALTER TABLE crossings ADD COLUMN photo_url VARCHAR(255);`);
            console.log("Migrated crossings table with photo_url column.");
        } catch(e) {
            // Already exists most likely
        }
        
        const res = await pool.query('SELECT * FROM agents WHERE id = $1', ['AGENT_01']);
        if (res.rows.length === 0) {
            const hash = await bcrypt.hash('demo123', 10);
            await pool.query('INSERT INTO agents (id, name, checkpoint, passcode_hash, role) VALUES ($1, $2, $3, $4, $5)', ['AGENT_01', 'System Admin', 'Headquarters', hash, 'admin']);
            console.log("Seeded default admin user AGENT_01");
        }
    } catch(err) {
        console.error("Database initialization error. Please verify PostgreSQL is running and credentials are correct:", err.message);
    }
})();

// Middleware for JWT Verification
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Health Check
app.get('/api/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ status: 'Online', db_timestamp: result.rows[0].now });
    } catch (err) {
        res.status(500).json({ status: 'Database Disconnected', error: err.message });
    }
});

// Authentication Endpoint
app.post('/api/auth/login', async (req, res) => {
    const { id, passcode } = req.body;
    try {
        const result = await pool.query('SELECT * FROM agents WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Agent not found' });
        
        const agent = result.rows[0];
        const match = await bcrypt.compare(passcode, agent.passcode_hash);
        if (!match) return res.status(401).json({ error: 'Invalid passcode' });
        
        const token = jwt.sign({ id: agent.id, role: agent.role }, JWT_SECRET, { expiresIn: '12h' });
        res.json({ token, agent: { id: agent.id, name: agent.name, checkpoint: agent.checkpoint, role: agent.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crossings Endpoints
app.get('/api/crossings', authenticateToken, async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;
        let query = 'SELECT * FROM crossings ORDER BY timestamp DESC LIMIT $1 OFFSET $2';
        let params = [limit, offset];
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/crossings', authenticateToken, upload.single('photo'), async (req, res) => {
    const { traveler_name, passport_number, direction, checkpoint, status } = req.body;
    const photo_url = req.file ? '/uploads/' + req.file.filename : null;
    try {
        // Check watchlist
        const watchlistCheck = await pool.query('SELECT * FROM watchlists WHERE passport_number = $1', [passport_number]);
        if (watchlistCheck.rows.length > 0 && status !== 'denied') {
            // Check if we need to remove the mistakenly uploaded photo here? Usually ok to leave or clean up
            return res.status(403).json({ error: 'Traveler is on the watchlist', notes: watchlistCheck.rows[0].notes });
        }

        const result = await pool.query(
            'INSERT INTO crossings (agent_id, traveler_name, passport_number, direction, checkpoint, status, photo_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [req.user.id, traveler_name, passport_number, direction, checkpoint, status, photo_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Watchlist Endpoints
app.get('/api/watchlists', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM watchlists ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/watchlists', authenticateToken, async (req, res) => {
    const { passport_number, notes } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO watchlists (passport_number, notes) VALUES ($1, $2) ON CONFLICT (passport_number) DO UPDATE SET notes = $2 RETURNING *',
            [passport_number, notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/watchlists/:passport_number', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM watchlists WHERE passport_number = $1', [req.params.passport_number]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Endpoints
app.get('/api/admin/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden: Admins only' });
    try {
        const result = await pool.query('SELECT id, name, checkpoint, role FROM agents');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden: Admins only' });
    const { id, name, checkpoint, passcode, role } = req.body;
    try {
        const passcode_hash = await bcrypt.hash(passcode, 10);
        const result = await pool.query(
            'INSERT INTO agents (id, name, checkpoint, passcode_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, checkpoint, role',
            [id, name, checkpoint, passcode_hash, role || 'agent']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/users/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden: Admins only' });
    const { name, checkpoint, passcode, role } = req.body;
    const { id } = req.params;
    try {
        let query, params;
        if (passcode) {
            const passcode_hash = await bcrypt.hash(passcode, 10);
            query = 'UPDATE agents SET name=$1, checkpoint=$2, role=$3, passcode_hash=$4 WHERE id=$5 RETURNING id, name, checkpoint, role';
            params = [name, checkpoint, role, passcode_hash, id];
        } else {
            query = 'UPDATE agents SET name=$1, checkpoint=$2, role=$3 WHERE id=$4 RETURNING id, name, checkpoint, role';
            params = [name, checkpoint, role, id];
        }
        const result = await pool.query(query, params);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/users/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden: Admins only' });
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM agents WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`[ICS Backend] Server initialized and listening on PORT ${PORT}`);
});
