import React, { useContext } from 'react';
import { UIContext } from '../context/UIContext';

const ToastNotification = () => {
  const { toast, hideToast } = useContext(UIContext);

  if (!toast.show) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div style={{
      ...styles.container,
      borderLeft: isSuccess ? '5px solid #16a34a' : '5px solid #dc2626',
      backgroundColor: isSuccess ? '#f0fdf4' : '#fef2f2'
    }}>
      <div style={styles.iconContainer}>
        {isSuccess ? '✅' : '❌'}
      </div>
      <div style={styles.content}>
        <div style={{
          ...styles.title,
          color: isSuccess ? '#166534' : '#991b1b'
        }}>
          {toast.title}
        </div>
        <div style={{
          ...styles.message,
          color: isSuccess ? '#15803d' : '#b91c1c'
        }}>
          {toast.message}
        </div>
      </div>
      <button style={styles.closeBtn} onClick={hideToast} title="Close">
        ✕
      </button>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    top: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    padding: '14px 20px',
    borderRadius: '10px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    minWidth: '320px',
    maxWidth: '500px',
    animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  iconContainer: {
    fontSize: '22px',
    marginRight: '12px',
    display: 'flex',
    alignItems: 'center'
  },
  content: {
    flex: 1
  },
  title: {
    fontSize: '14px',
    fontWeight: '700',
    marginBottom: '2px'
  },
  message: {
    fontSize: '13px',
    lineHeight: '1.4'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '14px',
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px 8px',
    marginLeft: '12px',
    fontWeight: 'bold',
    borderRadius: '4px'
  }
};

export default ToastNotification;
