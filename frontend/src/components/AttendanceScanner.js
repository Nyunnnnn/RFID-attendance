import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const AttendanceScanner = () => {
  const [eventId, setEventId] = useState('');
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/events`)
      .then((res) => setEvents(res.data))
      .catch(() => setMessage('Failed to load events'));
  }, []);

  // Focus input on mount and after event change
  useEffect(() => {
    if (inputRef.current && !loading) {
      inputRef.current.focus();
    }
  }, [loading, eventId]);

  const showStudentModal = (student) => {
    // Clear existing timer if any
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Show or update modal with student info
    MySwal.fire({
      title: student.name,
      html: (
        <div style={{ textAlign: 'center' }}>
          {student.photo && (
            <img
              src={student.photo}
              alt={student.name}
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: '1rem',
                boxShadow: '0 0 15px rgba(255, 215, 0, 0.7)',
              }}
            />
          )}
          <p><strong>Course:</strong> {student.course}</p>
          <p><strong>ID:</strong> {student.id}</p>
        </div>
      ),
      background: '#fff8e1', // warm gold-ish background
      color: '#b8860b', // darker gold text
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      didOpen: () => {

      },
    });


    timerRef.current = setTimeout(() => {
      MySwal.close();
      timerRef.current = null;

      if (inputRef.current) inputRef.current.focus();
    }, 3000);
  };

  const handleScan = async (e) => {
    const code = e.target.value.trim();

    if (!eventId) {
      setMessage('⚠️ Please select an event first');
      e.target.value = '';
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/students/rfid/${code}`
      );
      const student = res.data;

      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/log-attendance`, {
        studentId: student.id,
        eventId,
      });

      setMessage(`✅ Attendance logged for ${student.name}`);

      showStudentModal(student);
    } catch (err) {
      setMessage('❌ Student not found or error logging attendance');

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      MySwal.close();
    }
    setLoading(false);

    e.target.value = '';
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>📋 Event Attendance Scanner</h1>

      <div style={styles.card}>
        <label style={styles.label} htmlFor="event-select">
          Select Event:
        </label>
        <select
          id="event-select"
          style={styles.select}
          value={eventId}
          onChange={(e) => {
            setEventId(e.target.value);
            setMessage('');
            // Refocus input after selecting event
            setTimeout(() => {
              if (inputRef.current) inputRef.current.focus();
            }, 0);
          }}
          disabled={loading}
        >
          <option value="">-- Select Event --</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder={loading ? 'Processing...' : 'Scan RFID...'}
          onKeyDown={(e) => e.key === 'Enter' && handleScan(e)}
          autoFocus
          disabled={loading}
          style={styles.hiddenInput}
          ref={inputRef}
        />

        {message && (
          <p
            style={{
              ...styles.message,
              color: message.startsWith('❌') ? '#d93025' : '#1a73e8',
            }}
            role="alert"
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#fff8e1', // warm gold background
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '2rem',
  },
  header: {
    textAlign: 'center',
    color: '#b8860b', // darker gold text
    fontWeight: '700',
    fontSize: '2.5rem',
    marginBottom: '1.5rem',
  },
  card: {
    maxWidth: '480px',
    margin: '0 auto',
    backgroundColor: '#ffffff', // white card background
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(184,134,11, 0.3)', // warm gold shadow
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  label: {
    fontWeight: '600',
    fontSize: '1rem',
    marginBottom: '.5rem',
    color: '#b8860b',
  },
  select: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1.5px solid #b8860b',
    fontSize: '1rem',
    transition: 'border-color 0.3s ease',
    outline: 'none',
    color: '#b8860b',
    backgroundColor: '#fff',
  },
  hiddenInput: {
    position: 'absolute',
    left: '-9999px',
    opacity: 0,
  },
  message: {
    fontWeight: '600',
    fontSize: '1.1rem',
    textAlign: 'center',
    marginTop: '1rem',
  },
};

export default AttendanceScanner;
