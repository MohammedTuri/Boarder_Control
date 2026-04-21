import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, Clock, Globe, Shield } from 'lucide-react';
import './PublicPages.css';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="pub-page animate-fade-in">
        <div className="page-header" style={{background: 'var(--pub-primary)'}}>
          <CheckCircle2 size={64} color="var(--pub-accent)" style={{marginBottom: '24px'}} />
          <h1>Inquiry Transmitted</h1>
          <p>Your record has been logged in the national support archive.</p>
        </div>
        
        <div className="public-form-container" style={{textAlign: 'center', marginTop: '40px'}}>
          <div style={{background: 'var(--pub-bg-soft)', padding: '60px', borderRadius: '24px', border: '1px dashed var(--pub-border)'}}>
            <h3 style={{fontSize: '1.5rem', marginBottom: '16px'}}>Ticket Logged Successfully</h3>
            <p style={{color: 'var(--pub-text-muted)', maxWidth: '500px', margin: '0 auto 32px', lineHeight: '1.7'}}>
              An ICS adjudication officer will review your inquiry and respond to the provided credentials within 24-48 hours. Please check your secure inbox for updates.
            </p>
            <button onClick={() => setSubmitted(false)} className="public-btn primary">Submit New Inquiry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pub-page animate-fade-in">
      <div className="page-header">
        <MessageSquare size={48} color="rgba(255,255,255,0.4)" style={{marginBottom: '24px'}} />
        <h1>Contact the Inquiry Desk</h1>
        <p>Facilitating secure and transparent communication for all immigration and transit-related matters.</p>
      </div>

      <div className="section-container" style={{marginTop: '-60px', position: 'relative', zIndex: '5'}}>
        <div className="contact-grid" style={{display: 'grid', gridTemplateColumns: '1fr 400px', gap: '60px', alignItems: 'flex-start'}}>
          <div className="glass-panel" style={{padding: '60px', background: 'white', border: '1px solid var(--pub-border)', borderRadius: '24px'}}>
            <div className="section-header">
               <Send size={24} color="var(--pub-accent)" />
               <h2>Electronic Submission Form</h2>
            </div>
            
            <form onSubmit={handleSubmit} style={{marginTop: '32px'}}>
              <div className="form-row">
                <div className="form-group">
                  <label>LEGAL FULL NAME</label>
                  <input required type="text" className="form-control" placeholder="Given Name and Surname" />
                </div>
                <div className="form-group">
                  <label>SECURE EMAIL CREDENTIAL</label>
                  <input required type="email" className="form-control" placeholder="official@domain.com" />
                </div>
              </div>
              
              <div className="form-group">
                <label>INQUIRY CLASSIFICATION</label>
                <select required className="form-control">
                  <option value="">Select Category</option>
                  <option value="visa">E-Visa Adjudication Status</option>
                  <option value="border">Land Border Technical Protocols</option>
                  <option value="technical">Gateway Accessibility Issue</option>
                  <option value="forensic">Biometric Verification Dispute</option>
                </select>
              </div>

              <div className="form-group">
                <label>DETAILED SUBMISSION</label>
                <textarea required className="form-control" rows="8" placeholder="Please provide specific details and your Reference Identifier (if applicable)..."></textarea>
              </div>

              <div style={{marginTop: '40px'}}>
                <button type="submit" className="public-btn primary" style={{width: '100%', gap: '12px'}} disabled={loading}>
                  {loading ? <Clock className="spinner" size={18} /> : <Shield size={18} />}
                  {loading ? 'TRANSMITTING TO GATEWAY...' : 'FINALIZE SUBMISSION'}
                </button>
              </div>
            </form>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: '32px'}}>
            <div className="feature-card" style={{padding: '40px', background: 'white', border: '1px solid var(--pub-border)', borderRadius: '24px', textAlign: 'left'}}>
              <h4 style={{fontSize: '1rem', fontWeight: '800', color: 'var(--pub-secondary)', marginBottom: '24px', borderBottom: '1px solid var(--pub-border)', paddingBottom: '16px'}}>CENTRAL HEADQUARTERS</h4>
              
              <div style={{display: 'flex', gap: '16px', marginBottom: '24px'}}>
                <MapPin size={22} color="var(--pub-primary)" style={{marginTop: '2px'}} />
                <div>
                  <p style={{margin: 0, fontWeight: '700', fontSize: '0.95rem'}}>Kirkos Administrative District</p>
                  <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--pub-text-muted)'}}>Near National Post Office, Addis Ababa</p>
                </div>
              </div>

              <div style={{display: 'flex', gap: '16px', marginBottom: '24px'}}>
                <Phone size={22} color="var(--pub-primary)" />
                <div>
                  <p style={{margin: 0, fontWeight: '700', fontSize: '0.95rem'}}>Support Line</p>
                  <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--pub-text-muted)'}}>+251 11 155 1111</p>
                </div>
              </div>

              <div style={{display: 'flex', gap: '16px'}}>
                <Mail size={22} color="var(--pub-primary)" />
                <div>
                  <p style={{margin: 0, fontWeight: '700', fontSize: '0.95rem'}}>Transmission Hub</p>
                  <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--pub-text-muted)'}}>inquiry@ics.gov.et</p>
                </div>
              </div>
            </div>

            <div className="feature-card" style={{padding: '40px', background: 'var(--pub-bg-soft)', border: '1px solid var(--pub-border)', borderRadius: '24px', textAlign: 'left'}}>
              <h4 style={{fontSize: '1rem', fontWeight: '800', color: 'var(--pub-secondary)', marginBottom: '16px'}}>OPERATIONAL HOURS</h4>
              <p style={{fontSize: '0.9rem', color: 'var(--pub-text-muted)', lineHeight: '1.7', margin: 0}}>
                <strong style={{color: 'var(--pub-secondary)'}}>Standard Desk:</strong> Mon - Fri, 8:30 - 17:30 EAT<br/>
                <strong style={{color: 'var(--pub-secondary)'}}>Forensic Adjudication:</strong> 24/7 Operations<br/>
                <em style={{fontSize: '0.8rem', display: 'block', marginTop: '12px'}}>* Automated tracking is available 24/7 via the Tracking Hub.</em>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .spinner { animation: spin 1.5s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Contact;
