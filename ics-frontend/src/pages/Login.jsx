import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Fingerprint, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const Login = () => {
  const [credentials, setCredentials] = useState({ agentId: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('ICS DEBUG: Login attempt started for ', credentials.agentId);
    console.log('ICS DEBUG: Target URL is ', API_BASE_URL);
    
    setLoading(true);
    setError('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn('ICS DEBUG: Request timed out after 15s');
      controller.abort();
    }, 15000);

    try {
      console.log('ICS DEBUG: Dispatching fetch...');
      const resp = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('ICS DEBUG: Response received with status ', resp.status);

      if (resp.ok) {
        const data = await resp.json();
        login(data.user, data.token);
        navigate('/admin');
      } else {
        const errData = await resp.json();
        setError(errData.error || 'Authentication failed. Check credentials.');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError(`CONNECTION TIMEOUT: The Command Center at ${API_BASE_URL} is not responding.`);
      } else {
        console.error('ICS DEBUG: Fetch error ', err);
        setError(`NETWORK FAILURE: Unable to reach ${API_BASE_URL}.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel">
        <div className="scanning-line"></div>
        
        {/* Visual Deployment Confirmation */}
        <div style={{
          background: 'var(--ics-blue)', 
          color: 'white', 
          fontSize: '0.65rem', 
          textAlign: 'center', 
          padding: '4px', 
          borderRadius: '4px',
          fontWeight: 'bold',
          letterSpacing: '1px',
          marginBottom: '-16px'
        }}>
          SYSTEM ARMED: PRODUCTION GATEWAY v1.0.5
        </div>

        <div className="login-header">
          <Shield className="brand-icon pulse-glow" size={48} />
          <h1>ICS COMMAND</h1>
          <p className="muted" style={{fontSize: '0.75rem', letterSpacing: '2px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--accent-blue)'}}>Secure Sovereign Operations</p>
        </div>
        
        {error && (
          <div style={{
            marginBottom: '24px', 
            padding: '12px', 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            borderRadius: '8px', 
            color: '#ef4444', 
            fontSize: '0.8rem',
            lineHeight: '1.4'
          }}>
            <div style={{display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px'}}>
              <AlertTriangle size={16} />
              <strong style={{fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Mission Alert</strong>
            </div>
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-block">
            <label>Agent Operations ID</label>
            <input 
              required
              disabled={loading}
              type="text" 
              className="sys-input mono text-lg uppercase" 
              placeholder="AGT-***"
              value={credentials.agentId}
              onChange={(e) => setCredentials({...credentials, agentId: e.target.value})}
            />
          </div>
          <div className="input-block">
            <label>Passcode</label>
            <input 
              required
              disabled={loading}
              type="password" 
              className="sys-input mono text-lg" 
              placeholder="••••••••"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            />
          </div>
          <button type="submit" className="sys-btn primary auth-btn" disabled={loading}>
            {loading ? <Shield size={20} className="spinner" /> : <Fingerprint size={20} />}
            {loading ? 'Authenticating...' : 'Authenticate'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default Login;
