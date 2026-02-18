const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
    user: process.env.DB_USER || 'usuario',
    password: process.env.DB_PASSWORD || 'contraseña',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'control_asistencia',
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

app.post('/api/attendance', async (req, res) => {
    try {
        const { employee_id, type } = req.body;
        if (!employee_id || !type) {
            return res.status(400).json({ error: 'employee_id y type son requeridos' });
        }
        const result = await pool.query(
            'INSERT INTO attendance (employee_id, type, timestamp) VALUES ($1, $2, NOW()) RETURNING *',
            [employee_id, type]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/attendance/:employee_id', async (req, res) => {
    try {
        const { employee_id } = req.params;
        const result = await pool.query(
            'SELECT * FROM attendance WHERE employee_id = $1 ORDER BY timestamp DESC LIMIT 50',
            [employee_id]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/employees', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM employees ORDER BY name');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/employees', async (req, res) => {
    try {
        const { name, email, department } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: 'name y email son requeridos' });
        }
        const result = await pool.query(
            'INSERT INTO employees (name, email, department) VALUES ($1, $2, $3) RETURNING *',
            [name, email, department]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/report/daily/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const result = await pool.query(
            `SELECT e.id, e.name, e.department, COUNT(*) as registros, MIN(CASE WHEN a.type = 'entrada' THEN a.timestamp END) as entrada, MAX(CASE WHEN a.type = 'salida' THEN a.timestamp END) as salida FROM employees e LEFT JOIN attendance a ON e.id = a.employee_id AND DATE(a.timestamp) = $1 GROUP BY e.id, e.name, e.department ORDER BY e.name`,
            [date]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log('✅ Servidor ejecutándose en puerto', port);
    console.log('📊 Base de datos conectada');
});