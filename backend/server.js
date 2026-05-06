const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../')));

app.post('/api/register', async (req, res) => {
    const { role, username, password, full_name, email, phone } = req.body;

    try {
        const query = `
            INSERT INTO Users (role, username, password, full_name, email, phone)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, username, role;
        `;
        const values = [role, username, password, full_name, email, phone];
        
        const result = await db.query(query, values);
        
        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Registration Error:', error.message);
        
        // Menangkap pesan error dari PostgreSQL Trigger
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const query = `SELECT * FROM Users WHERE username = $1 AND password = $2`;
        const result = await db.query(query, [username, password]);

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Username atau password salah' });
        }

        res.json({
            success: true,
            message: 'Login berhasil',
            user: result.rows[0] // Pada aplikasi aslinya, gunakan token JWT
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/api/events', async (req, res) => {
    try {
        const query = `
            SELECT e.*, u.full_name as organizer_name 
            FROM Events e 
            JOIN Users u ON e.organizer_id = u.id
        `;
        const result = await db.query(query);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data event' });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const query = `
            SELECT o.id, o.order_date as date, o.payment_status as status, o.total_amount as amount, 
                   o.customer_id as "customerId", o.event_id as "eventId", u.full_name as "customerName"
            FROM Orders o
            LEFT JOIN Users u ON o.customer_id = u.id
            ORDER BY o.order_date DESC
        `;
        const result = await db.query(query);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data orders' });
    }
});

app.put('/api/orders/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const query = `UPDATE Orders SET payment_status = $1 WHERE id = $2 RETURNING *`;
        const result = await db.query(query, [status, id]);
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal update status order' });
    }
});

app.delete('/api/orders/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `DELETE FROM Orders WHERE id = $1`;
        await db.query(query, [id]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal menghapus order' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
