import React, { useState, useEffect } from 'react';
import { employeeService } from '../services/employeeService';

const TaskModal = ({ isOpen, onClose, onSubmit, initialTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('PENDING');
  const [assignedEmployeeId, setAssignedEmployeeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setPriority(initialTask.priority || 'MEDIUM');
      setStatus(initialTask.status || 'PENDING');
      setAssignedEmployeeId(initialTask.assignedEmployeeId || '');
      setDueDate(initialTask.dueDate || '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setStatus('PENDING');
      setAssignedEmployeeId('');
      setDueDate('');
    }
  }, [initialTask, isOpen]);

  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedEmp = employees.find(emp => emp.id === Number(assignedEmployeeId));
    
    onSubmit({
      title,
      description,
      priority,
      status,
      assignedEmployeeId: assignedEmployeeId ? Number(assignedEmployeeId) : null,
      assignedEmployeeName: selectedEmp ? selectedEmp.name : 'Unassigned',
      dueDate
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>
          {initialTask ? 'Edit Task' : 'Create New Task'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title</label>
            <input 
              type="text" 
              className="form-control" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              placeholder="e.g. Website Redesign"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              className="form-control" 
              rows="3" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed task description..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Priority</label>
              <select className="form-control" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Assignee</label>
              <select 
                className="form-control" 
                value={assignedEmployeeId} 
                onChange={(e) => setAssignedEmployeeId(e.target.value)}
              >
                <option value="">-- Assign Employee --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {initialTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
