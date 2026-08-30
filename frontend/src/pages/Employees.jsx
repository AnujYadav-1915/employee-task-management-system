import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { employeeService } from '../services/employeeService';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Frontend Developer');
  const [department, setDepartment] = useState('Engineering');
  const [status, setStatus] = useState('Available');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (emp = null) => {
    if (emp) {
      setEditingEmp(emp);
      setName(emp.name);
      setEmail(emp.email);
      setRole(emp.role);
      setDepartment(emp.department);
      setStatus(emp.status);
      setPhone(emp.phone || '');
    } else {
      setEditingEmp(null);
      setName('');
      setEmail('');
      setRole('Frontend Developer');
      setDepartment('Engineering');
      setStatus('Available');
      setPhone('');
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, email, role, department, status, phone };
    try {
      if (editingEmp) {
        await employeeService.update(editingEmp.id, payload);
      } else {
        await employeeService.create(payload);
      }
      setShowModal(false);
      fetchEmployees();
    } catch (err) {
      console.error('Error saving employee:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this employee?')) {
      try {
        await employeeService.delete(id);
        fetchEmployees();
      } catch (err) {
        console.error('Error deleting employee:', err);
      }
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Employee Directory" />

        <div className="page-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Team Members ({employees.length})</h3>
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              + Add Employee
            </button>
          </div>

          <div className="card">
            {loading ? (
              <p style={{ color: '#64748b' }}>Loading employees...</p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Phone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length === 0 ? (
                      <tr><td colSpan="7" style={{ textAlign: 'center', color: '#94a3b8' }}>No employees registered</td></tr>
                    ) : (
                      employees.map(emp => (
                        <tr key={emp.id}>
                          <td style={{ fontWeight: '600', color: '#0f172a' }}>{emp.name}</td>
                          <td>{emp.email}</td>
                          <td>{emp.role}</td>
                          <td>{emp.department}</td>
                          <td>
                            <span className="badge" style={{
                              backgroundColor: emp.status === 'Available' ? '#dcfce7' : '#fee2e2',
                              color: emp.status === 'Available' ? '#15803d' : '#b91c1c'
                            }}>
                              {emp.status}
                            </span>
                          </td>
                          <td>{emp.phone || '-'}</td>
                          <td>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '4px 8px', fontSize: '12px', marginRight: '6px' }}
                              onClick={() => handleOpenModal(emp)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-danger" 
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                              onClick={() => handleDelete(emp.id)}
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
            )}
          </div>

          {/* Modal */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>
                  {editingEmp ? 'Edit Employee' : 'Add New Employee'}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <input type="text" className="form-control" value={role} onChange={(e) => setRole(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <input type="text" className="form-control" value={department} onChange={(e) => setDepartment(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="Available">Available</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Busy">Busy</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="text" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">{editingEmp ? 'Update' : 'Add Employee'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Employees;
