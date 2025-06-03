import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/events`);
        setEvents(res.data);
        setError('');
      } catch (err) {
        setError('Failed to load events.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const fetchAttendanceLogs = async (event) => {
    try {
      const res = await axios.get(`${API_URL}/events/${event.id}/attendance`);
      setAttendanceLogs(res.data);
      setSelectedEvent(event);
      setError('');
    } catch (err) {
      setError('Failed to load attendance logs.');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEventName.trim() || !newEventDate) return;
    try {
      await axios.post(`${API_URL}/events`, {
        name: newEventName,
        date: newEventDate,
      });
      setNewEventName('');
      setNewEventDate('');
      const res = await axios.get(`${API_URL}/events`);
      setEvents(res.data);
      setError('');
    } catch (err) {
      setError('Failed to create event.');
    }
  };

  const handleEditEvent = async (event) => {
    const newName = prompt('Enter new event name:', event.name);
    const newDate = prompt('Enter new event date (YYYY-MM-DD):', event.date);
    if (!newName || !newDate) return;

    try {
      await axios.put(`${API_URL}/events/${event.id}`, {
        name: newName,
        date: newDate,
      });
      const res = await axios.get(`${API_URL}/events`);
      setEvents(res.data);
      if (selectedEvent && selectedEvent.id === event.id) {
        setSelectedEvent({ ...selectedEvent, name: newName, date: newDate });
      }
      setError('');
    } catch (err) {
      setError('Failed to update event.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await axios.delete(`${API_URL}/events/${eventId}`);
      const res = await axios.get(`${API_URL}/events`);
      setEvents(res.data);
      if (selectedEvent && selectedEvent.id === eventId) {
        setSelectedEvent(null);
        setAttendanceLogs([]);
      }
      setError('');
    } catch (err) {
      console.error('Delete event error:', err.response || err.message);
      setError('Failed to delete event. ' + (err.response?.data?.error || err.message));
    }
  };

  const handleGenerateReport = async (eventId) => {
    try {
      const response = await axios.get(`${API_URL}/reports/${eventId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `event_${eventId}_report.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to generate Excel report.');
      console.error(err);
    }
  };

  const handleGeneratePDFReport = async (eventId) => {
    try {
      const response = await axios.get(`${API_URL}/reports/pdf/${eventId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `event_${eventId}_report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to generate PDF report.');
      console.error(err);
    }
  };

  const styles = {
    container: {
      padding: '2rem',
      backgroundColor: '#f9f9f9',
      borderRadius: '12px',
    },
    title: {
      fontSize: '2rem',
      color: '#800000',
      marginBottom: '1rem',
    },
    form: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1rem',
      flexWrap: 'wrap',
    },
    input: {
      padding: '0.5rem',
      border: '1px solid #ccc',
      borderRadius: '6px',
      minWidth: '150px',
    },
    button: {
      backgroundColor: '#c99700',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
    },
    deleteButton: {
      backgroundColor: '#f44336',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
    },
    eventActions: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: '0.5rem',
    },
    iconButton: {
      backgroundColor: '#c99700',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      fontSize: '1rem',
      width: '2.5rem',
      height: '2.5rem',
      cursor: 'pointer',
    },
    listItem: {
      backgroundColor: '#fff',
      padding: '1rem',
      marginBottom: '0.5rem',
      borderRadius: '8px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    },
    eventName: {
      fontWeight: 'bold',
      color: '#800000',
    },
    logHeader: {
      marginTop: '2rem',
      fontSize: '1.25rem',
      color: '#800000',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '1rem',
    },
    th: {
      backgroundColor: '#c99700',
      color: 'white',
      padding: '0.5rem',
      textAlign: 'left',
    },
    td: {
      borderBottom: '1px solid #ccc',
      padding: '0.5rem',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Manage Events</h2>

      <form onSubmit={handleCreateEvent} style={styles.form}>
        <input
          type="text"
          placeholder="New Event Name"
          value={newEventName}
          onChange={(e) => setNewEventName(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="date"
          value={newEventDate}
          onChange={(e) => setNewEventDate(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Create
        </button>
      </form>

      {loading ? (
        <p>Loading events...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <ul style={{ paddingLeft: 0 }}>
          {events.map((event) => (
            <li key={event.id} style={styles.listItem}>
              <div style={styles.eventName}>
                {event.name}{' '}
                <span style={{ color: '#555' }}>{event.date || 'No date'}</span>
              </div>
              <div style={styles.eventActions}>
                <div>
                  <button
                    onClick={() => fetchAttendanceLogs(event)}
                    style={{ ...styles.button, marginRight: '0.5rem' }}
                  >
                    View Attendance
                  </button>
                  <button
                    onClick={() => handleEditEvent(event)}
                    style={{ ...styles.button, marginRight: '0.5rem' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    style={{ ...styles.deleteButton, marginRight: '0.5rem' }}
                  >
                    Delete
                  </button>
                </div>
                <div>
                  <button
                    title="Generate Excel Report"
                    onClick={() => handleGenerateReport(event.id)}
                    style={{ ...styles.iconButton, marginRight: '0.5rem' }}
                  >
                    📥
                  </button>
                  <button
                    title="Generate PDF Report"
                    onClick={() => handleGeneratePDFReport(event.id)}
                    style={styles.iconButton}
                  >
                    📝
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {selectedEvent && (
        <div>
          <h3 style={styles.logHeader}>
            Attendance Logs for <em>{selectedEvent.name}</em>{' '}
            {selectedEvent.date || 'No date'}
          </h3>
          {attendanceLogs.length === 0 ? (
            <p>No attendance logs for this event yet.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Student ID</th>
                  <th style={styles.th}>Student Name</th>
                  <th style={styles.th}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {attendanceLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={styles.td}>{log.student_id}</td>
                    <td style={styles.td}>{log.student_name}</td>
                    <td style={styles.td}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Events;
