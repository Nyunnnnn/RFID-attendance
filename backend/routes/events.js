const express = require('express');
const router = express.Router();

// Get all events
router.get('/', (req, res) => {
  const db = req.app.get('db');
  db.query('SELECT * FROM events ORDER BY date DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Create new event
router.post('/', (req, res) => {
  const db = req.app.get('db');
  const { name, date } = req.body;

  if (!name || !date) {
    return res.status(400).json({ error: 'Event name and date are required' });
  }

  const sql = 'INSERT INTO events (name, date) VALUES (?, ?)';
  db.query(sql, [name, date], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, name, date });
  });
});

// Update event
router.put('/:id', (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;
  const { name, date } = req.body;

  if (!name || !date) {
    return res.status(400).json({ error: 'Event name and date are required' });
  }

  const sql = 'UPDATE events SET name = ?, date = ? WHERE id = ?';
  db.query(sql, [name, date, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event updated', id, name, date });
  });
});

// Delete event
router.delete('/:id', (req, res) => {
  const db = req.app.get('db');
  const { id } = req.params;

  const sql = 'DELETE FROM events WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted', id });
  });
});

// Get attendance logs for a specific event
router.get('/:eventId/attendance', (req, res) => {
  const db = req.app.get('db');
  const { eventId } = req.params;

  const sql = `
    SELECT 
      al.id, 
      al.timestamp, 
      s.id AS student_id, 
      s.name AS student_name 
    FROM attendance_logs al 
    JOIN students s ON al.student_id = s.id 
    WHERE al.event_id = ?
    ORDER BY al.timestamp DESC
  `;

  db.query(sql, [eventId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
