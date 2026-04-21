import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, UserPlus, Shield, User, Trash2, Loader2, X } from 'lucide-react';
import './Dashboard.css';

const UserManagement = () => {
  const { user, authFetch } = useAuth();
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ agentId: '', name: '', role: 'Officer', password: 'password123' });
  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const resp = await authFetch('/api/users');
      if (resp.ok) {
        const data = await resp.json();
        setPersonnel(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const resp = await authFetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (resp.ok) {
        setShowAddModal(false);
        setNewUser({ agentId: '', name: '', role: 'Officer', password: 'password123' });
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to revoke all access for ${name}? This action is permanent and will be logged.`)) return;
    try {
      const resp = await authFetch(`/api/users/${id}`, {
        method: 'DELETE'
      });
      if (resp.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPersonnel = personnel.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.agent_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (user?.role !== 'Administrator') {
    return (
      <div className="dashboard-container">
        <div className="glass-panel" style={{padding: '40px', textAlign: 'center'}}>
          <Shield size={48} color="#ef4444" style={{margin: '0 auto 20px'}} />
          <h2>Access Denied</h2>
          <p className="muted">You do not have the required administrative clearance to view this module.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <h1 className="page-title" style={{margin: 0}}>Personnel Management</h1>
        <button 
          className="sys-btn primary" 
          style={{display: 'flex', alignItems: 'center', gap: '8px'}}
          onClick={() => setShowAddModal(true)}
        >
          <UserPlus size={18} /> Add Personnel
        </button>
      </div>

      <div className="glass-panel feature-card" style={{padding: '24px'}}>
        {loading ? (
          <div style={{padding: '40px', textAlign: 'center'}}>
            <Loader2 className="spinner" />
            <p className="muted">Retrieving secured personnel list...</p>
          </div>
        ) : (
          <>
            <div style={{display: 'flex', gap: '16px', marginBottom: '24px'}}>
              <div className="search-bar" style={{flex: 1, display: 'flex', gap: '12px', background: 'var(--bg-dark)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--glass-border)'}}>
                <Search size={20} color="var(--text-muted)" />
                <input 
                  type="text" 
                  placeholder="Search by Agent ID or Name..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{background: 'transparent', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none'}} 
                />
              </div>
            </div>

            <div className="table-responsive">
              <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                <thead>
                  <tr style={{borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)'}}>
                    <th style={{padding: '16px 8px', fontWeight: '500'}}>Agent ID</th>
                    <th style={{padding: '16px 8px', fontWeight: '500'}}>Name</th>
                    <th style={{padding: '16px 8px', fontWeight: '500'}}>Role</th>
                    <th style={{padding: '16px 8px', fontWeight: '500'}}>Status</th>
                    <th style={{padding: '16px 8px', fontWeight: '500', textAlign: 'right'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPersonnel.map(p => (
                    <tr key={p.id} style={{borderBottom: '1px solid var(--glass-border-light)'}}>
                      <td style={{padding: '16px 8px', fontFamily: 'monospace', color: 'var(--accent-blue)'}}>{p.agent_id}</td>
                      <td style={{padding: '16px 8px'}}>{p.name}</td>
                      <td style={{padding: '16px 8px'}}>
                        <span style={{
                          display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800',
                          background: p.role === 'Administrator' ? 'rgba(239, 68, 68, 0.2)' : p.role === 'Supervisor' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: p.role === 'Administrator' ? '#ef4444' : p.role === 'Supervisor' ? '#f59e0b' : '#10b981',
                          border: `1px solid ${p.role === 'Administrator' ? '#ef4444' : p.role === 'Supervisor' ? '#f59e0b' : '#10b981'}`
                        }}>
                          {p.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{padding: '16px 8px'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                           <div style={{width: '6px', height: '6px', borderRadius: '50%', background: p.status === 'Active' ? '#10b981' : '#444'}}></div>
                           <span style={{fontSize: '0.85rem', color: p.status === 'Active' ? 'var(--text-main)' : 'var(--text-muted)'}}>{p.status}</span>
                        </div>
                      </td>
                      <td style={{padding: '16px 8px', textAlign: 'right'}}>
                        {p.agent_id !== user.agentId && (
                          <button 
                            onClick={() => handleDelete(p.id, p.name)}
                            className="sys-btn" 
                            style={{background: 'transparent', padding: '8px', color: 'var(--text-muted)', cursor: 'pointer'}}
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredPersonnel.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{padding: '40px', textAlign: 'center'}} className="muted">No matches found in personnel records.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{maxWidth: '450px', width: '100%', padding: '32px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
              <h2>Add New Personnel</h2>
              <button onClick={() => setShowAddModal(false)} style={{background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'}}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="form-group" style={{marginBottom: '16px'}}>
                <label style={{display: 'block', marginBottom: '8px', color: 'var(--text-muted)'}}>Agent ID</label>
                <input 
                  required 
                  type="text" 
                  className="sys-input mono" 
                  placeholder="e.g. AGT-007"
                  value={newUser.agentId}
                  onChange={e => setNewUser({...newUser, agentId: e.target.value.toUpperCase()})}
                />
              </div>
              <div className="form-group" style={{marginBottom: '16px'}}>
                <label style={{display: 'block', marginBottom: '8px', color: 'var(--text-muted)'}}>Full Name</label>
                <input 
                  required 
                  type="text" 
                  className="sys-input" 
                  placeholder="e.g. John Doe"
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                />
              </div>
              <div className="form-group" style={{marginBottom: '16px'}}>
                <label style={{display: 'block', marginBottom: '8px', color: 'var(--text-muted)'}}>Role</label>
                <select 
                  className="sys-input"
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="Officer">Border Officer</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>
              <div className="form-group" style={{marginBottom: '32px'}}>
                <label style={{display: 'block', marginBottom: '8px', color: 'var(--text-muted)'}}>Default Passcode</label>
                <input 
                  required 
                  type="password" 
                  className="sys-input mono"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <button 
                type="submit" 
                className="sys-btn primary" 
                style={{width: '100%', display: 'flex', justifyContent: 'center', gap: '8px'}}
                disabled={submitting}
              >
                {submitting ? <Loader2 className="spinner" size={18} /> : <UserPlus size={18} />}
                {submitting ? 'Registering...' : 'Register Personnel'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
export default UserManagement;
