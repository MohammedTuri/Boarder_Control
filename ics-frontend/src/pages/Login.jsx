import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Fingerprint } from 'lucide-react';
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
    setLoading(true);
    setError('');

    try {
      const resp = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (resp.ok) {
        const data = await resp.json();
        login(data.user, data.token);
        navigate('/admin');
      } else {
        const errData = await resp.json();
        setError(errData.error || 'Authentication failed');
      }
    } catch (err) {
      console.error(err);
      setError('Connection refused. Is the Command Center API running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel">
        <div className="scanning-line"></div>
        <div className="login-header">
          <Shield className="brand-icon pulse-glow" size={48} />
          <h1>ICS COMMAND</h1>
          <p className="muted" style={{fontSize: '0.75rem', letterSpacing: '2px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--accent-blue)'}}>Secure Sovereign Operations</p>
        </div>
        
        <div style={{marginBottom: '24px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', textAlign: 'center'}}>
          <p style={{fontSize: '0.65rem', color: '#ef4444', fontWeight: 'bold', margin: 0, letterSpacing: '0.5px'}}>
            AUTHORIZED PERSONNEL ONLY: All activity is monitored under the National Cybersecurity Proclamation.
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-block">
            <label>Agent Operations ID</label>
            <input 
              required
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
              type="password" 
              className="sys-input mono text-lg" 
              placeholder="••••••••"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            />
          </div>
          <button type="submit" className="sys-btn primary auth-btn">
            <Fingerprint size={20} />
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
};
export default Login;
