import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertOctagon, Scan, X, Settings, HardDrive, Cpu, Wifi, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import './Processing.css';

const Processing = () => {
  const { authFetch } = useAuth();
  const [formData, setFormData] = useState({
    passport: '',
    fullName: '',
    nationality: '',
    dob: '',
    expiry: '',
    type: 'Entry',
    pointOfEntry: 'Addis Ababa (Bole)'
  });
  const [photo, setPhoto] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, processing, success, flagged
  const [riskData, setRiskData] = useState(null);
  const [biometricData, setBiometricData] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [hardware, setHardware] = useState({ doc_reader: 'Online', bio_camera: 'Online', sys_link: 'Priority-1' });
  const [logisticsFeed, setLogisticsFeed] = useState([
    { id: 1, type: 'SYS', msg: 'Operational environment initialized.', time: '08:00' },
    { id: 2, type: 'NET', msg: 'National archive heartbeat: 42ms', time: '08:05' }
  ]);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const simulateBiometricScan = () => {
    setScanning(true);
    setBiometricData(null);
    setTimeout(() => {
      setScanning(false);
      const passport = formData.passport.toUpperCase();
      let score = 98.2;
      let status = 'Verified';
      let details = 'Strong match against National Passport Archive.';

      if (passport.startsWith('ETH-')) {
        score = 100;
        status = 'Identity Conflict';
        details = 'CRITICAL: Multiple document association detected in national archive for this biometric profile.';
      } else if (passport.startsWith('EPX')) {
        score = 42.1;
        status = 'Anomaly Detected';
        details = 'Identity conflict found in historical records.';
      } else if (passport.includes('123')) {
        score = 88.4;
        status = 'Low Confidence';
        details = 'Partial biometric match detected.';
      }
      setBiometricData({ score, status, details });
    }, 2500);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setPhoto(e.dataTransfer.files[0]);
      simulateBiometricScan();
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
      simulateBiometricScan();
    }
  };

  const fetchRiskLevel = async (passport) => {
    if (passport.length < 5) return;
    try {
      const resp = await authFetch(`http://localhost:5000/api/risk-profile/${passport}`);
      if (resp.ok) {
        const data = await resp.json();
        setRiskData(data.risk);
      }
    } catch (err) { /* silent */ }
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.passport) fetchRiskLevel(formData.passport);
    }, 800);
    return () => clearTimeout(timer);
  }, [formData.passport]);

  // Handle Hardware Heartbeat
  React.useEffect(() => {
    const fetchHardware = async () => {
      try {
        const resp = await authFetch('http://localhost:5000/api/hardware/status');
        if (resp.ok) setHardware(await resp.json());
      } catch (err) { /* silent fail for demo */ }
    };
    fetchHardware();
    const interval = setInterval(fetchHardware, 10000);
    return () => clearInterval(interval);
  }, [authFetch]);

  const addLog = (type, msg) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogisticsFeed(prev => [{ id: Date.now(), type, msg, time }, ...prev].slice(0, 10));
  };

  const handleQuickScan = async () => {
    addLog('MRZ', 'Machine Readable Zone detection initiated...');
    try {
      const resp = await authFetch('http://localhost:5000/api/hardware/mrz-scan');
      if (resp.ok) {
        const data = await resp.json();
        addLog('DOC', `Document Read Success: ${data.passport}`);
        // Simulate typing effect
        let i = 0;
        const keys = Object.keys(data);
        const interval = setInterval(() => {
          if (i < keys.length) {
            setFormData(prev => ({ ...prev, [keys[i]]: data[keys[i]] }));
            i++;
          } else {
            clearInterval(interval);
          }
        }, 100);
      }
    } catch (err) {
      addLog('ERR', 'Scanner communication failure.');
    }
  };

  const handleCalibrate = async () => {
    addLog('SYS', 'Initiating full sensor recalibration...');
    try {
      const resp = await authFetch('http://localhost:5000/api/hardware/calibrate', { method: 'POST' });
      if (resp.ok) addLog('SYS', 'Recalibration successful. Sensors at 100% capacity.');
    } catch (err) { /* silent */ }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Data Validation
    if (!photo) {
      setError('PHOTO ERROR: Traveler biometric document (photo) is mandatory.');
      setStatus('idle');
      return;
    }

    if (!/^[a-zA-Z\s,.-]+$/.test(formData.fullName)) {
      setError('NAME ERROR: Full Name must only contain alphabetic characters.');
      setStatus('idle');
      return;
    }

    if (!/^[a-zA-Z]+$/.test(formData.nationality)) {
      setError('NATIONALITY ERROR: Nationality must only contain alphabetic characters (ISO code).');
      setStatus('idle');
      return;
    }

    if (formData.passport.length < 6) {
      setError('DOCUMENT ERROR: Passport number must be at least 6 characters long.');
      setStatus('idle');
      return;
    }

    // Strict Date Validation
    const birthDate = new Date(formData.dob);
    const expiryDate = new Date(formData.expiry);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(birthDate.getTime()) || isNaN(expiryDate.getTime())) {
      setError('FORMAT ERROR: Please enter valid calendar dates.');
      setStatus('idle');
      return;
    }

    const birthYear = birthDate.getFullYear();
    const expiryYear = expiryDate.getFullYear();

    if (birthYear < 1900 || birthYear > 2100 || expiryYear < 1900 || expiryYear > 2100) {
      setError('RANGE ERROR: Operational dates must be between 1900 and 2100.');
      setStatus('idle');
      return;
    }

    if (birthDate >= expiryDate) {
      setError('CHRONOLOGICAL ERROR: Date of Birth must be before Passport Expiry.');
      setStatus('idle');
      return;
    }

    if (expiryDate < today) {
      setError('VALIDITY ERROR: Passport has already expired.');
      setStatus('idle');
      return;
    }

    setStatus('processing');
    setError('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (photo) data.append('photo', photo);

      const resp = await authFetch('http://localhost:5000/api/crossings', {
        method: 'POST',
        body: data
      });

      if (resp.ok) {
        const result = await resp.json();
        if (result.biometric) setBiometricData(result.biometric);
        
        if (result.status === 'Flagged') {
          setStatus('flagged');
        } else {
          setStatus('success');
        }
      } else {
        const errData = await resp.json();
        if (resp.status === 409) {
          setStatus('conflict');
          setError(errData.error);
          setRiskData({ level: 'Critical', score: 100, factors: [`ID Conflict found with Passport: ${errData.conflict}`] });
        } else {
          setError(errData.error || 'Server error');
          setStatus('idle');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Communication failure');
      setStatus('idle');
    }
  };

  const resetForm = () => {
    setFormData({ passport: '', fullName: '', nationality: '', dob: '', expiry: '', type: 'Entry', pointOfEntry: 'Addis Ababa (Bole)' });
    setPhoto(null);
    setStatus('idle');
  };

  return (
    <div className="processing-container">
      <div className="processing-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h1 className="page-title">Traveler Processing</h1>
          <p className="muted" style={{fontSize: '0.8rem', marginTop: '4px'}}>Real-time interdiction and biometric adjudication gateway.</p>
        </div>
        <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
          <div className={`sec-level-indicator ${riskData?.score > 75 ? 'delta' : riskData?.score > 40 ? 'charlie' : 'bravo'}`} style={{
            padding: '8px 16px',
            borderRadius: '8px',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center'
          }}>
            <span style={{display: 'block', fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 'bold'}}>GATE SEC-LEVEL</span>
            <div style={{fontSize: '1rem', fontWeight: '900', color: riskData?.score > 75 ? '#ef4444' : riskData?.score > 40 ? '#f59e0b' : '#3b82f6'}}>
              {riskData?.score > 75 ? 'DELTA' : riskData?.score > 40 ? 'CHARLIE' : 'BRAVO'}
            </div>
          </div>
          <div className={`status-badge ${status}`}>
            {status === 'idle' && 'READY FOR INPUT'}
            {status === 'processing' && 'ANALYZING...'}
            {status === 'success' && 'CLEARED FOR ENTRY'}
            {status === 'flagged' && 'WATCHLIST MATCH DETECTED'}
            {status === 'conflict' && 'IDENTITY FRAUD DETECTED'}
          </div>
        </div>
      </div>

      <div className="hardware-diagnostics glass-panel" style={{
        display: 'flex', gap: '32px', padding: '12px 24px', marginBottom: '24px', 
        fontSize: '0.75rem', fontWeight: 'bold', background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--glass-border-light)',
        alignItems: 'center'
      }}>
        <div className="diag-item" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <HardDrive size={14} className={hardware.doc_reader === 'Online' ? 'accent-emerald' : 'accent-danger'} />
          DOC READER: <span className={hardware.doc_reader === 'Online' ? 'accent-emerald' : 'accent-danger'}>{hardware.doc_reader.toUpperCase()}</span>
          <span className="muted" style={{fontSize: '0.6rem', marginLeft: '4px'}}>0.8s Scan</span>
        </div>
        <div className="diag-item" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <Cpu size={14} className="accent-blue" />
          FORENSIC ENGINE: <span className="accent-blue">ACTIVE</span>
          <span className="muted" style={{fontSize: '0.6rem', marginLeft: '4px'}}>Node-12</span>
        </div>
        <div className="diag-item" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <Wifi size={14} className="accent-emerald" />
          LINK: <span className="accent-emerald">ENCRYPTED {hardware.sys_link}</span>
          <span className="muted" style={{fontSize: '0.6rem', marginLeft: '4px'}}>14ms</span>
        </div>
        <div className="diag-item" style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px'}}>
          <button onClick={handleCalibrate} className="text-btn" style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}><Settings size={12}/> CALIBRATE</button>
          <button onClick={handleQuickScan} className="sys-btn primary sm" style={{padding: '4px 12px', fontSize: '0.7rem'}}><Scan size={12}/> QUICK SCAN</button>
        </div>
      </div>

      <div className="processing-content">
        <div className="form-section glass-panel">
          <h2><Scan size={20} className="inline-icon" /> Document Data</h2>
          <form onSubmit={handleSubmit} className="mrz-form">
            <div className="form-group row-2">
              <div className="input-block">
                <label>Passport Number</label>
                <input required type="text" name="passport" value={formData.passport} onChange={handleInputChange} className="sys-input mono text-lg uppercase" placeholder="e.g. EP8899001" />
              </div>
              <div className="input-block">
                <label>Nationality</label>
                <input required type="text" name="nationality" value={formData.nationality} onChange={handleInputChange} className="sys-input uppercase" maxLength="3" placeholder="ETH" />
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-block">
                <label>Full Name</label>
                <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="sys-input uppercase" placeholder="SURNAME, GIVEN NAMES" />
              </div>
            </div>

            <div className="form-group row-2">
              <div className="input-block">
                <label>Date of Birth</label>
                <input required type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="sys-input" />
              </div>
              <div className="input-block">
                <label>Passport Expiry</label>
                <input required type="date" name="expiry" value={formData.expiry} onChange={handleInputChange} className="sys-input" />
              </div>
            </div>

            <div className="form-group row-2">
              <div className="input-block">
                <label>Traveler Type</label>
                <select name="type" value={formData.type} onChange={handleInputChange} className="sys-input">
                  <option value="Entry">Entry (Arrival)</option>
                  <option value="Exit">Exit (Departure)</option>
                </select>
              </div>
              <div className="input-block">
                <label>Point of Entry / Station</label>
                <select name="pointOfEntry" value={formData.pointOfEntry} onChange={handleInputChange} className="sys-input">
                  <option value="Addis Ababa (Bole)">Addis Ababa (Bole International)</option>
                  <option value="Dire Dawa (Aba Tenna)">Dire Dawa (Aba Tenna Dejazmach Yilma)</option>
                  <option value="Moyale">Moyale (Kenyan Border)</option>
                  <option value="Galafi">Galafi (Djiboutian Border)</option>
                  <option value="Togochale">Togochale (Somali Border)</option>
                  <option value="Metema">Metema (Sudanese Border)</option>
                  <option value="Humera">Humera (Eritrean Border)</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="error-message alert-text danger" style={{ marginBottom: '16px', color: '#ef4444', fontWeight: 'bold' }}>
                <AlertOctagon size={16} style={{marginRight: '8px'}} />
                {error}
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="sys-btn primary" disabled={status === 'processing' || status === 'conflict' || hardware.doc_reader !== 'Online'}>
                {status === 'processing' ? 'Processing...' : hardware.doc_reader !== 'Online' ? 'HARDWARE OFFLINE' : 'Process Traveler'}
              </button>
              <button type="button" onClick={resetForm} className="sys-btn secondary">
                Reset
              </button>
            </div>
          </form>
        </div>

        <div className="sidebar-section">
          <div className="glass-panel photo-dropzone" 
               onDragOver={(e) => e.preventDefault()} 
               onDrop={handleDrop}
               onClick={() => fileInputRef.current.click()}>
            <input type="file" hidden ref={fileInputRef} onChange={handleFileSelect} accept="image/*" />
            
            {photo ? (
              <div className="preview-container">
                <img src={URL.createObjectURL(photo)} alt="Traveler" className="photo-preview" />
                <button type="button" className="remove-photo" onClick={(e) => { e.stopPropagation(); setPhoto(null); }}><X size={16}/></button>
              </div>
            ) : (
              <div className="dropzone-content">
                <UploadCloud size={48} className="drop-icon" />
                <p>Drag & Drop Traveler Photo</p>
                <span className="muted">or click to browse</span>
              </div>
            )}

            {scanning && (
              <div className="scanning-overlay">
                <div className="scan-line"></div>
                <div className="scan-text">BIOMETRIC ANALYSIS IN PROGRESS...</div>
              </div>
            )}
          </div>

          {/* Biometric Results Panel */}
          {biometricData && (
            <div className={`biometric-panel status-${biometricData.status.toLowerCase().replace(' ', '-')}`} style={{
              marginTop: '16px',
              padding: '20px',
              borderRadius: '12px',
              background: 'var(--bg-dark)',
              border: '1px solid var(--glass-border)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div className="biometric-header" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
                <span style={{fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)'}}>BIOMETRIC IDENTITY</span>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: biometricData.status === 'Verified' ? 'var(--accent-emerald)' : (biometricData.status === 'Anomaly Detected' || biometricData.status === 'Identity Conflict') ? '#ef4444' : '#fbbf24',
                  color: '#000'
                }}>{biometricData.status}</span>
              </div>
              <div className="biometric-score" style={{fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '8px'}}>
                {biometricData.score}% <span style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>MATCH CONFIDENCE</span>
              </div>
              <p style={{fontSize: '0.8rem', margin: 0, color: 'var(--text-muted)'}}>{biometricData.details}</p>
              <div className="scanning-grid-bg"></div>
            </div>
          )}

          {status === 'success' && (
            <div className="alert-panel success-panel">
              <CheckCircle size={32} />
              <h3>CLEARED</h3>
              <p>No derogatory records found. Proceed with standard entry.</p>
            </div>
          )}

          {status === 'flagged' && (
            <div className="alert-panel danger-panel pulse-alert">
              <AlertOctagon size={32} />
              <h3>INTERCEPT REQUIRED</h3>
              <p>Subject matches interpol database. Detain immediately and notify supervisor.</p>
            </div>
          )}

          {status === 'conflict' && (
            <div className="alert-panel danger-panel hard-block">
              <Shield size={32} />
              <h3>COMMAND BLOCK: ID FRAUD</h3>
              <p>Biometric signature mismatch detected. This physical person is associated with a different document in our central archives. <strong>SYSTEM LOCKED.</strong></p>
              <button className="sys-btn secondary" style={{marginTop: '12px', width: '100%', borderColor: '#ef4444', color: '#ef4444'}} onClick={() => window.location.reload()}>Request Supervisor Override</button>
            </div>
          )}

          {riskData && (
            <div className={`risk-indicator-box level-${riskData.level.toLowerCase()}`} style={{
              marginTop: '16px',
              padding: '20px',
              borderRadius: '12px',
              border: `1px solid ${riskData.level === 'Critical' ? 'rgba(239,68,68,0.3)' : 'var(--glass-border)'}`,
              background: 'rgba(0,0,0,0.2)',
              position: 'relative'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                <span style={{fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '900', letterSpacing: '1px'}}>FORENSIC RISK ASSESSMENT</span>
                <span className={`risk-tag ${riskData.level.toLowerCase()}`} style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  background: riskData.level === 'Critical' ? '#ef4444' : riskData.level === 'Elevated' ? '#fbbf24' : '#10b981',
                  color: '#000'
                }}>{riskData.level.toUpperCase()}</span>
              </div>
              <div style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'baseline', gap: '8px'}}>
                {riskData.score} <span style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>INTELLIGENCE RATING</span>
              </div>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                {riskData.factors.map((factor, idx) => (
                  <div key={idx} style={{
                    fontSize: '0.75rem', 
                    color: 'var(--text-muted)', 
                    display: 'flex', 
                    gap: '10px',
                    padding: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '6px',
                    borderLeft: `2px solid ${riskData.level === 'Critical' ? '#ef4444' : '#fbbf24'}`
                  }}>
                    <Shield size={14} className={riskData.level === 'Critical' ? 'accent-danger' : 'accent-gold'} />
                    {factor}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logistics Feed */}
          <div className="glass-panel logistics-feed" style={{marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.2)'}}>
            <h4 style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px', letterSpacing: '1px'}}>LOGISTICS & TELEMETRY</h4>
            <div className="feed-container" style={{height: '200px', overflowY: 'hidden', display: 'flex', flexDirection: 'column', gap: '10px'}}>
              {logisticsFeed.map(log => (
                <div key={log.id} style={{fontSize: '0.7rem', display: 'flex', gap: '8px', borderLeft: `2px solid ${log.type === 'ERR' ? '#ef4444' : 'var(--accent-blue)'}`, paddingLeft: '8px'}}>
                  <span className="mono" style={{color: 'var(--text-muted)'}}>[{log.time}]</span>
                  <span className="mono accent-blue" style={{fontWeight: 'bold'}}>{log.type}:</span>
                  <span className="muted">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Processing;
