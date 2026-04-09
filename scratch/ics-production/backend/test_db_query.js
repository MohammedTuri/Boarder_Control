const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ics_borders',
    password: 'root',
    port: 5433,
});
(async () => {
    try {
        console.log('Querying agent...');
        const res = await pool.query('SELECT * FROM agents WHERE id = $1', ['AGENT_01']);
        console.log('Agent found:', res.rows.length);
        if (res.rows.length > 0) {
            console.log(res.rows[0]);
            const match = await bcrypt.compare('demo123', res.rows[0].passcode_hash);
            console.log('Passcode matches:', match);
        }
    } catch (e) {
        console.error('ERROR:', e);
    } finally {
        pool.end();
    }
})();
