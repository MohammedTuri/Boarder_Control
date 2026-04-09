import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, Grid, Scan, History, AlertTriangle, ShieldAlert, LogOut } from 'lucide-react';

export default function Sidebar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <Shield className="bg-gold-text" size={32} />
                    <div className="logo-text">
                        <h2>ICS</h2>
                        <span>Border Control</span>
                    </div>
                </div>
            </div>
            
            <ul className="nav-links">
                <li>
                    <NavLink to="/" className={({isActive}) => isActive ? "active" : ""}>
                        <Grid size={20} /> Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/processing" className={({isActive}) => isActive ? "active" : ""}>
                        <Scan size={20} /> Process Traveler
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/history" className={({isActive}) => isActive ? "active" : ""}>
                        <History size={20} /> Timeline Log
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/watchlists" className={({isActive}) => isActive ? "active" : ""}>
                        <AlertTriangle size={20} /> Watchlists
                    </NavLink>
                </li>
                {user?.role === 'admin' && (
                    <li>
                        <NavLink to="/admin" className={({isActive}) => isActive ? "active" : ""}>
                            <ShieldAlert size={20} /> System Admin
                        </NavLink>
                    </li>
                )}
            </ul>

            <div className="sidebar-footer">
                <div className="agent-profile" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <img 
                      src={`https://ui-avatars.com/api/?name=${user?.name || 'Agent'}&background=0A3B22&color=fff`} 
                      alt="Agent" 
                      style={{ width: '38px', height: '38px' }} 
                    />
                    <div className="agent-info">
                        <strong style={{ fontSize: '13px' }}>{user?.name}</strong>
                        <span style={{ fontSize: '11px', opacity: 0.8 }}>{user?.checkpoint}</span>
                    </div>
                    <button 
                        className="icon-btn" 
                        onClick={handleLogout} 
                        title="Logout" 
                        style={{ marginLeft: 'auto', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <LogOut size={16} color="#fff" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
