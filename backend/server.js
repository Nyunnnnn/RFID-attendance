require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const adminRoutes = require('./routes/admin');
const eventRoutes = require('./routes/events');
const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const statsRoutes = require('./routes/stats'); 
const reportsRoutes = require('./routes/reports'); // ✅ NEW import

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL');
});

app.set('db', db);

app.use('/admin', adminRoutes);
app.use('/events', eventRoutes);
app.use('/students', studentRoutes);
app.use('/log-attendance', attendanceRoutes); 
app.use('/api/stats', statsRoutes);
app.use('/reports', reportsRoutes); // ✅ NEW route

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
