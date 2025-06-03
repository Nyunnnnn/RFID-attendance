const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const db = req.app.get('db');
  const { studentId, eventId } = req.body;

  if (!studentId || !eventId) {
    return res.status(400).json({ error: 'Missing studentId or eventId' });
  }

  db.query(
    'INSERT INTO attendance_logs (student_id, event_id) VALUES (?, ?)',
    [studentId, eventId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Attendance logged successfully!' });
    }
  );
});

module.exports = router;
