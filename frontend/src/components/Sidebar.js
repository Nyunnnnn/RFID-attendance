import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/official-sscr-logo.png';
import styles from './Sidebar.module.css';

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.logoContainer}>
        <img src={logo} alt="San Sebastian College Logo" className={styles.logoImage} />
        {!collapsed && (
          <div className={styles.logoText}>
            <h2>San Sebastian College</h2>
            <p>Attendance Monitoring System</p>
          </div>
        )}
      </div>

      <nav className={styles.nav}>
        <Link
          to="/dashboard"
          className={`${styles.link} ${location.pathname === '/dashboard' ? styles.active : ''}`}
        >
          <span role="img" aria-label="home">🏠</span>
          <span>Home</span>
        </Link>
        <Link
          to="/events"
          className={`${styles.link} ${location.pathname === '/events' ? styles.active : ''}`}
        >
          <span role="img" aria-label="events">📅</span>
          <span>Manage Events</span>
        </Link>
        <Link
          to="/students"
          className={`${styles.link} ${location.pathname === '/students' ? styles.active : ''}`}
        >
          <span role="img" aria-label="students">👥</span>
          <span>Manage Students</span>
        </Link>
        <Link
          to="/scanner"
          className={`${styles.link} ${location.pathname === '/scanner' ? styles.active : ''}`}
        >
          <span role="img" aria-label="scanner">📷</span>
          <span>Attendance Scanner</span>
        </Link>
      </nav>

      {/* Toggle Button */}
      <button
        className={styles.toggleButton}
        onClick={() => onToggle(!collapsed)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <span className={styles.toggleIcon}>{collapsed ? '›' : '‹'}</span>
      </button>
    </aside>
  );
};

export default Sidebar;
