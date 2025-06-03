import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import styles from './MainLayout.module.css';

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.sidebarArea}>
        <Sidebar collapsed={collapsed} onToggle={setCollapsed} />
      </div>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
