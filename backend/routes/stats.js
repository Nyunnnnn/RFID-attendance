const express = require('express');
const router = express.Router();

// Use promise-based mysql2 connection (see next steps)

router.get('/total-users', async (req, res) => {
  // Since no 'users' table, respond with 1 or 0 or remove this endpoint
  res.json({ totalUsers: 1 }); // or 0 or some fixed number
});

router.get('/total-events', async (req, res) => {
  try {
    const db = req.app.get('db');
    const [result] = await db.query('SELECT COUNT(*) AS count FROM events');
    res.json({ totalEvents: result[0].count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/total-students', async (req, res) => {
  try {
    const db = req.app.get('db');
    const [result] = await db.query('SELECT COUNT(*) AS count FROM students');
    res.json({ totalStudents: result[0].count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
