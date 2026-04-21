import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertOctagon, Plus, Trash2, Search, Loader2, ShieldAlert } from 'lucide-react';
import './Dashboard.css';

const Watchlist = () => {
  const { user, authFetch } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ passport: '', fullName: '', nationality: 'ETH', reason: '', riskLevel: 'High' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const resp = await authFetch('/api/watchlist');
      if (resp.ok) {
        const data = await resp.json();
        setWatchlist(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (newEntry.passport.length < 6) {
      alert('DOCUMENT ERROR: Passport number must be at least 6 characters long.');
      return;
    }
    setSubmitting(true);
    try {
      const resp = await authFetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });
      if (resp.ok) {
        setShowAddModal(false);
        setNewEntry({ passport: '', fullName: '', nationality: 'ETH', reason: '', riskLevel: 'High' });
        fetchWatchlist();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this subject from the national watchlist?')) return;
    try {
      const resp = await authFetch(`/api/watchlist/${id}`, {
        method: 'DELETE'
      });
      if (resp.ok) {
        fetchWatchlist();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard-container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <AlertOctagon size={32} color="var(--accent-danger)" />
          <h1 className="page-title" style={{margin: 0}}>National Watchlist</h1>
        </div>
        {['Administrator', 'Supervisor'].includes(user?.role) && (
          <button className="sys-btn primary" onClick={() => setShowAddModal(true)} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <Plus size={18} /> Add Subject
          </button>
        )}
      </div>

      <div className="glass-panel" style={{padding: '24px'}}>
        {loading ? (
          <div style={{padding: '40px', textAlign: 'center'}}>
            <Loader2 className="spinner" size={32} />
            <p className="muted">Accessing secure alerts database...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', textAlign: 'left'}}>
                  <th style={{padding: '16px 8px'}}>Passport</th>
                  <th style={{padding: '16px 8px'}}>Subject Name</th>
                  <th style={{padding: '16px 8px'}}>Nationality</th>
                  <th style={{padding: '16px 8px'}}>Alert Reason</th>
                  <th style={{padding: '16px 8px'}}>Risk Level</th>
                  <th style={{padding: '16px 8px', textAlign: 'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map(item => (
                  <tr key={item.id} style={{borderBottom: '1px solid var(--glass-border-light)'}}>
                    <td style={{padding: '16px 8px', fontFamily: 'monospace', color: 'var(--accent-blue)'}}>{item.passport}</td>
                    <td style={{padding: '16px 8px', fontWeight: '500'}}>{item.full_name}</td>
                    <td style={{padding: '16px 8px'}} className="uppercase">{item.nationality}</td>
                    <td style={{padding: '16px 8px', color: 'var(--text-muted)', fontSize: '0.9rem'}}>{item.reason}</td>
                    <td style={{padding: '16px 8px'}}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.5px',
                        background: item.risk_level === 'Critical' ? '#ef4444' : item.risk_level === 'High' ? '#f59e0b' : '#10b981',
                        color: '#000',
                        border: 'none',
                        boxShadow: item.risk_level === 'Critical' ? '0 0 10px rgba(239, 68, 68, 0.4)' : 'none'
                      }}>
                        {item.risk_level.toUpperCase()}
                      </span>
                    </td>
                    <td style={{padding: '16px 8px', textAlign: 'right'}}>
                      {['Administrator', 'Supervisor'].includes(user?.role) && (
                        <button onClick={() => handleDelete(item.id)} className="sys-btn" style={{background: 'transparent', color: 'var(--text-muted)'}}>
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{maxWidth: '500px', width: '100%', padding: '32px'}}>
            <h2 style={{marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px'}}>
              <ShieldAlert color="#ef4444" /> Add Security Alert
            </h2>
            <form onSubmit={handleAdd}>
              <div className="form-group" style={{marginBottom: '16px'}}>
                <label>Passport Number</label>
                <input required type="text" className="sys-input mono uppercase" value={newEntry.passport} onChange={e => setNewEntry({...newEntry, passport: e.target.value})} />
              </div>
              <div className="form-group" style={{marginBottom: '16px'}}>
                <label>Subject Full Name</label>
                <input required type="text" className="sys-input uppercase" value={newEntry.fullName} onChange={e => setNewEntry({...newEntry, fullName: e.target.value})} />
              </div>
              <div className="form-group" style={{marginBottom: '16px'}}>
                <label>Nationality (ISO Code)</label>
                <input required type="text" className="sys-input uppercase" value={newEntry.nationality} onChange={e => setNewEntry({...newEntry, nationality: e.target.value})} maxLength={3} placeholder="ETH" />
              </div>
              <div className="form-group" style={{marginBottom: '16px'}}>
                <label>Alert Risk Level</label>
                <select className="sys-input" value={newEntry.riskLevel} onChange={e => setNewEntry({...newEntry, riskLevel: e.target.value})}>
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Security Alert</option>
                  <option value="Critical">Immediate Intercept</option>
                </select>
              </div>
              <div className="form-group" style={{marginBottom: '32px'}}>
                <label>Reason for Flagging</label>
                <textarea required className="sys-input" rows="3" value={newEntry.reason} onChange={e => setNewEntry({...newEntry, reason: e.target.value})}></textarea>
              </div>
              <div style={{display: 'flex', gap: '16px'}}>
                <button type="button" onClick={() => setShowAddModal(false)} className="sys-btn secondary" style={{flex: 1}}>Cancel</button>
                <button type="submit" className="sys-btn primary" style={{flex: 2}} disabled={submitting}>
                  {submitting ? <Loader2 className="spinner" size={18} /> : 'Confirm Watchlist Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Watchlist;
