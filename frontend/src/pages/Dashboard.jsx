import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { taskService } from '../services/taskService';
import { employeeService } from '../services/employeeService';

const Dashboard = () => {
  const [taskStats, setTaskStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    onHoldTasks: 0
  });
  const [empStats, setEmpStats] = useState({
    totalEmployees: 0,
    availableEmployees: 0,
    onLeaveEmployees: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [tStats, eStats, tasksData] = await Promise.all([
        taskService.getStats().catch(() => ({ totalTasks: 0, pendingTasks: 0, inProgressTasks: 0, completedTasks: 0, onHoldTasks: 0 })),
        employeeService.getStats().catch(() => ({ totalEmployees: 0, availableEmployees: 0, onLeaveEmployees: 0 })),
        taskService.getAll().catch(() => [])
      ]);

      setTaskStats(tStats);
      setEmpStats(eStats);
      setRecentTasks(tasksData.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Dashboard" />

        <div className="page-body">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>📁</div>
              <div className="stat-info">
                <h4>Total Tasks</h4>
                <p>{taskStats.totalTasks}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>⏳</div>
              <div className="stat-info">
                <h4>In Progress</h4>
                <p>{taskStats.inProgressTasks}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>✅</div>
              <div className="stat-info">
                <h4>Completed</h4>
                <p>{taskStats.completedTasks}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>👥</div>
              <div className="stat-info">
                <h4>Total Employees</h4>
                <p>{empStats.totalEmployees}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div className="card">
              <h3 className="card-title">Recent Tasks</h3>

              {loading ? (
                <p style={{ color: '#64748b' }}>Loading...</p>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Assignee</th>
                        <th>Priority</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTasks.length === 0 ? (
                        <tr><td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8' }}>No tasks found</td></tr>
                      ) : (
                        recentTasks.map(task => (
                          <tr key={task.id}>
                            <td style={{ fontWeight: '500' }}>{task.title}</td>
                            <td>{task.assignedEmployeeName || 'Unassigned'}</td>
                            <td>
                              <span className={`badge badge-${task.priority?.toLowerCase()}`}>
                                {task.priority}
                              </span>
                            </td>
                            <td>
                              <span className={`badge badge-${task.status?.toLowerCase()}`}>
                                {task.status?.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="card-title">Team Workload</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                    <span>Active Employees</span>
                    <span style={{ fontWeight: '600' }}>{empStats.availableEmployees} / {empStats.totalEmployees}</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${empStats.totalEmployees ? (empStats.availableEmployees / empStats.totalEmployees) * 100 : 0}%`, 
                      backgroundColor: '#2563eb', 
                      height: '100%' 
                    }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                    <span>On Leave</span>
                    <span style={{ fontWeight: '600' }}>{empStats.onLeaveEmployees}</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${empStats.totalEmployees ? (empStats.onLeaveEmployees / empStats.totalEmployees) * 100 : 0}%`, 
                      backgroundColor: '#f59e0b', 
                      height: '100%' 
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
