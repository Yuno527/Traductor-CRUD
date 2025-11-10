const { Pool } =  require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USUARIO,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_BASE_DATOS
});

module.exports = pool;