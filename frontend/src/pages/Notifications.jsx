import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { taskService } from '../services/taskService';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await taskService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await taskService.markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Notifications" />

        <div className="page-body">
          <div className="card">
            <h3 className="card-title">Activity Notifications</h3>

            {loading ? (
              <p style={{ color: '#64748b' }}>Loading...</p>
            ) : notifications.length === 0 ? (
              <p style={{ color: '#94a3b8', padding: '16px', textAlign: 'center' }}>No notifications found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifications.map(item => (
                  <div 
                    key={item.id} 
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      backgroundColor: item.readStatus ? '#f8fafc' : '#eff6ff',
                      borderLeft: `4px solid ${item.readStatus ? '#cbd5e1' : '#2563eb'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>{item.message}</p>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {!item.readStatus && (
                      <button 
                        className="btn btn-secondary" 
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                        onClick={() => handleMarkAsRead(item.id)}
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
