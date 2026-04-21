import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Clock, AlertTriangle, CheckCircle, FileText, Loader2, User, Globe, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import './Dashboard.css';

const TravelerSearch = () => {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setIsSearching(true);
    setError('');
    
    try {
      const resp = await authFetch(`/api/search?query=${query}`);
      if (resp.ok) {
        const data = await resp.json();
        setResults(data);
        if (!data.profile && data.applications.length === 0) {
          setError('No records found for the provided query.');
        }
      } else {
        setError('Database query failed. Please contact headquarters.');
      }
    } catch (err) {
      console.error(err);
      setError('Communication failure with central database.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <div>
          <h1 className="page-title">National Traveler Query</h1>
          <p className="muted" style={{fontSize: '0.8rem', marginTop: '4px'}}>Accessing federated border archives and forensic profiles.</p>
        </div>
        <div className="badge text-xs" style={{padding: '8px 16px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)'}}>
          QUERY SEC-LEVEL: BRAVO
        </div>
      </div>
      
      <div className="glass-panel" style={{padding: '24px', marginBottom: '32px'}}>
        <form onSubmit={handleSearch} style={{display: 'flex', gap: '16px', alignItems: 'flex-end'}}>
          <div style={{flex: 1}}>
            <label style={{display: 'block', marginBottom: '8px', color: 'var(--text-muted)'}}>Passport Number, Name, or Application ID</label>
            <div style={{display: 'flex', alignItems: 'center', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', padding: '12px 16px', borderRadius: '8px'}}>
              <Search size={20} color="var(--accent-blue)" style={{marginRight: '12px'}} />
              <input 
                required
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value.toUpperCase())}
                placeholder="Enter query exactly as it appears on document..."
                style={{background: 'transparent', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none', fontSize: '1rem', fontFamily: 'monospace'}}
              />
            </div>
          </div>
          <button type="submit" className="sys-btn primary" style={{padding: '14px 32px', fontSize: '1rem'}} disabled={isSearching}>
            {isSearching ? <Loader2 className="spinner" size={20} /> : 'Run Query'}
          </button>
        </form>
        {error && <div style={{marginTop: '16px', color: '#ef4444', fontSize: '0.9rem'}}>{error}</div>}
      </div>

      {results && results.profile && (
        <div className="search-grid" style={{display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px'}}>
          {/* Profile Card */}
          <div className="glass-panel" style={{padding: '32px', textAlign: 'center'}}>
            <div style={{width: '120px', height: '120px', borderRadius: '12px', background: 'var(--glass-accent)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid var(--glass-border-light)'}}>
              {results.profile.photo_url ? (
                <img src={`${API_BASE_URL}${results.profile.photo_url}`} alt="Traveler" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
              ) : (
                <User size={64} className="muted" />
              )}
            </div>
            <h2 style={{margin: '0 0 8px 0'}}>{results.profile.full_name}</h2>
            <p style={{fontFamily: 'monospace', color: 'var(--accent-blue)', margin: '0 0 16px 0', fontSize: '1.2rem'}}>{results.profile.passport}</p>
            
            {results.watchlist.length > 0 ? (
              <div className="alert-panel danger-panel" style={{marginBottom: '32px', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #ef4444', background: 'rgba(239, 68, 68, 0.1)'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: '900', fontSize: '0.75rem', letterSpacing: '1px'}}>
                  <AlertTriangle size={18} /> WATCHLIST INTERDICTION REQUIRED
                </div>
              </div>
            ) : (
              <div style={{display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', marginBottom: '32px', fontSize: '0.85rem', border: '1px solid rgba(16, 185, 129, 0.2)'}}>
                <CheckCircle size={18} />
                BIOMETRIC IDENTITY CLEARED
              </div>
            )}

            <div style={{textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--glass-border)', paddingTop: '24px'}}>
              <div>
                <span style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>Nationality</span>
                <p style={{margin: '4px 0 0 0', fontWeight: '500'}} className="uppercase">{results.profile.nationality}</p>
              </div>
              <div>
                <span style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>Entry Date</span>
                <p style={{margin: '4px 0 0 0', fontWeight: '500'}}>{new Date(results.profile.dob).toLocaleDateString()}</p>
              </div>
              <div>
                <span style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>Exit Date</span>
                <p style={{margin: '4px 0 0 0', fontWeight: '500'}}>{new Date(results.profile.expiry).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* History & Applications */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
            <div className="glass-panel" style={{padding: '24px'}}>
              <h3 style={{display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 24px 0'}}>
                <FileText size={20} color="var(--accent-blue)" />
                Linked Applications
              </h3>
              <div style={{display: 'grid', gap: '12px'}}>
                {results.applications.length > 0 ? results.applications.map(app => (
                  <div key={app.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-dark)', borderRadius: '8px', border: '1px solid var(--glass-border-light)'}}>
                    <div>
                      <span style={{fontFamily: 'monospace', color: 'var(--text-main)'}}>{app.reference_number}</span>
                      <span style={{color: 'var(--text-muted)', marginLeft: '12px'}}>{app.purpose}</span>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                      <span style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>{new Date(app.created_at).toLocaleDateString()}</span>
                      <span className={`status-pill ${app.status.toLowerCase()}`}>{app.status}</span>
                    </div>
                  </div>
                )) : <p className="muted text-sm">No applications found in secure archives.</p>}
              </div>
            </div>

            <div className="glass-panel" style={{padding: '24px', flex: 1}}>
              <h3 style={{display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 24px 0'}}>
                <Clock size={20} color="var(--accent-emerald)" />
                Border Processing History
              </h3>
              <div style={{display: 'grid', gap: '16px'}}>
                {results.history.length > 0 ? results.history.map(record => (
                  <div key={record.id} style={{display: 'flex', gap: '20px', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--glass-border)'}}>
                    <div className={`type-tag ${record.type.toLowerCase()}`} style={{width: '60px', textAlign: 'center'}}>
                      {record.type}
                    </div>
                    <div style={{flex: 1}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px'}}>
                        <Globe size={16} color="var(--text-muted)" />
                        <span style={{fontWeight: '500'}} className="uppercase">{record.nationality}</span>
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem'}}>
                        <Calendar size={14} />
                        <span>{new Date(record.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div style={{color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.9rem'}}>
                      Status: <span className={record.status === 'Cleared' ? 'text-emerald' : 'text-danger'}>{record.status}</span>
                    </div>
                  </div>
                )) : <p className="muted text-sm">No recorded crossings found.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelerSearch;
