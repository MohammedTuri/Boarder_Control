import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Shield, AlertTriangle, CheckCircle, Clock, 
  ArrowLeft, FileText, Globe, Calendar, Plane, 
  Loader2, ExternalLink, Activity, Info, Scan
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './TravelerProfile.css';

const TravelerProfile = () => {
  const { passport } = useParams();
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const resp = await authFetch(`http://localhost:5000/api/risk-profile/${passport}`);
        if (resp.ok) {
          setData(await resp.json());
        } else {
          setError('Failed to retrieve forensic intelligence profile.');
        }
      } catch (err) {
        setError('Communication failure with central intelligence database.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [passport, authFetch]);

  if (loading) {
    return (
      <div className="profile-loading">
        <Loader2 className="spinner" size={48} color="var(--accent-blue)" />
        <p>Deciphering traveler intelligence archives...</p>
      </div>
    );
  }

  if (error || !data?.profile) {
    return (
      <div className="dashboard-container">
        <button onClick={() => navigate(-1)} className="back-btn"><ArrowLeft size={18} /> Back</button>
        <div className="glass-panel error-panel">
          <AlertTriangle size={48} />
          <h2>Intelligence Not Found</h2>
          <p>{error || 'No historical records exist for this document in the current station.'}</p>
        </div>
      </div>
    );
  }

  const { profile, history, applications, risk } = data;

  // Calculate Primary Port (Forensic logic)
  const stationCounts = history.reduce((acc, h) => {
    const station = h.point_of_entry || 'Legacy Station';
    acc[station] = (acc[station] || 0) + 1;
    return acc;
  }, {});
  const primaryPort = Object.entries(stationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  return (
    <div className="dashboard-container profile-container animate-fade-in">
      <div className="profile-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={18} /> Back to Query
        </button>
        <div className="header-meta">
          <span className="badge">FORENSIC PROFILE</span>
          <span className="mono text-muted">ID: {passport}</span>
        </div>
      </div>

      <div className="profile-grid">
        {/* Sidebar: Identity & Risk */}
        <div className="profile-sidebar">
          <div className="glass-panel identity-card">
            <div className="avatar-wrapper">
              {profile.photo_url ? (
                <img src={`http://localhost:5000${profile.photo_url}`} alt="Traveler" />
              ) : (
                <User size={64} />
              )}
            </div>
            <h2>{profile.full_name}</h2>
            <p className="passport-id mono">{profile.passport}</p>
            <div className="nationality-badge">
              <Globe size={14} /> {profile.nationality}
            </div>
          </div>

          <div className={`glass-panel risk-card level-${risk.level.toLowerCase()}`}>
            <div className="risk-header">
              <h3><Shield size={18} /> Risk Assessment</h3>
              <span className={`risk-badge`}>{risk.level}</span>
            </div>
            <div className="risk-score">
              <span className="score-val">{risk.score}</span>
              <span className="score-label">INTELLIGENCE SCORE</span>
            </div>
            <div className="risk-factors">
              <h4>Contributing Factors:</h4>
              <ul>
                {risk.factors.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
                {risk.factors.length === 0 && <li>No adverse indicators detected.</li>}
              </ul>
            </div>
          </div>

          {data.biometric && (
            <div className={`glass-panel risk-card status-${data.biometric.status.toLowerCase().replace(' ', '-')}`} style={{marginTop: '16px'}}>
              <div className="risk-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                <h3 style={{display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '0.85rem'}}><Scan size={18} /> Biometric Integrity</h3>
                <span className="risk-badge" style={{
                   background: data.biometric.status === 'Verified' ? 'var(--accent-emerald)' : data.biometric.status === 'Identity Conflict' ? '#ef4444' : '#fbbf24',
                   color: '#000',
                   padding: '2px 8px',
                   borderRadius: '4px',
                   fontSize: '0.65rem',
                   fontWeight: 'bold'
                }}>{data.biometric.status.toUpperCase()}</span>
              </div>
              <div className="risk-score" style={{display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px'}}>
                <span className="score-val" style={{fontSize: '1.8rem', fontWeight: 'bold'}}>{data.biometric.score}%</span>
                <span className="score-label" style={{fontSize: '0.65rem', color: 'var(--text-muted)'}}>MATCH CONFIDENCE</span>
              </div>
              <p className="muted text-xs" style={{marginTop: '12px', lineHeight: '1.4', fontSize: '0.75rem'}}>
                {data.biometric.details}
              </p>
              {data.biometric.conflict && (
                <div className="conflict-alert" style={{marginTop: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px'}}>
                   <span style={{color: '#ef4444', fontWeight: '900', fontSize: '0.65rem', display: 'block', marginBottom: '6px', letterSpacing: '1px'}}>IDENTITY CONFLICT DETECTED</span>
                   <span style={{fontSize: '0.75rem', color: 'var(--text-main)'}}>Associated Archive Document: <strong className="mono" style={{color: '#ef4444'}}>{data.biometric.conflict}</strong></span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Content: Timeline & Details */}
        <div className="profile-main">
          {/* Stats Summary */}
          <div className="stats-row">
            <div className="glass-panel mini-stat">
              <span className="label">Total Crossings</span>
              <span className="val">{history.length}</span>
            </div>
            <div className="glass-panel mini-stat">
              <span className="label">Visa Applications</span>
              <span className="val">{applications.length}</span>
            </div>
            <div className="glass-panel mini-stat">
              <span className="label">Last Entry</span>
              <span className="val">{new Date(profile.created_at).toLocaleDateString()}</span>
            </div>
            <div className="glass-panel mini-stat accent-stat">
              <span className="label">Primary Port</span>
              <span className="val" style={{fontSize: '0.9rem'}}>{primaryPort}</span>
            </div>
          </div>

          {/* Unified Timeline */}
          <div className="glass-panel timeline-section">
            <h3><Activity size={18} /> Integrated History Timeline</h3>
            <div className="timeline-list">
              {[...history.map(h => ({...h, group: 'crossing'})), ...applications.map(a => ({...a, group: 'visa'}))]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((item, idx) => (
                  <div key={idx} className={`timeline-item ${item.group}`}>
                    <div className="item-icon">
                      {item.group === 'crossing' ? <Plane size={16} /> : <FileText size={16} />}
                    </div>
                    <div className="item-content">
                      <div className="item-header">
                        <span className="item-type">
                          {item.group === 'crossing' ? `Border Crossing (${item.type})` : `Visa Application`}
                        </span>
                        <span className="item-date">{new Date(item.created_at).toLocaleString()}</span>
                      </div>
                      <div className="item-details">
                        {item.group === 'crossing' ? (
                          <>Processed at Station: <span className="mono" style={{color: 'var(--accent-blue)'}}>{item.point_of_entry || 'Legacy Station'}</span> with status <strong>{item.status}</strong></>
                        ) : (
                          <>Application for <strong>{item.purpose}</strong> status <strong>{item.status}</strong> (Ref: {item.reference_number})</>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelerProfile;
