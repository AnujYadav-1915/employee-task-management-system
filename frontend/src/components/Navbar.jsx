import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ title }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={styles.header}>
      <h1 style={styles.title}>{title}</h1>

      <div style={styles.userSection}>
        {user && (
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <p style={styles.userName}>{user.username}</p>
              <p style={styles.userRole}>{user.role || 'EMPLOYEE'}</p>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

const styles = {
  header: {
    height: '64px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px'
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#0f172a'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b'
  },
  userRole: {
    fontSize: '11px',
    color: '#64748b'
  },
  logoutBtn: {
    padding: '6px 12px',
    fontSize: '13px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    cursor: 'pointer',
    marginLeft: '12px'
  }
};

export default Navbar;
