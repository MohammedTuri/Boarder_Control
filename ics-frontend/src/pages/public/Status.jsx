import React, { useState } from 'react';
import './PublicPages.css';
import { Search, Loader2, CheckCircle2, Clock, XCircle, FileText, Shield, Zap, SearchCode } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const Status = () => {
  const [query, setQuery] = useState({ refNum: '', passport: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const resp = await fetch(`${API_BASE_URL}/api/applications/status/${query.refNum}?passport=${query.passport}`);
      if (resp.ok) {
        const data = await resp.json();
        setResult(data);
      } else {
        const errData = await resp.json();
        setError(errData.error || 'UNABLE TO LOCATE RECORD: Please verify the reference identifier and document number.');
      }
    } catch (err) {
      console.error(err);
      setError('COMMUNICATION FAILURE: The national archive is currently unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <CheckCircle2 size={32} color="#10b981" />;
      case 'Pending': return <Clock size={32} color="#f59e0b" />;
      case 'Rejected': return <XCircle size={32} color="#ef4444" />;
      default: return <FileText size={32} color="#94a3b8" />;
    }
  };

  const timelineSteps = [
    { id: 'submitted', label: 'Data Submission', icon: <FileText size={18}/>, desc: 'Record encrypted and indexed.' },
    { id: 'forensic', label: 'Forensic Analysis', icon: <SearchCode size={18}/>, desc: 'Neural biometric & watchlist scan.' },
    { id: 'adjudication', label: 'Officer Review', icon: <Shield size={18}/>, desc: 'Human-in-the-loop expert audit.' },
    { id: 'final', label: 'Final Clearance', icon: <Zap size={18}/>, desc: 'Official border transit decision.' }
  ];

  const getActiveStep = (status) => {
    if (status === 'Approved' || status === 'Rejected') return 4;
    if (status === 'Under Review') return 3;
    if (status === 'Pending') return 2;
    return 1;
  };

  return (
    <div className="pub-page animate-fade-in">
      <div className="page-header">
        <h1>Official Application Tracker</h1>
        <p>Providing real-time forensic transparency for all Ethiopian transit requests.</p>
      </div>

      <div className="public-form-container">
        {!result ? (
          <div className="lookup-area" style={{maxWidth: '600px', margin: '0 auto'}}>
            <div style={{textAlign: 'center', marginBottom: '40px'}}>
               <Shield size={48} color="var(--pub-primary)" style={{marginBottom: '16px', opacity: 0.8}} />
               <h3 style={{fontSize: '1.5rem'}}>Credential Verification</h3>
               <p style={{color: 'var(--pub-text-muted)', fontSize: '0.95rem'}}>Enter your reference ID and passport to query the National ICS Gate keeper.</p>
            </div>
            
            <form onSubmit={handleLookup}>
              <div className="form-group">
                <label>REFERENCE IDENTIFIER</label>
                <input 
                  required 
                  type="text" 
                  className="form-control mono" 
                  placeholder="e.g. APP-882200X" 
                  value={query.refNum}
                  onChange={(e) => setQuery({...query, refNum: e.target.value.toUpperCase()})}
                />
              </div>
              <div className="form-group">
                <label>PASSPORT NUMBER</label>
                <input 
                  required 
                  type="text" 
                  className="form-control mono" 
                  placeholder="Enter Document ID"
                  value={query.passport}
                  onChange={(e) => setQuery({...query, passport: e.target.value.toUpperCase()})}
                />
              </div>
              
              {error && (
                <div style={{padding: '16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '24px', fontSize: '0.85rem', textAlign: 'center', border: '1px solid #ef4444'}}>
                  <strong>SYSTEM ALERT:</strong> {error}
                </div>
              )}

              <button type="submit" className="public-btn primary" style={{width: '100%', gap: '12px'}} disabled={loading}>
                {loading ? <Loader2 className="spinner" size={20} /> : <Zap size={20} />}
                {loading ? 'SYNCING WITH ARCHIVE...' : 'QUERY FORENSIC STATUS'}
              </button>
            </form>
          </div>
        ) : (
          <div className="status-result-area animate-fade-in">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px', borderBottom: '1px solid var(--pub-border)', paddingBottom: '32px'}}>
              <div>
                <span className="muted" style={{fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px'}}>Current Clearance State</span>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px'}}>
                  {getStatusIcon(result.status)}
                  <h2 style={{fontSize: '2.25rem', margin: 0, color: result.status === 'Approved' ? '#10b981' : result.status === 'Pending' ? '#f59e0b' : '#ef4444'}}>
                    {result.status.toUpperCase()}
                  </h2>
                </div>
              </div>
              <div style={{textAlign: 'right'}}>
                <span className="muted" style={{fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase'}}>ID: {result.reference_number}</span>
                <p style={{fontSize: '1rem', fontWeight: '700', margin: '4px 0'}}>{result.first_name} {result.last_name}</p>
                <p className="muted" style={{fontSize: '0.85rem'}}>Origin: {result.nationality}</p>
              </div>
            </div>

            {/* Visual Timeline */}
            <div className="status-timeline" style={{padding: '20px 0 60px'}}>
               <div style={{display: 'flex', justifyContent: 'space-between', position: 'relative'}}>
                  <div style={{position: 'absolute', top: '16px', left: '20px', right: '20px', height: '2px', background: '#e2e8f0', zIndex: 0}}></div>
                  <div style={{
                    position: 'absolute', top: '16px', left: '20px', 
                    width: `${((getActiveStep(result.status)-1)/3)*100}%`, 
                    height: '2px', background: result.status === 'Rejected' ? '#ef4444' : 'var(--pub-primary)', 
                    zIndex: 0, transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}></div>

                  {timelineSteps.map((step, i) => {
                    const stepNum = i + 1;
                    const isActive = getActiveStep(result.status) >= stepNum;
                    const isDecision = stepNum === 4;
                    
                    return (
                      <div key={step.id} style={{zIndex: 1, textAlign: 'center', width: '130px'}}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%', 
                          background: isActive ? (result.status === 'Rejected' && isDecision ? '#ef4444' : 'var(--pub-primary)') : 'white',
                          border: `2px solid ${isActive ? (result.status === 'Rejected' && isDecision ? '#ef4444' : 'var(--pub-primary)') : '#cbd5e1'}`,
                          color: isActive ? 'white' : '#94a3b8',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', transition: 'all 0.6s'
                        }}>
                          {step.icon}
                        </div>
                        <h4 style={{fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px', color: isActive ? 'var(--pub-secondary)' : '#94a3b8'}}>{step.label}</h4>
                        <p style={{fontSize: '0.7rem', color: '#94a3b8', margin: 0, lineHeight: '1.2'}}>{step.desc}</p>
                      </div>
                    );
                  })}
               </div>
            </div>

            <div style={{background: 'var(--pub-bg-soft)', padding: '24px', borderRadius: '16px', border: '1px solid var(--pub-border)', marginTop: '40px'}}>
               <div style={{display: 'flex', gap: '20px'}}>
                  <div style={{flex: 1}}>
                    <h5 style={{margin: '0 0 8px 0', fontSize: '0.9rem'}}>Official Guidance</h5>
                    <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--pub-text-muted)'}}>
                      {result.status === 'Approved' ? 'Your authorization is active. You must present the digital pre-approval document at the point of entry for final biometric verification.' : 
                       result.status === 'Pending' ? 'Your request is currently undergoing forensic analysis. Please allow up to 48 hours for final adjudication.' :
                       'Entry denied based on document review. Please contact the nearest Ethiopian Consulate for further details.'}
                    </p>
                  </div>
                  {result.status === 'Approved' && (
                    <div style={{borderLeft: '1px solid var(--pub-border)', paddingLeft: '20px', display: 'flex', alignItems: 'center'}}>
                      <a 
                        href={`${API_BASE_URL}/api/visa/pre-approval/${result.reference_number}`} 
                        className="public-btn primary"
                        target="_blank" rel="noreferrer"
                        style={{gap: '10px'}}
                      >
                        <FileText size={18} /> GENERATE CERTIFICATE
                      </a>
                    </div>
                  )}
               </div>
            </div>

            <div style={{marginTop: '32px', textAlign: 'center'}}>
              <button 
                onClick={() => setResult(null)} 
                className="public-btn outline"
                style={{fontSize: '0.85rem'}}
              >
                Query Another Identity
              </button>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Status;
