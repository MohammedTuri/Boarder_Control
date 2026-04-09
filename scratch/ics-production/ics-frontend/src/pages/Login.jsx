import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Shield } from 'lucide-react';

export default function Login() {
    const { login } = useContext(AuthContext);
    const [id, setId] = useState('AGENT_01');
    const [passcode, setPasscode] = useState('demo123');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(id, passcode);
        if (!res.success) {
            setError(res.error);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <div className="login-header">
                    <Shield className="bg-gold-text" size={48} style={{ margin: '0 auto' }} />
                    <h2>ICS Portal</h2>
                    <p>Restricted Government Access</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label>Agent ID</label>
                        <input 
                            type="text" 
                            value={id} 
                            onChange={(e) => setId(e.target.value)} 
                            placeholder="e.g. AGENT_01" 
                            required 
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '30px' }}>
                        <label>Passcode</label>
                        <input 
                            type="password" 
                            value={passcode} 
                            onChange={(e) => setPasscode(e.target.value)} 
                            placeholder="••••••••" 
                            required 
                        />
                        <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '8px' }}>
                            Demo credentials: AGENT_01 / demo123
                        </small>
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                        Authenticate
                    </button>
                    {error && (
                        <div style={{ color: 'var(--alert-red)', marginTop: '15px', textAlign: 'center', fontSize: '13px' }}>
                            {error}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
