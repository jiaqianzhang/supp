const { Pool } = require('pg');

// Create a database connection and export it
const pool = new Pool({
    user: 'student',
    host: 'localhost',
    database: 'postgres',
    password: 'Password1',
    port: 5432
});

module.exports = pool;