import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ROLE_EMPLOYEE');
  const [error, setError] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    if (selectedRole === 'ROLE_ADMIN') {
      setShowAdminModal(true);
      setRole('ROLE_EMPLOYEE');
    } else {
      setRole(selectedRole);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (role === 'ROLE_ADMIN') {
      setShowAdminModal(true);
      setRole('ROLE_EMPLOYEE');
      return;
    }

    try {
      await register(username, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      if (msg.toLowerCase().includes('administrator')) {
        setShowAdminModal(true);
        setRole('ROLE_EMPLOYEE');
      } else {
        setError(msg);
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>TF</div>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join TaskFlow to manage team workflows</p>
        </div>

        {error && <div style={styles.alert}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              className="form-control" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required
              placeholder="e.g. john_doe"
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              placeholder="john@example.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label>Account Role</label>
            <select className="form-control" value={role} onChange={handleRoleChange}>
              <option value="ROLE_EMPLOYEE">Employee</option>
              <option value="ROLE_MANAGER">Manager</option>
              <option value="ROLE_ADMIN">Administrator</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            Register
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: '500' }}>Sign in</Link>
        </p>
      </div>

      {/* Administrator Block Notification Modal */}
      {showAdminModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>⚠️</div>
            <h3 style={styles.modalTitle}>Administrator Registration Blocked</h3>
            <p style={styles.modalBody}>
              You cannot log in or register as an administrator. You can log in or register only as a <strong>Manager</strong> or <strong>Employee</strong>.
            </p>
            <button 
              style={styles.modalButton} 
              onClick={() => setShowAdminModal(false)}
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    position: 'relative'
  },
  card: {
    background: '#ffffff',
    padding: '32px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  logo: {
    width: '48px',
    height: '48px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    borderRadius: '10px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '20px',
    marginBottom: '12px'
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#0f172a'
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '4px'
  },
  alert: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px'
  },
  footerText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#64748b',
    marginTop: '20px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: '28px',
    borderRadius: '12px',
    maxWidth: '420px',
    width: '90%',
    textAlign: 'center',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
  },
  modalIcon: {
    fontSize: '40px',
    marginBottom: '12px'
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '12px'
  },
  modalBody: {
    fontSize: '14px',
    color: '#475569',
    lineHeight: '1.5',
    marginBottom: '20px'
  },
  modalButton: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer'
  }
};

export default Register;
