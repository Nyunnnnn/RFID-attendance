import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import styles from './Students.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ id: '', name: '', rfid: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isEditing) {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isEditing]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/students`);
      setStudents(response.data);
    } catch (err) {
      Swal.fire('Error', 'Failed to fetch students.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const id = String(form.id).trim();
    const name = String(form.name).trim();
    const rfid = String(form.rfid).trim();

    if (!id || !name || !rfid) {
      Swal.fire('Validation Error', 'Please fill in all fields.', 'warning');
      return;
    }

    try {
      if (isEditing) {
        await axios.put(`${API_URL}/students/${editingId}`, { id, name, rfid });
        Swal.fire('Updated!', 'Student information updated.', 'success');
      } else {
        await axios.post(`${API_URL}/students`, { id, name, rfid });
        Swal.fire('Added!', 'Student added successfully.', 'success');
      }
      setForm({ id: '', name: '', rfid: '' });
      setIsEditing(false);
      setEditingId(null);
      fetchStudents();
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to save student.';
      Swal.fire('Error', message, 'error');
    }
  };

  const handleEdit = (student) => {
    setForm({
      id: String(student.id),
      name: String(student.name),
      rfid: String(student.rfid),
    });
    setIsEditing(true);
    setEditingId(student.id);
  };

  const handleCancel = () => {
    setForm({ id: '', name: '', rfid: '' });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleDelete = async (student) => {
    const result = await Swal.fire({
      title: `Delete ${student.name}?`,
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/students/${student.id}`);
        Swal.fire('Deleted!', 'Student has been deleted.', 'success');
        fetchStudents();
        if (isEditing && editingId === student.id) {
          handleCancel();
        }
      } catch (err) {
        Swal.fire('Error', 'Failed to delete student.', 'error');
      }
    }
  };

  const filteredStudents = students.filter((student) => {
    const searchTerm = search.toLowerCase();
    return (
      student.name.toLowerCase().includes(searchTerm) ||
      student.rfid.toLowerCase().includes(searchTerm)
    );
  });

  const totalPages = Math.ceil(filteredStudents.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentStudents = filteredStudents.slice(startIndex, startIndex + pageSize);

  const goToPage = (page) => {
    if (page < 1) page = 1;
    else if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  if (loading) return <p>Loading students...</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Manage Students</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          name="id"
          placeholder="Student ID"
          value={form.id}
          onChange={handleChange}
          required
          disabled={isEditing}
          className={styles.input}
        />
        <input
          type="text"
          name="name"
          placeholder="Student Name"
          value={form.name}
          onChange={handleChange}
          required
          className={styles.input}
        />
        <input
          type="text"
          name="rfid"
          placeholder="RFID"
          value={form.rfid}
          onChange={handleChange}
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button} style={{ marginRight: '0.5rem' }}>
          {isEditing ? 'Update Student' : 'Add Student'}
        </button>
        {isEditing && (
          <button type="button" onClick={handleCancel} className={`${styles.button} ${styles.secondary}`}>
            Cancel
          </button>
        )}
      </form>

      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Search by Name or RFID"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className={styles.searchInput}
        />
        <button
          onClick={() => {
            setSearch('');
            setCurrentPage(1);
          }}
          className={styles.clearButton}
        >
          Clear
        </button>

        <label>
          Show:{' '}
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className={styles.select}
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>{' '}
          entries
        </label>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>RFID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentStudents.length === 0 ? (
            <tr>
              <td colSpan="4">No students found.</td>
            </tr>
          ) : (
            currentStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.rfid}</td>
                <td className={styles.actionButtons}>
                  <button
                    onClick={() => handleEdit(student)}
                    className={`${styles.button} ${styles.editButton}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(student)}
                    className={`${styles.button} ${styles.deleteButton}`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className={styles.pagination}>
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Students;
