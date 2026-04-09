import React from 'react';
import { Shield, Target, Eye, Users, Landmark, Globe, Trophy, Award, Zap } from 'lucide-react';
import './PublicPages.css';

const About = () => {
  return (
    <div className="pub-page animate-fade-in">
      <div className="page-header">
        <Landmark size={48} color="rgba(255,255,255,0.4)" style={{marginBottom: '24px'}} />
        <h1>Immigration & Citizenship Service</h1>
        <p>The sole designated federal authority for the management of Ethiopia's borders, citizenship, and national identity integrity.</p>
      </div>

      <div className="section-container" style={{marginTop: '-60px', position: 'relative', zIndex: '5'}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '80px'}}>
          <div className="glass-panel" style={{padding: '40px', background: 'white', border: '1px solid var(--pub-border)', borderRadius: '24px'}}>
            <Target size={36} color="var(--pub-primary)" style={{marginBottom: '20px'}} />
            <h3 style={{marginBottom: '16px', fontSize: '1.4rem', fontWeight: '800'}}>Our Mission</h3>
            <p style={{margin: 0, color: 'var(--pub-text-muted)', fontSize: '0.95rem', lineHeight: '1.7'}}>
              To ensure the absolute sovereignty and security of the Federal Democratic Republic of Ethiopia by effectively managing entry and exit points, providing reliable services to citizens, and upholding national immigration mandates via high-fidelity forensic verification.
            </p>
          </div>
          <div className="glass-panel" style={{padding: '40px', background: 'white', border: '1px solid var(--pub-border)', borderRadius: '24px'}}>
            <Eye size={36} color="var(--pub-primary)" style={{marginBottom: '20px'}} />
            <h3 style={{marginBottom: '16px', fontSize: '1.4rem', fontWeight: '800'}}>Our Vision</h3>
            <p style={{margin: 0, color: 'var(--pub-text-muted)', fontSize: '0.95rem', lineHeight: '1.7'}}>
              To become a world-class, technologically-driven border management service provider in Africa, facilitating lawful global transit while uncompromisingly protecting national interests through real-time forensic intelligence.
            </p>
          </div>
        </div>

        <section style={{marginBottom: '80px'}}>
          <div className="section-header" style={{justifyContent: 'center', textAlign: 'center', marginBottom: '48px'}}>
             <Award size={32} color="var(--pub-accent)" />
             <h2 style={{fontSize: '2rem'}}>Core Administrative Mandates</h2>
          </div>
          
          <div className="features-grid">
            <div className="feature-card" style={{textAlign: 'left', padding: '32px'}}>
              <Shield size={24} color="var(--pub-primary)" style={{marginBottom: '16px'}} />
              <h4 style={{fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px'}}>Border Control</h4>
              <p style={{fontSize: '0.9rem', color: 'var(--pub-text-muted)', lineHeight: '1.6'}}>Supervising all entry and exit points, including international airports and land border crossings, using advanced biometric verification and real-time watchlist integration.</p>
            </div>
            <div className="feature-card" style={{textAlign: 'left', padding: '32px'}}>
              <Globe size={24} color="var(--pub-primary)" style={{marginBottom: '16px'}} />
              <h4 style={{fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px'}}>E-Visa Governance</h4>
              <p style={{fontSize: '0.9rem', color: 'var(--pub-text-muted)', lineHeight: '1.6'}}>Processing electronic visa authorizations, residency permits, and diplomatic clearances according to the National Immigration Act of Ethiopia.</p>
            </div>
            <div className="feature-card" style={{textAlign: 'left', padding: '32px'}}>
              <Users size={24} color="var(--pub-primary)" style={{marginBottom: '16px'}} />
              <h4 style={{fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px'}}>Citizenship Hub</h4>
              <p style={{fontSize: '0.9rem', color: 'var(--pub-text-muted)', lineHeight: '1.6'}}>Adjudicating Ethiopian citizenship applications and maintaining the national database for primary identification and biometric records.</p>
            </div>
          </div>
        </section>

        <section className="glass-panel" style={{padding: '60px', background: 'var(--pub-primary)', borderRadius: '32px', color: 'white', position: 'relative', overflow: 'hidden'}}>
          <div style={{position: 'relative', zIndex: 2}}>
             <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px'}}>
               <Zap size={32} color="var(--pub-accent)" />
               <h3 style={{fontSize: '1.8rem', fontWeight: '900', margin: 0}}>Strategic Digital Transformation</h3>
             </div>
             <p style={{margin: 0, lineHeight: '1.8', fontSize: '1.1rem', opacity: 0.9, maxWidth: '800px'}}>
               Under the national digital mandate, the ICS is migrating all primary adjudication workflows to a secure, high-fidelity cloud infrastructure. This new "Intelligent Border Service" represents our commitment to state-of-the-art forensic security, real-time biometric analysis, and world-class public service delivery.
             </p>
          </div>
          <div style={{position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.1}}>
             <Landmark size={240} />
          </div>
        </section>
      </div>
    </div>
  );
};
export default About;
