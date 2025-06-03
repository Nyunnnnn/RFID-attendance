const express = require('express');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const router = express.Router();

function fetchAttendanceData(db, eventId, callback) {
  db.query(
    `
    SELECT 
      students.id AS student_id,
      students.name AS student_name,
      students.rfid AS rfid,
      students.photo AS photo,
      events.name AS event_name,
      events.date AS event_date,
      attendance_logs.timestamp AS attendance_time
    FROM attendance_logs
    JOIN students ON attendance_logs.student_id = students.id
    JOIN events ON attendance_logs.event_id = events.id
    WHERE events.id = ?
    ORDER BY attendance_logs.timestamp DESC
    `,
    [eventId],
    callback
  );
}

// Excel route
router.get('/:eventId', async (req, res) => {
  const db = req.app.get('db');
  const { eventId } = req.params;

  fetchAttendanceData(db, eventId, async (err, results) => {
    if (err) {
      console.error('Error fetching attendance report:', err);
      return res.status(500).json({ error: 'Failed to generate report' });
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Attendance Report');

      if (results.length > 0) {
        const formattedDate = new Date(results[0].event_date).toLocaleDateString('en-US');
        sheet.addRow([`Event: ${results[0].event_name}`, `Date: ${formattedDate}`]);
        sheet.addRow([]);
      }

      sheet.addRow(['Student ID', 'Student Name', 'RFID', 'Attendance Time']);

      results.forEach(row => {
        sheet.addRow([
          row.student_id,
          row.student_name,
          row.rfid,
          new Date(row.attendance_time).toLocaleString()
        ]);
      });

      sheet.columns.forEach(col => col.width = 25);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=event_${eventId}_report.xlsx`);

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Excel export error:', error);
      res.status(500).json({ error: 'Failed to generate Excel report' });
    }
  });
});

// PDF route
router.get('/pdf/:eventId', (req, res) => {
  const db = req.app.get('db');
  const { eventId } = req.params;

  fetchAttendanceData(db, eventId, (err, results) => {
    if (err) {
      console.error('Error fetching attendance report:', err);
      return res.status(500).json({ error: 'Failed to generate PDF report' });
    }

    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=event_${eventId}_report.pdf`);

      doc.pipe(res);

      if (results.length > 0) {
        const eventDate = new Date(results[0].event_date);
        const formattedDate = eventDate.toLocaleDateString('en-US');

        doc.fontSize(16).text(`Event: ${results[0].event_name}`);
        doc.fontSize(14).text(`Date: ${formattedDate}`);
        doc.moveDown();
      } else {
        doc.fontSize(14).text('No attendance data available.');
        doc.end();
        return;
      }

      // Table headers
      const tableTop = doc.y + 20;
      const itemMargin = 5;

      const colWidths = {
        studentId: 80,
        studentName: 180,
        rfid: 100,
        attendanceTime: 150,
      };

      const startX = doc.page.margins.left;

      // Header background
      doc.rect(startX, tableTop - 15, colWidths.studentId + colWidths.studentName + colWidths.rfid + colWidths.attendanceTime, 20).fill('#c99700');
      doc.fillColor('white').fontSize(12);

      // Headers
      doc.text('Student ID', startX + itemMargin, tableTop - 12, { width: colWidths.studentId, align: 'left' });
      doc.text('Student Name', startX + colWidths.studentId + itemMargin, tableTop - 12, { width: colWidths.studentName, align: 'left' });
      doc.text('RFID', startX + colWidths.studentId + colWidths.studentName + itemMargin, tableTop - 12, { width: colWidths.rfid, align: 'left' });
      doc.text('Attendance Time', startX + colWidths.studentId + colWidths.studentName + colWidths.rfid + itemMargin, tableTop - 12, { width: colWidths.attendanceTime, align: 'left' });

      doc.moveDown();

      let y = tableTop + 10;

      doc.fillColor('black').fontSize(10);

      results.forEach(row => {
        if (y > doc.page.height - doc.page.margins.bottom - 20) {
          doc.addPage();
          y = doc.page.margins.top;
        }

        doc.text(row.student_id.toString(), startX + itemMargin, y, { width: colWidths.studentId, align: 'left' });
        doc.text(row.student_name, startX + colWidths.studentId + itemMargin, y, { width: colWidths.studentName, align: 'left' });
        doc.text(row.rfid, startX + colWidths.studentId + colWidths.studentName + itemMargin, y, { width: colWidths.rfid, align: 'left' });
        doc.text(new Date(row.attendance_time).toLocaleString(), startX + colWidths.studentId + colWidths.studentName + colWidths.rfid + itemMargin, y, { width: colWidths.attendanceTime, align: 'left' });

        y += 20;
      });

      doc.end();
    } catch (error) {
      console.error('PDF export error:', error);
      res.status(500).json({ error: 'Failed to generate PDF report' });
    }
  });
});

module.exports = router;
