// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  // eslint-disable-next-line no-unused-vars
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalStudents: 0,
  });

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Dashboard Overview</h1>
      <div className={styles.cards}>
        <div className={styles.card}>
          <h2>Total Users</h2>
          <p className={styles.count}>{stats.totalUsers || 12}</p>
        </div>
        <div className={styles.card}>
          <h2>Total Events</h2>
          <p className={styles.count}>{stats.totalEvents || 5}</p>
        </div>
        <div className={styles.card}>
          <h2>Total Students</h2>
          <p className={styles.count}>{stats.totalStudents || 47}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
