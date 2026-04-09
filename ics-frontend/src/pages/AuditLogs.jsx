import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Clock, User, Activity, Loader2, RefreshCw, Terminal, Globe } from 'lucide-react';
import './Dashboard.css';

const AuditLogs = () => {
  const { user, authFetch } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const resp = await authFetch('http://localhost:5000/api/audit');
      if (resp.ok) {
        const data = await resp.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Audit fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionClass = (action) => {
    if (action.includes('REMOVED') || action.includes('DECOMMISSIONED') || action.includes('FAILED')) return 'status-danger';
    if (action.includes('CREATED') || action.includes('ADDED') || action.includes('SUCCESS')) return 'status-success';
    return 'status-info';
  };

  if (user?.role !== 'Administrator') {
    return (
      <div className="dashboard-container">
        <div className="glass-panel animate-fade-in" style={{padding: '60px', textAlign: 'center'}}>
          <Shield size={64} className="accent-red" style={{margin: '0 auto 24px', opacity: 0.8}} />
          <h2 className="text-xl">Clearance Insufficient</h2>
          <p className="muted" style={{maxWidth: '400px', margin: '16px auto'}}>
            The Operational Audit Trail contains classified administrative signals. Access is restricted to <strong>Level 4 Mission Administrators</strong> only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container animate-fade-in">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px'}}>
        <div>
          <h1 className="page-title" style={{marginBottom: '4px'}}>Forensic Audit Trail</h1>
          <p className="muted text-sm">Secure record of all administrative commands and system state transitions.</p>
        </div>
        <button onClick={fetchLogs} className="sys-btn secondary" disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spinner' : ''} style={{marginRight: '8px'}} />
          {loading ? 'SYNCING ARCHIVES...' : 'REFRESH SIGNAL'}
        </button>
      </div>

      <div className="glass-panel" style={{overflow: 'hidden'}}>
        {loading ? (
          <div style={{padding: '100px', textAlign: 'center'}}>
            <Loader2 className="spinner accent-blue" size={48} />
            <p className="muted" style={{marginTop: '20px', letterSpacing: '1px'}}>DECRYPTING COMMAND HISTORY...</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="crossing-table audit-table">
              <thead>
                <tr>
                  <th style={{paddingLeft: '24px'}}>Timestamp (UTC)</th>
                  <th>Agent Context</th>
                  <th>Operational Action</th>
                  <th>Technical Metadata</th>
                  <th style={{paddingRight: '24px'}}>Network Origin</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td style={{paddingLeft: '24px', color: 'var(--text-muted)'}} className="text-xs">
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <Clock size={12} className="accent-blue" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <div style={{width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyCenter: 'center'}}>
                          <User size={14} className="accent-blue" style={{margin: 'auto'}} />
                        </div>
                        <strong>{log.agent_id}</strong>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${getActionClass(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="detail-box">
                        <Terminal size={12} style={{marginRight: '8px'}} />
                        <code>{log.details.length > 40 ? log.details.substring(0, 40) + '...' : log.details}</code>
                      </div>
                    </td>
                    <td style={{paddingRight: '24px'}} className="mono text-xs muted">
                      <Globe size={12} style={{marginRight: '6px', verticalAlign: 'middle'}} />
                      {log.ip_address}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{padding: '80px', textAlign: 'center'}}>
                      <Activity size={48} className="muted" style={{marginBottom: '16px', opacity: 0.5}} />
                      <p className="muted">No encrypted log entries detected in the current session.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .audit-table tr { height: 64px; }
        .detail-box { 
          display: flex; 
          align-items: center; 
          background: rgba(0,0,0,0.2); 
          padding: 6px 12px; 
          border-radius: 6px; 
          border: 1px solid var(--glass-border-light);
          font-size: 0.8rem;
          max-width: 280px;
        }
        .status-pill.status-success { background: rgba(16, 185, 129, 0.1); color: var(--accent-emerald); }
        .status-pill.status-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
        .status-pill.status-info { background: rgba(59, 130, 246, 0.1); color: var(--accent-blue); }
        .spinner { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AuditLogs;
