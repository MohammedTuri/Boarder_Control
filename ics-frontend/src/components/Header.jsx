import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Bell, User, LogOut, AlertTriangle, Clock, MapPin, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import './Header.css';

const Header = ({ onMenuToggle }) => {
  const navigate = useNavigate();
  const { user, logout, authFetch } = useAuth();
  const { enableNotifications } = useSettings();
  const [time, setTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const alertTimer = setInterval(fetchAlerts, 30000); // Check every 30s
    fetchAlerts();
    return () => {
      clearInterval(timer);
      clearInterval(alertTimer);
    };
  }, []);

  const fetchAlerts = async () => {
    try {
      const resp = await authFetch('/api/crossings');
      if (resp.ok) {
        const data = await resp.json();
        const flagged = data.filter(c => c.status === 'Flagged').slice(0, 5);
        setAlerts(flagged);
      }
    } catch (err) {
      console.error('Alert fetch failed:', err);
    }
  };

  const formatUTC = (date) => {
    return date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  };

  return (
    <header className="glass-panel top-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuToggle} aria-label="Toggle Menu">
          <Menu size={24} />
        </button>
        <div className="status-indicator">
          <span className="dot pulse"></span>
          <span className="status-text">SYSTEM SECURE</span>
        </div>
      </div>
      <div className="header-right">
        <div className="utc-clock">
          <code>{formatUTC(time)}</code>
        </div>
        <div className="header-actions">
          {enableNotifications && (
            <div className="notification-wrapper">
              <button className={`icon-btn ${alerts.length > 0 ? 'has-alerts' : ''}`} onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={20} />
                {alerts.length > 0 && <span className="alert-badge"></span>}
              </button>
              
              {showNotifications && (
                <div className="notification-dropdown glass-panel animate-slide-in">
                  <div className="dropdown-header">
                    <h3>Security Alerts</h3>
                    <span className="alert-count">{alerts.length} New Matches</span>
                  </div>
                  <div className="dropdown-content">
                    {alerts.length > 0 ? alerts.map(alert => (
                      <div 
                        key={alert.id} 
                        className="alert-item" 
                        onClick={() => {
                          setShowNotifications(false);
                          navigate(`/admin/profile/${alert.passport}`);
                        }}
                      >
                        <div className="alert-icon"><AlertTriangle size={16} color="#ef4444" /></div>
                        <div className="alert-info">
                          <p className="alert-text"><strong>{alert.full_name}</strong> - Watchlist Triggered</p>
                          <div className="alert-meta">
                            <span>{alert.passport}</span>
                            <span><Clock size={12} /> {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                    )) : <p className="muted empty-msg">No critical alerts detected.</p>}
                  </div>
                  <button className="view-all-btn" onClick={() => { setShowNotifications(false); navigate('/admin/history?report=crossings'); }}>View All Activity</button>
                </div>
              )}
            </div>
          )}

          <NavLink to="/admin/profile" className="user-profile">
            <div className="avatar">
              <User size={18} />
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'Administrator'}</span>
              <span className="user-role">{user?.role || 'Command Center'}</span>
            </div>
          </NavLink>
          <button className="icon-btn logout-btn" onClick={logout} title="Sign Out">
            <LogOut size={20} />
          </button>
        </div>
      </div>
      <style>{`
        .notification-wrapper { position: relative; }
        .has-alerts { color: var(--accent-blue) !important; }
        .alert-badge { position: absolute; top: 4px; right: 4px; width: 8px; height: 8px; background: #ef4444; border-radius: 50%; border: 2px solid var(--bg-dark); }
        .notification-dropdown { position: absolute; top: calc(100% + 15px); right: -100px; width: 320px; z-index: 1000; padding: 0; overflow: hidden; border: 1px solid var(--glass-border); box-shadow: var(--shadow-xl); }
        .dropdown-header { padding: 16px; border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.05); }
        .dropdown-header h3 { font-size: 0.9rem; margin: 0; }
        .alert-count { font-size: 0.7rem; background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 2px 8px; border-radius: 10px; font-weight: 700; }
        .dropdown-content { max-height: 350px; overflow-y: auto; }
        .alert-item { padding: 12px 16px; display: flex; gap: 12px; border-bottom: 1px solid var(--glass-border-light); transition: background 0.2s; cursor: pointer; }
        .alert-item:hover { background: rgba(255,255,255,0.05); }
        .alert-info { flex: 1; }
        .alert-text { font-size: 0.85rem; margin: 0 0 4px 0; color: var(--text-main); }
        .alert-meta { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); font-family: monospace; }
        .view-all-btn { width: 100%; padding: 12px; background: transparent; border: none; border-top: 1px solid var(--glass-border); color: var(--accent-blue); font-size: 0.8rem; font-weight: 600; cursor: pointer; }
        .empty-msg { padding: 40px 20px; text-align: center; font-size: 0.85rem; }
      `}</style>
    </header>
  );
};
export default Header;
