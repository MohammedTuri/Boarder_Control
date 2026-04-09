import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, CheckCircle, Globe, Zap, AlertCircle, Newspaper, ArrowRight, Shield, Clock, MapPin } from 'lucide-react';
import './PublicPages.css';

const Home = () => {
  return (
    <div className="pub-page animate-fade-in">
      <section className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <div className="badge animate-fade" style={{background: 'rgba(245, 158, 11, 0.2)', color: 'var(--pub-accent)', border: '1px solid var(--pub-accent)'}}>FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA</div>
            <h1>The Intelligent Gateway to Ethiopia</h1>
            <p>Securely apply for your E-Visa or border pre-approval using our next-generation processing system. Experience seamless transit through our modernized land and air ports.</p>
            <div className="hero-actions">
              <Link to="/apply" className="public-btn primary">Start Application</Link>
              <Link to="/status" className="public-btn outline light">Track Application</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="section-container">
        <section className="status-grid-section" style={{marginBottom: '80px'}}>
          <div className="section-header">
            <Zap size={24} color="var(--pub-accent)" />
            <h2>Live Border Operations Status</h2>
          </div>
          <div className="features-grid">
            {[
              { name: 'Bole International', status: 'Online', delay: '5 min', load: 'Normal' },
              { name: 'Moyale Border', status: 'Online', delay: '12 min', load: 'Steady' },
              { name: 'Galafi Border', status: 'Maintenance', delay: '45 min', load: 'Heavy' }
            ].map((station, i) => (
              <div key={i} className="feature-card" style={{padding: '24px', textAlign: 'left'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px'}}>
                  <span style={{fontWeight: '700', fontSize: '1.1rem'}}>{station.name}</span>
                  <span className={`dot ${station.status === 'Online' ? 'online' : 'warning'}`}></span>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.9rem'}}>
                  <div className="muted">Processing:</div>
                  <div style={{fontWeight: '600'}}>{station.delay}</div>
                  <div className="muted">Traffic Load:</div>
                  <div style={{fontWeight: '600', color: station.load === 'Heavy' ? '#ef4444' : 'inherit'}}>{station.load}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="journey-section" style={{marginBottom: '80px', background: 'var(--pub-bg-soft)', padding: '60px', borderRadius: '24px'}}>
          <div className="section-header" style={{justifyContent: 'center', textAlign: 'center'}}>
            <h2>Your Journey to Ethiopia</h2>
          </div>
          <div className="features-grid" style={{marginTop: '40px'}}>
            {[
              { icon: <Smartphone size={32} />, title: '1. Online Application', desc: 'Complete our secure biometric-ready form in under 10 minutes.' },
              { icon: <Shield size={32} />, title: '2. Verification', desc: 'Our advanced forensics engine reviews your request in real-time.' },
              { icon: <CheckCircle size={32} />, title: '3. Approval', desc: 'Receive your official pre-approval document via email.' },
              { icon: <Globe size={32} />, title: '4. Welcome', desc: 'Present your document at any point of entry for rapid clearance.' }
            ].map((step, i) => (
              <div key={i} style={{textAlign: 'center', position: 'relative'}}>
                <div style={{width: '64px', height: '64px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--pub-primary)', boxShadow: 'var(--pub-shadow)'}}>
                  {step.icon}
                </div>
                <h4 style={{marginBottom: '8px', fontSize: '1.1rem'}}>{step.title}</h4>
                <p style={{fontSize: '0.9rem', color: 'var(--pub-text-muted)'}}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="news-section">
          <div className="section-header">
            <Newspaper size={24} color="var(--pub-primary)" />
            <h2>Latest Official Updates</h2>
          </div>
          <div className="features-grid">
            <div className="feature-card" style={{textAlign: 'left'}}>
              <span className="news-date" style={{fontSize: '0.8rem', color: 'var(--pub-text-muted)'}}>APRIL 03, 2026</span>
              <h4 style={{margin: '8px 0 16px 0', fontSize: '1.2rem'}}>New Land Border Protocols for 2026</h4>
              <p style={{marginBottom: '20px'}}>ICS announces integrated biometric verification for all land border crossings to enhance national security.</p>
              <Link to="/information" style={{color: 'var(--pub-primary)', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px'}}>
                Read Full Brief <ArrowRight size={14} />
              </Link>
            </div>
            <div className="feature-card" style={{textAlign: 'left'}}>
              <span className="news-date" style={{fontSize: '0.8rem', color: 'var(--pub-text-muted)'}}>MARCH 29, 2026</span>
              <h4 style={{margin: '8px 0 16px 0', fontSize: '1.2rem'}}>Expansion of E-Visa Eligibility</h4>
              <p style={{marginBottom: '20px'}}>New categories for business travelers and NGO workers have been prioritized for express processing.</p>
              <Link to="/information" style={{color: 'var(--pub-primary)', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px'}}>
                Read Full Brief <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .dot { height: 10px; width: 10px; border-radius: 50%; }
        .dot.online { background: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
        .dot.warning { background: #f59e0b; box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1); }
        .dot.offline { background: #ef4444; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1); }
      `}</style>
    </div>
  );
};
export default Home;
