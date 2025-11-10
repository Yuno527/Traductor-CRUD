// servidor.js
const express = require('express');
const cors = require('cors');
const pool = require('./bd');
require('dotenv').config();

const app = express();
const PUERTO = process.env.PUERTO || 4000;

app.use(cors());
app.use(express.json());

// Listar palabras (opciones: q, origen, destino)
app.get('/api/palabras', async (req, res) => {
    try {
        const { q, origen, destino } = req.query;
        let consulta = 'SELECT * FROM palabras';
        const filtros = [];
        const parametros = [];

        if (q) { parametros.push(`%${q}%`); filtros.push(`(palabra_origen ILIKE $${parametros.length} OR palabra_traducida ILIKE $${parametros.length})`); }
        if (origen) { parametros.push(origen); filtros.push(`idioma_origen = $${parametros.length}`); }
        if (destino) { parametros.push(destino); filtros.push(`idioma_destino = $${parametros.length}`); }

        if (filtros.length) consulta += ' WHERE ' + filtros.join(' AND ');
        consulta += ' ORDER BY id DESC';

        const resultado = await pool.query(consulta, parametros);
        res.json(resultado.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener las palabras' });
    }
});

// Obtener palabra por id
app.get('/api/palabras/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await pool.query('SELECT * FROM palabras WHERE id = $1', [id]);
        if (resultado.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json(resultado.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener la palabra' });
    }
});


// Crear palabra
app.post('/api/palabras', async (req, res) => {
    try {
        const { palabra_origen, palabra_traducida, idioma_origen = 'es', idioma_destino = 'en' } = req.body;
        if (!palabra_origen || !palabra_traducida) return res.status(400).json({ error: 'Campos requeridos faltantes' });

        const resultado = await pool.query(
            `INSERT INTO palabras (palabra_origen, palabra_traducida, idioma_origen, idioma_destino)
       VALUES ($1,$2,$3,$4) RETURNING *`,
            [palabra_origen, palabra_traducida, idioma_origen, idioma_destino]
        );
        res.status(201).json(resultado.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear la palabra' });
    }
});

// Actualizar palabra
app.put('/api/palabras/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { palabra_origen, palabra_traducida, idioma_origen, idioma_destino} = req.body;
        const resultado = await pool.query(
            `UPDATE palabras SET palabra_origen=$1, palabra_traducida=$2, idioma_origen=$3, idioma_destino=$4 WHERE id=$5 RETURNING *`,
            [palabra_origen, palabra_traducida, idioma_origen, idioma_destino, id]
        );
        if (resultado.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json(resultado.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar la palabra' });
    }
});

// Eliminar palabra
app.delete('/api/palabras/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await pool.query('DELETE FROM palabras WHERE id = $1 RETURNING *', [id]);
        if (resultado.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json({ mensaje: 'Eliminado correctamente', fila: resultado.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar la palabra' });
    }
});

app.listen(PUERTO, () => {
    console.log(`Servidor escuchando en puerto ${PUERTO}`);
});
