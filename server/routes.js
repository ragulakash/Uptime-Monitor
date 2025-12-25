const express = require('express');
const router = express.Router();
const db = require('./database');

// Get all monitors with their latest status
router.get('/monitors', (req, res) => {
    const query = `
        SELECT m.*, 
               (SELECT status_code FROM heartbeats WHERE monitor_id = m.id ORDER BY created_at DESC LIMIT 1) as last_status,
               (SELECT created_at FROM heartbeats WHERE monitor_id = m.id ORDER BY created_at DESC LIMIT 1) as last_check
        FROM monitors m
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add a new monitor
router.post('/monitors', (req, res) => {
    const { name, url, check_interval = 1 } = req.body;
    if (!name || !url) {
        return res.status(400).json({ error: 'Name and URL are required' });
    }

    const stmt = db.prepare("INSERT INTO monitors (name, url, check_interval) VALUES (?, ?, ?)");
    stmt.run(name, url, check_interval, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, name, url, check_interval });
    });
    stmt.finalize();
});

// Delete a monitor
router.delete('/monitors/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM monitors WHERE id = ?", id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // Also clean up heartbeats
        db.run("DELETE FROM heartbeats WHERE monitor_id = ?", id);
        res.json({ message: 'Monitor deleted', changes: this.changes });
    });
});

// Get heartbeat history for a monitor (e.g., last 24h) (24 * 60 = 1440 minutes/points max if 1 min interval)
router.get('/monitors/:id/history', (req, res) => {
    const { id } = req.params;
    const limit = req.query.limit || 50; // Default to last 50 checks

    db.all("SELECT * FROM heartbeats WHERE monitor_id = ? ORDER BY created_at DESC LIMIT ?", [id, limit], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows.reverse()); // Return in chronological order
    });
});

module.exports = router;
