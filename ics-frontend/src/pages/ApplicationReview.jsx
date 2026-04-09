import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search, ClipboardList, CheckCircle, XCircle, Clock, FileText, 
  X, Shield, Loader2, Eye, ChevronRight, Inbox, AlertTriangle,
  Calendar, Globe, Plane, User, Scan
} from 'lucide-react';
import './ApplicationReview.css';

const STATUS_CONFIG = {
  Pending: { color: 'pending', icon: Clock, label: 'Pending Review' },
  Approved: { color: 'approved', icon: CheckCircle, label: 'Approved' },
  Rejected: { color: 'rejected', icon: XCircle, label: 'Rejected' },
  'Under Review': { color: 'under-review', icon: Eye, label: 'Under Review' },
};

const StatusPill = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  return (
    <span className={`status-pill ${config.color}`}>
      <span className="status-dot"></span>
      {config.label}
    </span>
  );
};

const ApplicationReview = () => {
  const { user, authFetch } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [biometricData, setBiometricData] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  // Confirmation dialog state
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionReason, setActionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const resp = await authFetch(`http://localhost:5000/api/applications?${params.toString()}`);
      if (resp.ok) {
        const data = await resp.json();
        setApplications(data);
      }
    } catch (err) {
      console.error('Application retrieval failed:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, authFetch]);

  const fetchStats = useCallback(async () => {
    try {
      const resp = await authFetch('http://localhost:5000/api/stats');
      if (resp.ok) {
        const data = await resp.json();

        // Also fetch all apps for status breakdown
        const appsResp = await authFetch('http://localhost:5000/api/applications');
        if (appsResp.ok) {
          const apps = await appsResp.json();
          setStats({
            total: apps.length,
            pending: apps.filter(a => a.status === 'Pending').length,
            approved: apps.filter(a => a.status === 'Approved').length,
            rejected: apps.filter(a => a.status === 'Rejected').length,
          });
        }
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [fetchApplications, fetchStats]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      fetchApplications();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleStatusChange = async (appId, newStatus) => {
    setSubmitting(true);
    try {
      const resp = await authFetch(`http://localhost:5000/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          reason: actionReason || 'No reason provided'
        })
      });

      if (resp.ok) {
        const updated = await resp.json();
        setApplications(prev => prev.map(a => a.id === appId ? updated : a));
        if (selectedApp?.id === appId) setSelectedApp(updated);
        setConfirmAction(null);
        setActionReason('');
        fetchStats();
      }
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const openConfirmDialog = (action) => {
    setConfirmAction(action);
    setActionReason('');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const fetchForensicData = async (passport) => {
    try {
      const [riskResp, bioResp] = await Promise.all([
        authFetch(`http://localhost:5000/api/risk-profile/${passport}`),
        authFetch(`http://localhost:5000/api/biometric/check/${passport}`)
      ]);
      
      if (riskResp.ok) {
        const data = await riskResp.json();
        setRiskData(data.risk);
      }
      if (bioResp.ok) {
        const bData = await bioResp.json();
        setBiometricData(bData);
      }
    } catch (err) {
      setRiskData(null);
      setBiometricData(null);
    }
  };

  useEffect(() => {
    if (selectedApp) {
      fetchForensicData(selectedApp.passport_number);
    } else {
      setRiskData(null);
      setBiometricData(null);
    }
  }, [selectedApp]);

  if (!['Administrator', 'Supervisor'].includes(user?.role)) {
    return (
      <div className="app-review-container">
        <div className="glass-panel" style={{padding: '60px', textAlign: 'center'}}>
          <Shield size={48} color="#ef4444" style={{margin: '0 auto 20px'}} />
          <h2>Access Denied</h2>
          <p className="muted">You do not have the required clearance for visa adjudication.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-review-container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px'}}>
        <div>
          <h1 className="page-title">Visa Applications</h1>
          <p className="muted" style={{fontSize: '0.85rem'}}>
            Review, adjudicate, and manage incoming visa and border crossing requests.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="app-summary-grid">
        <div className="glass-panel app-summary-card" onClick={() => setStatusFilter('All')}>
          <div className="summary-icon total"><Inbox size={24} /></div>
          <div className="summary-info">
            <h4>Total Received</h4>
            <div className="summary-value">{stats.total}</div>
          </div>
        </div>
        <div className="glass-panel app-summary-card" onClick={() => setStatusFilter('Pending')}>
          <div className="summary-icon pending"><Clock size={24} /></div>
          <div className="summary-info">
            <h4>Awaiting Review</h4>
            <div className="summary-value" style={{color: '#fbbf24'}}>{stats.pending}</div>
          </div>
        </div>
        <div className="glass-panel app-summary-card" onClick={() => setStatusFilter('Approved')}>
          <div className="summary-icon approved"><CheckCircle size={24} /></div>
          <div className="summary-info">
            <h4>Approved</h4>
            <div className="summary-value" style={{color: '#10b981'}}>{stats.approved}</div>
          </div>
        </div>
        <div className="glass-panel app-summary-card" onClick={() => setStatusFilter('Rejected')}>
          <div className="summary-icon rejected"><XCircle size={24} /></div>
          <div className="summary-info">
            <h4>Rejected</h4>
            <div className="summary-value" style={{color: '#ef4444'}}>{stats.rejected}</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="app-filter-bar">
        <div className="filter-search">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by passport, name, or reference number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setLoading(true); }}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Under Review">Under Review</option>
        </select>
      </div>

      {/* Applications Table */}
      <div className="glass-panel" style={{padding: '0', overflow: 'hidden'}}>
        {loading ? (
          <div style={{padding: '60px', textAlign: 'center'}}>
            <Loader2 className="spinner" size={28} />
            <p className="muted" style={{marginTop: '12px'}}>Retrieving application records...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={48} />
            <h3>No Applications Found</h3>
            <p>No visa applications match your current filter criteria.</p>
          </div>
        ) : (
          <div className="app-table-wrapper">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Applicant</th>
                  <th>Passport</th>
                  <th>Nationality</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Risk</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id} onClick={() => setSelectedApp(app)}>
                    <td className="mono" style={{color: 'var(--accent-blue)'}}>{app.reference_number}</td>
                    <td style={{fontWeight: 500}}>{app.first_name} {app.last_name}</td>
                    <td className="mono">{app.passport_number}</td>
                    <td>{app.nationality || '—'}</td>
                    <td>{app.purpose || '—'}</td>
                    <td><StatusPill status={app.status} /></td>
                    <td>
                      {app.risk_level === 'Critical' && <span className="risk-tag critical">CRITICAL</span>}
                      {app.risk_level === 'High' && <span className="risk-tag high">HIGH</span>}
                      {app.risk_level === 'Elevated' && <span className="risk-tag elevated">ELEVATED</span>}
                    </td>
                    <td style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>{formatDate(app.created_at)}</td>
                    <td><ChevronRight size={16} color="var(--text-muted)" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selectedApp && (
        <>
          <div className="drawer-overlay" onClick={() => setSelectedApp(null)} />
          <div className="detail-drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>
                <FileText size={20} color="var(--accent-blue)" />
                Application Detail
              </h2>
              <button className="drawer-close" onClick={() => setSelectedApp(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              {/* Status Banner */}
              <div style={{
                padding: '16px 20px',
                borderRadius: '12px',
                marginBottom: '24px',
                background: selectedApp.status === 'Approved' ? 'rgba(16,185,129,0.08)' :
                           selectedApp.status === 'Rejected' ? 'rgba(239,68,68,0.08)' :
                           selectedApp.status === 'Under Review' ? 'rgba(59,130,246,0.08)' :
                           'rgba(251,191,36,0.08)',
                border: `1px solid ${
                  selectedApp.status === 'Approved' ? 'rgba(16,185,129,0.2)' :
                  selectedApp.status === 'Rejected' ? 'rgba(239,68,68,0.2)' :
                  selectedApp.status === 'Under Review' ? 'rgba(59,130,246,0.2)' :
                  'rgba(251,191,36,0.2)'
                }`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <StatusPill status={selectedApp.status} />
                <span className="mono" style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>
                  {selectedApp.reference_number}
                </span>
              </div>

              {/* Risk Assessment Indicator */}
              {riskData && (
                <div className={`drawer-section risk-indicator level-${riskData.level.toLowerCase()}`} style={{
                  background: 'var(--bg-dark)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  marginBottom: '24px'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                    <h3 style={{margin: 0, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <Shield size={16} /> Forensic Risk Rating
                    </h3>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: riskData.level === 'Critical' ? '#ef4444' : riskData.level === 'Elevated' ? '#fbbf24' : '#10b981',
                      color: '#000'
                    }}>{riskData.level}</span>
                  </div>
                  <div style={{fontSize: '1.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'baseline', gap: '8px'}}>
                    {riskData.score} <span style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>INTELLIGENCE SCORE</span>
                  </div>
                  <div className="risk-evidence-list" style={{marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                    {riskData.factors.map((factor, idx) => (
                      <div key={idx} className="evidence-item" style={{
                        fontSize: '0.75rem', 
                        padding: '8px 12px', 
                        background: 'rgba(255,255,255,0.05)', 
                        borderRadius: '6px',
                        borderLeft: `3px solid ${riskData.level === 'Critical' ? '#ef4444' : riskData.level === 'High' ? '#f59e0b' : '#3b82f6'}`,
                        color: 'var(--text-soft)'
                      }}>
                        {factor}
                      </div>
                    ))}
                  </div>
                  <button 
                    className="evidence-link" 
                    onClick={() => navigate(`/admin/profile/${selectedApp.passport_number}`)}
                    style={{
                      marginTop: '16px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-blue)',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    View Comprehensive Forensic Profile <ChevronRight size={12} />
                  </button>
                </div>
              )}

              {/* Biometric Integrity Section */}
              {biometricData && (
                <div className={`drawer-section biometric-integrity status-${biometricData.status.toLowerCase().replace(' ', '-')}`} style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  marginBottom: '20px',
                  position: 'relative'
                }}>
                   <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                    <h3 style={{margin: 0, fontSize: '0.8rem', color: 'var(--accent-blue)'}}><Scan size={14} style={{marginRight: 6, verticalAlign: 'middle'}} />Biometric Integrity</h3>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: biometricData.status === 'Verified' ? 'var(--accent-emerald)' : biometricData.status === 'Anomaly Detected' ? '#ef4444' : '#fbbf24',
                      color: '#000'
                    }}>{biometricData.status}</span>
                  </div>
                  <div style={{fontSize: '1.4rem', fontWeight: 'bold'}}>
                    {biometricData.score}% <span style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>MATCH SCORE</span>
                  </div>
                  <p style={{fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0'}}>
                    {biometricData.details}
                  </p>
                </div>
              )}

              {/* Applicant Information */}
              <div className="drawer-section">
                <h3><User size={14} style={{marginRight: 6, verticalAlign: 'middle'}} />Applicant Information</h3>
                <div className="detail-grid">
                  <div className="detail-field">
                    <label>First Name</label>
                    <div className="detail-value">{selectedApp.first_name}</div>
                  </div>
                  <div className="detail-field">
                    <label>Last Name</label>
                    <div className="detail-value">{selectedApp.last_name}</div>
                  </div>
                  <div className="detail-field">
                    <label>Passport Number</label>
                    <div className="detail-value mono">{selectedApp.passport_number}</div>
                  </div>
                  <div className="detail-field">
                    <label>Nationality</label>
                    <div className="detail-value">{selectedApp.nationality || '—'}</div>
                  </div>
                  <div className="detail-field">
                    <label>Date of Birth</label>
                    <div className="detail-value">{formatDate(selectedApp.dob)}</div>
                  </div>
                </div>
              </div>

              {/* Travel Details */}
              <div className="drawer-section">
                <h3><Plane size={14} style={{marginRight: 6, verticalAlign: 'middle'}} />Travel Details</h3>
                <div className="detail-grid">
                  <div className="detail-field">
                    <label>Purpose of Travel</label>
                    <div className="detail-value">{selectedApp.purpose || '—'}</div>
                  </div>
                  <div className="detail-field">
                    <label>Planned Travel Date</label>
                    <div className="detail-value">{formatDate(selectedApp.travel_date)}</div>
                  </div>
                </div>
              </div>

              {/* System Metadata */}
              <div className="drawer-section">
                <h3><Calendar size={14} style={{marginRight: 6, verticalAlign: 'middle'}} />System Record</h3>
                <div className="detail-grid">
                  <div className="detail-field">
                    <label>Reference Number</label>
                    <div className="detail-value mono">{selectedApp.reference_number}</div>
                  </div>
                  <div className="detail-field">
                    <label>Submitted On</label>
                    <div className="detail-value">{formatDateTime(selectedApp.created_at)}</div>
                  </div>
                  <div className="detail-field full-width">
                    <label>Current Status</label>
                    <div className="detail-value" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <StatusPill status={selectedApp.status} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Issuance Section (Only for approved) */}
              {selectedApp.status === 'Approved' && (
                <div className="drawer-section" style={{borderTop: '2px dashed var(--glass-border)', paddingTop: '24px'}}>
                   <h3 style={{color: 'var(--accent-emerald)'}}><Shield size={14} style={{marginRight: 6, verticalAlign: 'middle'}} /> Mission Issuance</h3>
                   <p className="muted" style={{fontSize: '0.8rem', marginBottom: '16px'}}>This traveler has been cleared. You can now issue the formal electronic document.</p>
                   <button 
                     className="sys-btn primary" 
                     style={{width: '100%', background: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)'}}
                     onClick={() => window.open(`/admin/visa/${selectedApp.reference_number}`, '_blank')}
                   >
                     <FileText size={18} /> Generate & Issue e-Visa
                   </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="drawer-actions">
              <button
                className="action-btn approve"
                onClick={() => openConfirmDialog('Approved')}
                disabled={selectedApp.status === 'Approved'}
              >
                <CheckCircle size={16} /> <span>Approve</span>
              </button>
              <button
                className="action-btn hold"
                onClick={() => openConfirmDialog('Under Review')}
                disabled={selectedApp.status === 'Under Review'}
              >
                <Eye size={16} /> <span>Hold</span>
              </button>
              <button
                 className="action-btn pending"
                 style={{background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)'}}
                 onClick={() => openConfirmDialog('Pending')}
                 disabled={selectedApp.status === 'Pending'}
              >
                 <Clock size={16} /> <span>Reset</span>
              </button>
              <button
                className="action-btn reject"
                onClick={() => openConfirmDialog('Rejected')}
                disabled={selectedApp.status === 'Rejected'}
              >
                <XCircle size={16} /> <span>Reject</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="confirm-overlay" onClick={() => setConfirmAction(null)}>
          <div className="glass-panel confirm-dialog" onClick={e => e.stopPropagation()}>
            <h3 style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              {confirmAction === 'Approved' && <><CheckCircle size={20} color="#10b981" /> Approve Application</>}
              {confirmAction === 'Rejected' && <><AlertTriangle size={20} color="#ef4444" /> Reject Application</>}
              {confirmAction === 'Under Review' && <><Eye size={20} color="#3b82f6" /> Place Under Review</>}
              {confirmAction === 'Pending' && <><Clock size={20} color="#fbbf24" /> Revert to Pending Review</>}
            </h3>
            <p>
              You are about to change the status of 
              <strong> {selectedApp?.reference_number}</strong> ({selectedApp?.first_name} {selectedApp?.last_name}) 
              to <strong>{confirmAction}</strong>.
            </p>
            <p style={{fontSize: '0.8rem'}}>This action will be recorded in the forensic audit trail.</p>
            <textarea
              placeholder="Provide a reason for this decision (optional but recommended)..."
              value={actionReason}
              onChange={e => setActionReason(e.target.value)}
            />
            <div className="confirm-actions">
              <button className="cancel-btn" onClick={() => setConfirmAction(null)}>Cancel</button>
              <button
                className={`proceed-btn ${confirmAction === 'Approved' ? 'approve-action' : confirmAction === 'Rejected' ? 'reject-action' : confirmAction === 'Pending' ? 'pending-action' : 'hold-action'}`}
                style={confirmAction === 'Pending' ? {background: '#fbbf24', color: '#000'} : {}}
                onClick={() => handleStatusChange(selectedApp.id, confirmAction)}
                disabled={submitting}
              >
                {submitting ? 'Processing...' : `Confirm ${confirmAction === 'Under Review' ? 'Hold' : confirmAction === 'Pending' ? 'Reset' : confirmAction}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ApplicationReview;
