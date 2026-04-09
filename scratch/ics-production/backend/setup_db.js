const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'root', // default password as per server.js
    port: 5432,
});

async function setup() {
    try {
        await client.connect();
        const res = await client.query("SELECT datname FROM pg_catalog.pg_database WHERE datname = 'ics_borders'");
        if (res.rowCount === 0) {
            console.log('Creating database ics_borders...');
            await client.query('CREATE DATABASE ics_borders');
            console.log('Database created.');
        } else {
            console.log('Database ics_borders already exists.');
        }
    } catch (err) {
        console.error('Error connecting to postgres:', err.message);
    } finally {
        await client.end();
    }
}

setup();
