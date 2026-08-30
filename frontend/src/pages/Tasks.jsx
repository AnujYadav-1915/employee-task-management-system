import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TaskModal from '../components/TaskModal';
import { taskService } from '../services/taskService';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getAll();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (taskData) => {
    try {
      if (editingTask) {
        await taskService.update(editingTask.id, taskData);
      } else {
        await taskService.create(taskData);
      }
      setIsModalOpen(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateStatus(taskId, newStatus);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      try {
        await taskService.delete(taskId);
        fetchTasks();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const columns = [
    { key: 'PENDING', title: 'Pending', color: '#0284c7' },
    { key: 'IN_PROGRESS', title: 'In Progress', color: '#d97706' },
    { key: 'COMPLETED', title: 'Completed', color: '#16a34a' },
    { key: 'ON_HOLD', title: 'On Hold', color: '#9333ea' }
  ];

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Tasks" />

        <div className="page-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`btn ${viewMode === 'kanban' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('kanban')}
              >
                Kanban View
              </button>
              <button 
                className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('list')}
              >
                List View
              </button>
            </div>

            <button className="btn btn-primary" onClick={() => { setEditingTask(null); setIsModalOpen(true); }}>
              + Create Task
            </button>
          </div>

          {loading ? (
            <p style={{ color: '#64748b' }}>Loading...</p>
          ) : viewMode === 'kanban' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {columns.map(col => {
                const colTasks = tasks.filter(t => t.status === col.key);
                return (
                  <div key={col.key} style={{ backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ fontSize: '14px', color: col.color, fontWeight: '700' }}>
                        {col.title} ({colTasks.length})
                      </h4>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {colTasks.map(task => (
                        <div key={task.id} className="card" style={{ padding: '14px', position: 'relative' }}>
                          <span className={`badge badge-${task.priority?.toLowerCase()}`} style={{ marginBottom: '8px' }}>
                            {task.priority}
                          </span>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#0f172a' }}>
                            {task.title}
                          </h4>
                          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                            {task.description || 'No description'}
                          </p>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#475569', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                            <span>👤 {task.assignedEmployeeName || 'Unassigned'}</span>
                            {task.dueDate && <span>📅 {task.dueDate}</span>}
                          </div>

                          <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                            <button 
                              style={styles.actionBtn} 
                              onClick={() => { setEditingTask(task); setIsModalOpen(true); }}
                            >
                              Edit
                            </button>
                            <button 
                              style={{ ...styles.actionBtn, color: '#dc2626' }} 
                              onClick={() => handleDelete(task.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card">
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Assignee</th>
                      <th>Due Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task.id}>
                        <td style={{ fontWeight: '600' }}>{task.title}</td>
                        <td style={{ color: '#64748b', fontSize: '13px' }}>{task.description}</td>
                        <td>
                          <span className={`badge badge-${task.priority?.toLowerCase()}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td>
                          <select 
                            value={task.status} 
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="ON_HOLD">On Hold</option>
                          </select>
                        </td>
                        <td>{task.assignedEmployeeName || 'Unassigned'}</td>
                        <td>{task.dueDate || '-'}</td>
                        <td>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '12px', marginRight: '6px' }}
                            onClick={() => { setEditingTask(task); setIsModalOpen(true); }}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                            onClick={() => handleDelete(task.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <TaskModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSubmit={handleCreateOrUpdate}
            initialTask={editingTask}
          />
        </div>
      </div>
    </div>
  );
};

const styles = {
  actionBtn: {
    padding: '4px 8px',
    fontSize: '11px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default Tasks;
