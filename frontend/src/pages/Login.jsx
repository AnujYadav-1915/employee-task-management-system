import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>TF</div>
          <h2 style={styles.title}>Sign in to TaskFlow</h2>
          <p style={styles.subtitle}>Enter your credentials to access your account</p>
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
              placeholder="e.g. admin"
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

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            Sign In
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account? <Link to="/register" style={{ color: '#2563eb', fontWeight: '500' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f1f5f9'
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
  }
};

export default Login;
