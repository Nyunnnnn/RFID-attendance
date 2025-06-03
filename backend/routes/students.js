const express = require('express');
const router = express.Router();

// Get student by RFID
router.get('/rfid/:rfid', (req, res) => {
  const db = req.app.get('db');
  const rfid = req.params.rfid.trim();

  db.query('SELECT * FROM students WHERE rfid = ?', [rfid], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Student not found' });
    res.json(results[0]);
  });
});

// Get all students
router.get('/', (req, res) => {
  const db = req.app.get('db');
  db.query('SELECT * FROM students', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add a new student
router.post('/', (req, res) => {
  const db = req.app.get('db');
  const { id, name, rfid } = req.body;

  if (!id || !name || !rfid) {
    return res.status(400).json({ error: 'Missing required fields: id, name, or rfid' });
  }

  db.query('INSERT INTO students (id, name, rfid) VALUES (?, ?, ?)', [id, name, rfid], (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Duplicate student ID or RFID detected' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Student added successfully' });
  });
});

// Update student info
router.put('/:id', (req, res) => {
  const db = req.app.get('db');
  const { id: newId, name, rfid } = req.body;
  const currentId = req.params.id;

  if (!newId || !name || !rfid) {
    return res.status(400).json({ error: 'Missing required fields: id, name, or rfid' });
  }

  db.query(
    'UPDATE students SET id = ?, name = ?, rfid = ? WHERE id = ?',
    [newId, name, rfid, currentId],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'Duplicate student ID or RFID detected' });
        }
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Student not found' });
      res.json({ message: 'Student updated successfully' });
    }
  );
});

// Delete student
router.delete('/:id', (req, res) => {
  const db = req.app.get('db');
  const id = req.params.id;

  db.query('DELETE FROM students WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  });
});

module.exports = router;
