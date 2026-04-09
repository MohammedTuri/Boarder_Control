import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { UserCircle } from 'lucide-react';

const PublicHeader = () => {
  return (
    <header className="public-header glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0 }}>
      <div className="public-nav-container">
        <Link to="/" className="public-brand">
          <img src="/ics-logo.png" alt="ICS Logo" className="brand-logo-img" style={{ height: '55px', width: 'auto' }} />
        </Link>
        
        <nav className="public-nav-links">
          <NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''}>
            Portal Home
          </NavLink>
          <NavLink to="/information" className={({isActive}) => isActive ? 'active' : ''}>
            Transit Requirements
          </NavLink>
          <NavLink to="/status" className={({isActive}) => isActive ? 'active' : ''}>
            Track Status
          </NavLink>
          <NavLink to="/about" className={({isActive}) => isActive ? 'active' : ''}>
            Transparency
          </NavLink>
        </nav>
        
        <div className="public-actions">
          <Link to="/apply" className="public-btn primary">NEW APPLICATION</Link>
          <Link to="/login" className="public-btn outline" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
             <UserCircle size={18} /> AGENT ACCESS
          </Link>
        </div>
      </div>
    </header>
  );
};
export default PublicHeader;
