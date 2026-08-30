import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}>TF</div>
        <h2 style={styles.logoText}>TaskFlow</h2>
      </div>

      <nav style={styles.nav}>
        <NavLink 
          to="/dashboard" 
          style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.activeLink : {}) })}
        >
          📊 Dashboard
        </NavLink>
        
        <NavLink 
          to="/tasks" 
          style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.activeLink : {}) })}
        >
          📋 Task Board
        </NavLink>

        <NavLink 
          to="/employees" 
          style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.activeLink : {}) })}
        >
          👥 Employees
        </NavLink>

        <NavLink 
          to="/notifications" 
          style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.activeLink : {}) })}
        >
          🔔 Notifications
        </NavLink>
      </nav>

      <div style={styles.footer}>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>TaskFlow © 2026</p>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '240px',
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    borderRight: '1px solid #334155'
  },
  logoContainer: {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid #334155'
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '700',
    letterSpacing: '0.5px'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 12px',
    gap: '4px'
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    color: '#94a3b8',
    borderRadius: '6px',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  activeLink: {
    backgroundColor: '#2563eb',
    color: '#ffffff'
  },
  footer: {
    marginTop: 'auto',
    padding: '20px',
    borderTop: '1px solid #334155',
    textAlign: 'center'
  }
};

export default Sidebar;
