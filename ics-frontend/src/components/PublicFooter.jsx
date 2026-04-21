import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Globe, MessageSquare, Phone, Mail, Award } from 'lucide-react';

const PublicFooter = () => {
  return (
    <footer className="public-footer">
      <div className="footer-content">
        <div className="f-col main-col">
          <div className="footer-logo" style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px'}}>
            <ShieldCheck size={32} color="var(--pub-accent)" />
            <h3 style={{margin: 0, fontSize: '1.4rem', fontWeight: '800', letterSpacing: '1px', color: '#fff'}}>ICS ETHIOPIA</h3>
          </div>
          <p style={{marginBottom: '24px', fontSize: '0.95rem', color: '#94a3b8', lineHeight: '1.7'}}>
            The Immigration and Citizenship Service (ICS) is the primary federal agency responsible for the security, integrity, and facilitation of international transit within the Federal Democratic Republic of Ethiopia.
          </p>
          <div className="trust-badges" style={{display: 'flex', gap: '12px'}}>
            <div className="trust-item" style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '6px', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)', fontWeight: 'bold'}}>
              <Lock size={12} /> SECURE TLS 1.3
            </div>
            <div className="trust-item" style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '6px', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', fontWeight: 'bold'}}>
              <Award size={12} /> SOVEREIGN GATEWAY
            </div>
          </div>
        </div>

        <div className="f-col">
          <h4>GOVERNANCE</h4>
          <ul>
            <li><Link to="/about">Agency Mission</Link></li>
            <li><Link to="/about">Policy Framework</Link></li>
            <li><Link to="/about">Transparency Hub</Link></li>
            <li><Link to="/login">Agent Authentication</Link></li>
          </ul>
        </div>

        <div className="f-col">
          <h4>OPERATIONS</h4>
          <ul>
            <li><Link to="/apply">New Application</Link></li>
            <li><Link to="/status">Track Execution</Link></li>
            <li><Link to="/information">Border Protocols</Link></li>
            <li><Link to="/information">Port Accessibility</Link></li>
          </ul>
        </div>

        <div className="f-col">
          <h4>SUPPORT CORE</h4>
          <ul style={{gap: '20px'}}>
             <li>
               <div style={{display: 'flex', gap: '12px', color: '#94a3b8'}}>
                 <MessageSquare size={18} color="var(--pub-accent)" />
                 <div>
                   <span style={{display: 'block', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b'}}>Live Desk</span>
                   <Link to="/contact">Simulated Live Support</Link>
                 </div>
               </div>
             </li>
             <li>
               <div style={{display: 'flex', gap: '12px', color: '#94a3b8'}}>
                 <Phone size={18} color="var(--pub-accent)" />
                 <div>
                   <span style={{display: 'block', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b'}}>Emergency Line</span>
                   <span>+251 11 XXX XXXX</span>
                 </div>
               </div>
             </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} Federal Democratic Republic of Ethiopia | Immigration and Citizenship Service (ICS). <br/>
          Unauthorized access to this portal is strictly prohibited and subject to federal prosecution under the Computer Crimes Proclamation.
        </p>
      </div>
    </footer>
  );
};

export default PublicFooter;
