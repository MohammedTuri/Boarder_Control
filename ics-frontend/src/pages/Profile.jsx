import React, { useState } from 'react';
import { ShieldCheck, Lock, Loader2, User, Mail, CreditCard, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Settings.css'; // Reusing settings styles for consistency

const Profile = () => {
  const { user, authFetch } = useAuth();
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      setStatus({ type: 'error', message: 'New passcodes do not match.' });
      return;
    }
    
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const resp = await authFetch('http://localhost:5000/api/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current: passwords.current,
          newPass: passwords.newPass
        })
      });

      if (resp.ok) {
        setStatus({ type: 'success', message: 'Passcode securely updated.' });
        setPasswords({ current: '', newPass: '', confirm: '' });
      } else {
        const data = await resp.json();
        setStatus({ type: 'error', message: data.error || 'Update failed.' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'System communication failure.' });
    } finally {
      setLoading(false);
      if (status.type === 'success') {
        setTimeout(() => setStatus({ type: '', message: '' }), 5000);
      }
    }
  };

  return (
    <div className="settings-container">
      <h1 className="page-title">User Profile & Security</h1>
      
      <div className="settings-grid">
        {/* Profile Info Card */}
        <div className="glass-panel settings-card">
          <div className="card-header">
            <User size={20} className="header-icon" />
            <h2>Account Information</h2>
          </div>
          <div className="profile-info" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                <User size={32} className="muted" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{user?.name}</h3>
                <p className="muted text-sm">{user?.role} Clearance</p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '16px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CreditCard size={18} className="muted" />
                <div>
                  <span className="text-xs muted" style={{ display: 'block' }}>Agent Operations ID</span>
                  <code style={{ color: 'var(--accent-blue)' }}>{user?.agentId}</code>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={18} className="muted" />
                <div>
                  <span className="text-xs muted" style={{ display: 'block' }}>Session Validity</span>
                  <span className="text-sm">8 Hours Remaining</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Card */}
        <div className="glass-panel settings-card">
          <div className="card-header">
            <Lock size={20} className="header-icon" />
            <h2>Update Security Passcode</h2>
          </div>
          
          <form className="settings-form" onSubmit={handleSubmit}>
            <div className="input-block">
              <label>Current Passcode</label>
              <input required type="password" name="current" className="sys-input mono" placeholder="••••••••" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
            </div>
            <div className="input-block">
              <label>New Operational Passcode</label>
              <input required type="password" name="newPass" className="sys-input mono" placeholder="••••••••" value={passwords.newPass} onChange={e => setPasswords({...passwords, newPass: e.target.value})} />
            </div>
            <div className="input-block">
              <label>Confirm New Passcode</label>
              <input required type="password" name="confirm" className="sys-input mono" placeholder="••••••••" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
            </div>

            {status.message && (
              <p className={`alert-text ${status.type === 'error' ? 'danger' : 'text-emerald'}`}>
                {status.type === 'success' && <ShieldCheck size={16} style={{marginRight: '8px'}} />}
                {status.message}
              </p>
            )}

            <button type="submit" className="sys-btn primary" disabled={loading}>
              {loading ? <Loader2 className="spinner" size={18} /> : 'Update Passcode'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
