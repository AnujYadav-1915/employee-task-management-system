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

  // Search, Sort, & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('ALL');
  const [sortBy, setSortBy] = useState('CREATED_AT');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

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

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  // Filter and Sort Pipeline
  const filteredAndSortedTasks = tasks
    .filter((task) => {
      if (filterStatus !== 'ALL' && task.status !== filterStatus) return false;
      if (filterPriority !== 'ALL' && task.priority !== filterPriority) return false;

      if (!searchTerm.trim()) return true;

      const term = searchTerm.toLowerCase().trim();
      const titleMatch = task.title?.toLowerCase().includes(term);
      const assigneeMatch = task.assignedEmployeeName?.toLowerCase().includes(term);
      const dueDateMatch = task.dueDate?.toLowerCase().includes(term);
      const createdAtFormatted = formatDate(task.createdAt).toLowerCase();
      const createdAtMatch = createdAtFormatted.includes(term) || (task.createdAt && task.createdAt.includes(term));
      const updatedAtFormatted = formatDate(task.updatedAt).toLowerCase();
      const updatedAtMatch = updatedAtFormatted.includes(term) || (task.updatedAt && task.updatedAt.includes(term));

      if (searchField === 'TITLE') return titleMatch;
      if (searchField === 'ASSIGNEE') return assigneeMatch;
      if (searchField === 'DUE_DATE') return dueDateMatch;
      if (searchField === 'CREATED_AT') return createdAtMatch;
      if (searchField === 'UPDATED_AT') return updatedAtMatch;

      return titleMatch || assigneeMatch || dueDateMatch || createdAtMatch || updatedAtMatch;
    })
    .sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'CREATED_AT') {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        comparison = timeA - timeB;
      } else if (sortBy === 'UPDATED_AT') {
        const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        comparison = timeA - timeB;
      } else if (sortBy === 'DUE_DATE') {
        const timeA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const timeB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        comparison = timeA - timeB;
      } else if (sortBy === 'PRIORITY') {
        const priorityScore = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        comparison = (priorityScore[a.priority] || 0) - (priorityScore[b.priority] || 0);
      } else if (sortBy === 'TITLE') {
        comparison = (a.title || '').localeCompare(b.title || '');
      }

      return sortOrder === 'DESC' ? -comparison : comparison;
    });

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
        <Navbar title="Tasks Management" />

        <div className="page-body">
          {/* Top Control Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`btn ${viewMode === 'kanban' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('kanban')}
              >
                📋 Kanban View
              </button>
              <button 
                className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('list')}
              >
                📄 List View
              </button>
            </div>

            <button className="btn btn-primary" onClick={() => { setEditingTask(null); setIsModalOpen(true); }}>
              + Create Task
            </button>
          </div>

          {/* Search, Filter, and Sort Bar */}
          <div className="card" style={{ padding: '16px', marginBottom: '20px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr', gap: '12px', alignItems: 'center' }}>
              {/* Search Bar Input */}
              <div>
                <label style={styles.label}>Search Tasks</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Type to search..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Search Field Dropdown */}
              <div>
                <label style={styles.label}>Search By</label>
                <select className="form-control" value={searchField} onChange={(e) => setSearchField(e.target.value)}>
                  <option value="ALL">All Fields</option>
                  <option value="TITLE">Task Name</option>
                  <option value="ASSIGNEE">Assignee Name</option>
                  <option value="DUE_DATE">Due Date</option>
                  <option value="CREATED_AT">Date Added</option>
                  <option value="UPDATED_AT">Date Modified</option>
                </select>
              </div>

              {/* Sort By Field */}
              <div>
                <label style={styles.label}>Sort By</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select className="form-control" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="CREATED_AT">Date Added / Created</option>
                    <option value="UPDATED_AT">Date Modified</option>
                    <option value="DUE_DATE">Due Date</option>
                    <option value="PRIORITY">Priority</option>
                    <option value="TITLE">Task Name (A-Z)</option>
                  </select>
                  <button 
                    className="btn btn-secondary"
                    title={sortOrder === 'DESC' ? 'Descending (Newest First)' : 'Ascending (Oldest First)'}
                    onClick={() => setSortOrder(prev => prev === 'DESC' ? 'ASC' : 'DESC')}
                    style={{ padding: '0 12px', fontSize: '14px', fontWeight: 'bold' }}
                  >
                    {sortOrder === 'DESC' ? '⬇' : '⬆'}
                  </button>
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label style={styles.label}>Priority Filter</label>
                <select className="form-control" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                  <option value="ALL">All Priorities</option>
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label style={styles.label}>Status Filter</label>
                <select className="form-control" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ON_HOLD">On Hold</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <p style={{ color: '#64748b' }}>Loading tasks...</p>
          ) : viewMode === 'kanban' ? (
            /* Kanban View */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {columns.map(col => {
                const colTasks = filteredAndSortedTasks.filter(t => t.status === col.key);
                return (
                  <div key={col.key} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <h4 style={{ fontSize: '14px', color: col.color, fontWeight: '700' }}>
                        {col.title} ({colTasks.length})
                      </h4>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {colTasks.length === 0 ? (
                        <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '12px', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
                          No tasks match criteria
                        </div>
                      ) : (
                        colTasks.map(task => (
                          <div key={task.id} className="card" style={{ padding: '14px', borderLeft: `4px solid ${col.color}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span className={`badge badge-${task.priority?.toLowerCase()}`}>
                                {task.priority}
                              </span>
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                #{task.id}
                              </span>
                            </div>

                            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#0f172a' }}>
                              {task.title}
                            </h4>
                            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                              {task.description || 'No description provided'}
                            </p>

                            <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginBottom: '10px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>👤 {task.assignedEmployeeName || 'Unassigned'}</span>
                                <span>📅 Due: {formatDate(task.dueDate)}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '10px' }}>
                                <span>Added: {formatDate(task.createdAt)}</span>
                                <span>Modified: {formatDate(task.updatedAt)}</span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '6px' }}>
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
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="card">
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Task Name</th>
                      <th>Description</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Assignee</th>
                      <th>Due Date</th>
                      <th>Date Added</th>
                      <th>Date Modified</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedTasks.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                          No tasks match search and filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredAndSortedTasks.map(task => (
                        <tr key={task.id}>
                          <td style={{ fontWeight: '600', color: '#0f172a' }}>{task.title}</td>
                          <td style={{ color: '#64748b', fontSize: '13px' }}>{task.description || '-'}</td>
                          <td>
                            <span className={`badge badge-${task.priority?.toLowerCase()}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td>
                            <select 
                              value={task.status} 
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}
                              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                            >
                              <option value="PENDING">Pending</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="ON_HOLD">On Hold</option>
                            </select>
                          </td>
                          <td style={{ fontWeight: '500' }}>{task.assignedEmployeeName || 'Unassigned'}</td>
                          <td style={{ color: '#0284c7', fontWeight: '500' }}>{formatDate(task.dueDate)}</td>
                          <td style={{ color: '#64748b', fontSize: '12px' }}>{formatDate(task.createdAt)}</td>
                          <td style={{ color: '#64748b', fontSize: '12px' }}>{formatDate(task.updatedAt)}</td>
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
                      ))
                    )}
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
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    color: '#475569',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
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
