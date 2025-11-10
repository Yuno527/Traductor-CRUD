const pool = require('../bd');

async function probarConexion() {
    try {
        const r = await pool.query('SELECT NOW() as ahora');
        console.log('Conectado a PostgreSQL:', r.rows[0].ahora);
        pool.end();
    } catch (err) {
        console.error('Error de conexión:', err);
        pool.end();
    }
}

probarConexion();
