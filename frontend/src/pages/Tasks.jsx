import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TaskModal from '../components/TaskModal';
import { taskService } from '../services/taskService';
import { UIContext } from '../context/UIContext';
import { AuthContext } from '../context/AuthContext';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban');

  const { showLoading, hideLoading, showSuccess, showError } = useContext(UIContext);
  const { user } = useContext(AuthContext);

  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('ALL');
  const [sortBy, setSortBy] = useState('CREATED_AT');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  
  const [progressModalTask, setProgressModalTask] = useState(null);
  const [tempProgress, setTempProgress] = useState(0);
  const [tempNote, setTempNote] = useState('');

  
  const [notesModalTask, setNotesModalTask] = useState(null);
  const [taskComments, setTaskComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await taskService.getAll();
      setTasks(data);
    } catch (err) {
      console.error(err);
      showError('Failed to fetch tasks.', 'Error');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (taskData) => {
    const isEdit = !!editingTask;
    showLoading(isEdit ? 'Saving task modifications...' : 'Creating new task...');
    try {
      if (editingTask) {
        await taskService.update(editingTask.id, taskData);
      } else {
        await taskService.create(taskData);
      }
      hideLoading();
      showSuccess(isEdit ? 'Task details updated successfully!' : 'New task created successfully!', isEdit ? 'Task Saved' : 'Task Created');
      setIsModalOpen(false);
      setEditingTask(null);
      fetchTasks(true);
    } catch (err) {
      hideLoading();
      const msg = err.response?.data?.message || 'Failed to save task. Invalid action.';
      showError(msg, 'Task Action Failed');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    showLoading(`Updating task status to ${newStatus}...`);
    try {
      await taskService.updateStatus(taskId, newStatus);
      hideLoading();
      showSuccess(`Task status changed to ${newStatus.replace('_', ' ')} successfully!`, 'Status Updated');
      fetchTasks(true);
    } catch (err) {
      hideLoading();
      showError('Failed to update task status.', 'Invalid Action');
    }
  };

  const handleProgressUpdate = async (taskId, newPercentage, noteText) => {
    showLoading(`Updating task progress to ${newPercentage}%...`);
    try {
      const author = user?.username || 'Employee';
      await taskService.updateProgress(taskId, newPercentage, noteText, author);
      hideLoading();
      showSuccess(`Task progress updated to ${newPercentage}% with your work note!`, 'Progress Updated');
      fetchTasks(true);
    } catch (err) {
      hideLoading();
      showError('Failed to update progress percentage and note.', 'Invalid Action');
    }
  };

  const handleViewNotes = async (task) => {
    setNotesModalTask(task);
    setLoadingComments(true);
    try {
      const comments = await taskService.getComments(task.id);
      setTaskComments(comments);
    } catch (err) {
      console.error(err);
      setTaskComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      showLoading('Deleting task...');
      try {
        await taskService.delete(taskId);
        hideLoading();
        showSuccess('Task deleted successfully!', 'Task Removed');
        fetchTasks(true);
      } catch (err) {
        hideLoading();
        showError('Failed to delete task.', 'Error');
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

          
          <div className="card" style={{ padding: '16px', marginBottom: '20px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr', gap: '12px', alignItems: 'center' }}>
              
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

              
              <div>
                <label style={styles.label}>Priority Filter</label>
                <select className="form-control" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                  <option value="ALL">All Priorities</option>
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>

              
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

                            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', color: '#0f172a' }}>
                              {task.title}
                            </h4>
                            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                              {task.description || 'No description provided'}
                            </p>

                            
                            <div style={{ marginBottom: '12px', backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px', color: '#475569' }}>
                                <span>⏱️ <strong>{task.allocatedHours || 8} hrs</strong> allocated</span>
                                <span style={{ fontWeight: '700', color: (task.progressPercentage || 0) === 100 ? '#16a34a' : '#2563eb' }}>
                                  {task.progressPercentage || 0}% Done
                                </span>
                              </div>
                              <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                <div 
                                  style={{ 
                                    width: `${task.progressPercentage || 0}%`, 
                                    height: '100%', 
                                    backgroundColor: (task.progressPercentage || 0) === 100 ? '#16a34a' : (task.progressPercentage || 0) > 50 ? '#2563eb' : '#f59e0b',
                                    transition: 'width 0.3s ease'
                                  }} 
                                />
                              </div>
                              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', textAlign: 'right' }}>
                                {(((task.allocatedHours || 8) * (task.progressPercentage || 0)) / 100).toFixed(1)} / {task.allocatedHours || 8} hrs completed
                              </div>
                            </div>

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

                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button 
                                style={{ ...styles.actionBtn, backgroundColor: '#2563eb', color: '#ffffff', borderColor: '#1d4ed8', fontWeight: '600' }}
                                onClick={() => { setProgressModalTask(task); setTempProgress(task.progressPercentage || 0); setTempNote(''); }}
                              >
                                ⚡ Update Progress ({task.progressPercentage || 0}%)
                              </button>
                              <button 
                                style={{ ...styles.actionBtn, backgroundColor: '#f1f5f9', color: '#334155' }}
                                onClick={() => handleViewNotes(task)}
                              >
                                📝 Notes History
                              </button>
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
            
            <div className="card">
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Task Name</th>
                      <th>Description</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Allocated Time</th>
                      <th>Progress (%)</th>
                      <th>Assignee</th>
                      <th>Due Date</th>
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
                          <td style={{ fontWeight: '600', color: '#475569' }}>
                            ⏱️ {task.allocatedHours || 8} hrs
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '150px' }}>
                              <div style={{ flex: 1, height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                <div 
                                  style={{ 
                                    width: `${task.progressPercentage || 0}%`, 
                                    height: '100%', 
                                    backgroundColor: (task.progressPercentage || 0) === 100 ? '#16a34a' : '#2563eb' 
                                  }} 
                                />
                              </div>
                              <button 
                                className="btn btn-primary" 
                                style={{ padding: '3px 8px', fontSize: '11px', fontWeight: '600' }}
                                title="Click to update task progress & add work note"
                                onClick={() => { setProgressModalTask(task); setTempProgress(task.progressPercentage || 0); setTempNote(''); }}
                              >
                                {task.progressPercentage || 0}%
                              </button>
                            </div>
                          </td>
                          <td style={{ fontWeight: '500' }}>{task.assignedEmployeeName || 'Unassigned'}</td>
                          <td style={{ color: '#0284c7', fontWeight: '500' }}>{formatDate(task.dueDate)}</td>
                          <td>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '4px 8px', fontSize: '12px', marginRight: '6px' }}
                              onClick={() => handleViewNotes(task)}
                              title="View progress notes & remarks"
                            >
                              📝 Notes
                            </button>
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

          {}
          {progressModalTask && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '480px', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px', color: '#0f172a' }}>
                  ⚡ Update Task Progress
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                  Task: <strong>{progressModalTask.title}</strong>
                  {progressModalTask.assignedEmployeeName && (
                    <span> • Assignee: <em>{progressModalTask.assignedEmployeeName}</em></span>
                  )}
                </p>

                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#334155' }}>
                    <span>Total Allocated: <strong>{progressModalTask.allocatedHours || 8} Hours</strong></span>
                    <span>Completed: <strong>{(((progressModalTask.allocatedHours || 8) * tempProgress) / 100).toFixed(1)} hrs</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      step="5"
                      value={tempProgress}
                      onChange={(e) => setTempProgress(Number(e.target.value))}
                      style={{ flex: 1, height: '8px', cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: '700', fontSize: '18px', color: '#2563eb', width: '55px', textAlign: 'right' }}>
                      {tempProgress}%
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', gap: '6px' }}>
                    {[0, 25, 50, 75, 100].map(pct => (
                      <button 
                        key={pct}
                        type="button"
                        className="btn btn-secondary"
                        style={{ 
                          padding: '4px 8px', 
                          fontSize: '11px', 
                          backgroundColor: tempProgress === pct ? '#2563eb' : '#ffffff',
                          color: tempProgress === pct ? '#ffffff' : '#334155',
                          borderColor: tempProgress === pct ? '#2563eb' : '#cbd5e1'
                        }}
                        onClick={() => setTempProgress(pct)}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px', display: 'block' }}>
                    ✍️ Progress Note / Work Remarks <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>(optional)</span>
                  </label>
                  <textarea 
                    className="form-control"
                    rows="3"
                    placeholder="e.g. Completed initial API setup and verified authentication (1 hour of work done)..."
                    value={tempNote}
                    onChange={(e) => setTempNote(e.target.value)}
                    style={{ fontSize: '13px' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                    This note will be recorded in the task history and visible to both manager and employee.
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button className="btn btn-secondary" onClick={() => { setProgressModalTask(null); setTempNote(''); }}>
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={async () => {
                      await handleProgressUpdate(progressModalTask.id, tempProgress, tempNote);
                      setProgressModalTask(null);
                      setTempNote('');
                    }}
                  >
                    Save Progress & Note
                  </button>
                </div>
              </div>
            </div>
          )}

          {}
          {notesModalTask && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '520px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                    📝 Progress Notes & Remarks
                  </h3>
                  <button 
                    onClick={() => setNotesModalTask(null)}
                    style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
                  >
                    ✕
                  </button>
                </div>

                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                  Task: <strong>{notesModalTask.title}</strong> • Current Progress: <strong>{notesModalTask.progressPercentage || 0}%</strong>
                </p>

                <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {loadingComments ? (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '16px' }}>Loading notes...</p>
                  ) : taskComments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#94a3b8', fontSize: '13px' }}>
                      No progress notes or comments recorded yet.
                    </div>
                  ) : (
                    taskComments.map(c => (
                      <div key={c.id} style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '600', fontSize: '12px', color: '#2563eb' }}>
                            👤 {c.authorName || 'Team Member'}
                          </span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#334155', whiteSpace: 'pre-wrap', margin: 0 }}>
                          {c.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ fontSize: '12px' }}
                    onClick={() => {
                      const t = notesModalTask;
                      setNotesModalTask(null);
                      setProgressModalTask(t);
                      setTempProgress(t.progressPercentage || 0);
                      setTempNote('');
                    }}
                  >
                    + Add New Progress Note
                  </button>
                  <button className="btn btn-secondary" onClick={() => setNotesModalTask(null)}>
                    Close
                  </button>
                </div>
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
