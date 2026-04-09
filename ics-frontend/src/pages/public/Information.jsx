import React from 'react';
import { Shield, FileText, CreditCard, Clock, Info, CheckCircle2, AlertTriangle, Globe, MapPin, SearchCheck } from 'lucide-react';
import './PublicPages.css';

const Information = () => {
  return (
    <div className="pub-page animate-fade-in">
      <div className="page-header">
        <Globe size={48} color="rgba(255,255,255,0.4)" style={{marginBottom: '24px'}} />
        <h1>Traveler Information Center</h1>
        <p>Official guidelines, visa regulations, and land border crossing protocols for visitors to the Federal Democratic Republic of Ethiopia.</p>
      </div>

      <div className="section-container" style={{marginTop: '-60px', position: 'relative', zIndex: '5'}}>
        <section className="features-grid" style={{marginBottom: '80px'}}>
          <div className="feature-card">
            <FileText size={36} color="var(--pub-primary)" className="feature-icon" />
            <h3>Passport Requirements</h3>
            <p>International travelers must possess a passport valid for at least six (6) months beyond the intended date of entry. High-resolution digital scans are required for E-Visa processing.</p>
          </div>
          <div className="feature-card">
            <Shield size={36} color="var(--pub-primary)" className="feature-icon" />
            <h3>Biometric Adjudication</h3>
            <p>All arrivals are subject to secondary biometric verification at the point of entry. Our new ICS forensic engine ensures rapid clearance for pre-approved travelers.</p>
          </div>
          <div className="feature-card">
            <CreditCard size={36} color="var(--pub-primary)" className="feature-icon" />
            <h3>Official Processing Fees</h3>
            <p>Standard 30-day single entry e-visas are processed for $82 USD. All fees are paid through our secure government payment gateway during the final step of application.</p>
          </div>
        </section>

        <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '60px', marginBottom: '80px'}}>
          <div className="glass-panel" style={{padding: '60px', background: 'white', borderRadius: '24px', border: '1px solid var(--pub-border)'}}>
            <div className="section-header">
              <SearchCheck size={28} color="var(--pub-accent)" />
              <h2>Standard Adjudication Workflow</h2>
            </div>
            
            <div className="workflow-steps" style={{display: 'flex', flexDirection: 'column', gap: '40px'}}>
              {[
                { n: '01', t: 'Data Transmission', d: 'Your personal and travel details are encrypted and transmitted to the ICS central gateway.' },
                { n: '02', t: 'Forensic Analysis', d: 'Our AI-driven engine performs a biometric quality check and real-time watchlist screening.' },
                { n: '03', t: 'Expert Adjudication', d: 'Senior ICS officers perform a final review of your forensic data and mission intent.' },
                { n: '04', t: 'Digital Issuance', d: 'An official E-Visa / Pre-Approval certificate is generated and sent to your secure inbox.' }
              ].map(step => (
                <div key={step.n} style={{display: 'flex', gap: '32px'}}>
                  <span style={{fontSize: '2rem', fontWeight: '900', color: 'var(--pub-primary)', opacity: 0.1}}>{step.n}</span>
                  <div>
                    <h4 style={{fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--pub-secondary)'}}>{step.t}</h4>
                    <p style={{margin: 0, color: 'var(--pub-text-muted)', lineHeight: '1.6'}}>{step.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: '32px'}}>
            <div style={{background: 'var(--pub-primary)', padding: '40px', borderRadius: '24px', color: 'white'}}>
              <MapPin size={32} color="var(--pub-accent)" style={{marginBottom: '20px'}} />
              <h3 style={{fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px'}}>Land Border Advisory</h3>
              <p style={{fontSize: '0.95rem', opacity: 0.8, lineHeight: '1.6', marginBottom: '24px'}}>
                Travelers entering via land borders (Moyale, Galafi, Togochale) must obtain pre-approval at least 72 hours before arrival.
              </p>
              <div style={{padding: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)'}}>
                <span style={{display: 'block', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--pub-accent)'}}>Tactical Note</span>
                <p style={{fontSize: '0.85rem', margin: 0}}>Physical printed copies of your approval are required at land ports for verification.</p>
              </div>
            </div>

            <div style={{padding: '40px', borderRadius: '24px', background: '#fef2f2', border: '1px solid #fee2e2'}}>
              <AlertTriangle color="#ef4444" size={32} style={{marginBottom: '20px'}} />
              <h3 style={{fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px', color: '#991b1b'}}>Compliance Warning</h3>
              <p style={{fontSize: '0.9rem', color: '#b91c1c', lineHeight: '1.6', margin: 0}}>
                Forging or presenting tampered documents at an Ethiopian Point of Entry is a federal offense. Our biometric engine detects fingerprint and iris mismatches instantly.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
export default Information;
