import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Home, Users, FileText, Settings as SettingsIcon, UserCog, Search, AlertOctagon, Activity, ChevronDown, CheckCircle, Clock, XCircle, BarChart, ClipboardList, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const REPORT_ITEMS = [
  { id: 'crossings', label: 'Daily Crossing Audit', icon: FileText },
  { id: 'visa_stats', label: 'Visa Statistics', icon: BarChart },
  { id: 'visa_approved', label: 'Approved Visas', icon: CheckCircle },
  { id: 'visa_pending', label: 'Pending Visas', icon: Clock },
  { id: 'visa_rejected', label: 'Rejected Visas', icon: XCircle },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, authFetch } = useAuth();
  const [reportsOpen, setReportsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const resp = await authFetch('/api/stats');
        if (resp.ok) {
          const data = await resp.json();
          setPendingCount(data.pendingApplications || 0);
        }
      } catch (err) { /* silent */ }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, [authFetch]);

  const isReportsActive = location.pathname.includes('/admin/history');

  const handleReportClick = (reportId) => {
    navigate(`/admin/history?report=${reportId}`);
    if (window.innerWidth <= 768) onClose();
  };
  
  return (
    <aside className={`glass-panel sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <img src="/ics-logo.png" alt="ICS Logo" style={{ height: '45px', width: 'auto', marginBottom: '8px' }} />
        <button className="sidebar-close" onClick={onClose} aria-label="Close Menu">
          <X size={24} />
        </button>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/admin" end className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={() => { if (window.innerWidth <= 768) onClose(); }}>
          <Home size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/admin/processing" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={() => { if (window.innerWidth <= 768) onClose(); }}>
          <Users size={20} />
          <span>Processing</span>
        </NavLink>
        {['Administrator', 'Supervisor'].includes(user?.role) && (
          <NavLink to="/admin/applications" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} style={{position: 'relative'}} onClick={() => { if (window.innerWidth <= 768) onClose(); }}>
            <ClipboardList size={20} />
            <span>Visa Applications</span>
            {pendingCount > 0 && (
              <span style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#fbbf24',
                color: '#000',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '10px',
                minWidth: '20px',
                textAlign: 'center',
                lineHeight: '1.2'
              }}>{pendingCount}</span>
            )}
          </NavLink>
        )}
        <NavLink to="/admin/search" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={() => { if (window.innerWidth <= 768) onClose(); }}>
          <Search size={20} />
          <span>Database Search</span>
        </NavLink>
        {['Administrator', 'Supervisor'].includes(user?.role) && (
          <>
            <div className="nav-dropdown-container">
              <button 
                className={`nav-item nav-dropdown-toggle ${isReportsActive ? 'active' : ''}`}
                onClick={() => setReportsOpen(!reportsOpen)}
              >
                <FileText size={20} />
                <span>Operational Reports</span>
                <ChevronDown size={16} className={`dropdown-chevron ${reportsOpen ? 'open' : ''}`} />
              </button>
              {reportsOpen && (
                <div className="nav-dropdown-menu">
                  {REPORT_ITEMS.map(item => {
                    const Icon = item.icon;
                    const params = new URLSearchParams(location.search);
                    const isActive = isReportsActive && params.get('report') === item.id;
                    return (
                      <button
                        key={item.id}
                        className={`nav-sub-item ${isActive ? 'active' : ''}`}
                        onClick={() => handleReportClick(item.id)}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <NavLink to="/admin/watchlist" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={() => { if (window.innerWidth <= 768) onClose(); }}>
              <AlertOctagon size={20} />
              <span>Watchlist</span>
            </NavLink>
          </>
        )}
        
        {user?.role === 'Administrator' && (
          <>
            <NavLink to="/admin/users" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={() => { if (window.innerWidth <= 768) onClose(); }}>
              <UserCog size={20} />
              <span>Personnel Audit</span>
            </NavLink>
            <NavLink to="/admin/audit" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={() => { if (window.innerWidth <= 768) onClose(); }}>
              <Activity size={20} />
              <span>System Integrity</span>
            </NavLink>
          </>
        )}

      </nav>
      
      <div className="sidebar-mission-status" style={{
        marginTop: 'auto',
        padding: '20px 16px',
        borderTop: '1px solid var(--glass-border-light)',
        background: 'rgba(0,0,0,0.2)'
      }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
          <span className="muted text-xs font-bold" style={{fontSize: '0.6rem', letterSpacing: '1px'}}>MISSION SEC-LEVEL</span>
          <div className="pulse" style={{width: '6px', height: '6px', borderRadius: '50%', background: '#10b981'}}></div>
        </div>
        <div style={{
          fontSize: '1.2rem', 
          fontWeight: '900', 
          letterSpacing: '2px',
          color: pendingCount > 10 ? '#ef4444' : pendingCount > 5 ? '#f59e0b' : '#3b82f6'
        }}>
          {pendingCount > 10 ? 'DELTA' : pendingCount > 5 ? 'CHARLIE' : 'BRAVO'}
        </div>
        <div className="muted" style={{fontSize: '0.65rem', marginTop: '4px'}}>Operational Uptime: 99.9%</div>
      </div>

      {['Administrator', 'Supervisor'].includes(user?.role) && (
        <div className="sidebar-footer">
          <NavLink to="/admin/settings" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} onClick={() => { if (window.innerWidth <= 768) onClose(); }}>
            <SettingsIcon size={20} />
            <span>Settings</span>
          </NavLink>
        </div>
      )}
    </aside>
  );
};
export default Sidebar;
