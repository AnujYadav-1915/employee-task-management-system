import React, { useContext } from 'react';
import { UIContext } from '../context/UIContext';

const LoadingSpinner = () => {
  const { isLoading, loadingText } = useContext(UIContext);

  if (!isLoading) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.spinner}></div>
        <p style={styles.text}>{loadingText || 'Processing request...'}</p>
        <span style={styles.subtext}>Please wait a moment</span>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    animation: 'fadeIn 0.2s ease-out'
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '32px 40px',
    borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '240px',
    textAlign: 'center'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    marginBottom: '16px'
  },
  text: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  },
  subtext: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '6px'
  }
};

export default LoadingSpinner;
