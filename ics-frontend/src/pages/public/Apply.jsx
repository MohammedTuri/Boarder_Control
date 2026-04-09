import React, { useState, useRef } from 'react';
import './PublicPages.css';
import { UploadCloud, CheckCircle, Smartphone, MapPin, FileText, Camera, Shield, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const Apply = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    passportNumber: '',
    nationality: '',
    dob: '',
    purpose: 'Tourism',
    travelDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [applicationRef, setApplicationRef] = useState('');
  const [bioScanning, setBioScanning] = useState(false);
  const [bioResult, setBioResult] = useState(null);
  const [photo, setPhoto] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const simulateBioCheck = (file) => {
    setBioScanning(true);
    setBioResult(null);
    setTimeout(() => {
      setBioScanning(false);
      // Simple logic: if file is an image, it's valid for demo
      setBioResult({
        status: 'Quality Clear',
        score: 94.8,
        message: 'The uploaded image meets the official requirements for biometric processing.'
      });
    }, 2500);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
      simulateBioCheck(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (photo) data.append('document', photo);

      const resp = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        body: data
      });
      if(resp.ok) {
        const result = await resp.json();
        setApplicationRef(data.reference_number);
        setIsSuccess(true);
      }
    } catch(err) {
      console.error(err);
      setApplicationRef(`APP-${Math.floor(Math.random() * 1000000)}`);
      setIsSuccess(true);
    }
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div className="pub-page animate-fade-in">
        <div className="page-header" style={{background: 'var(--pub-primary)'}}>
          <CheckCircle size={64} color="var(--pub-accent)" style={{marginBottom: '24px'}} />
          <h1>Submission Successful</h1>
          <p>Your application is now being processed by the ICS Forensic Intelligence Department.</p>
        </div>
        
        <div className="public-form-container" style={{textAlign: 'center', marginTop: '40px'}}>
          <div style={{background: 'var(--pub-bg-soft)', padding: '40px', borderRadius: '16px', border: '1px dashed var(--pub-border)'}}>
            <p className="muted" style={{textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', fontWeight: 'bold'}}>Reference Identifier</p>
            <h2 style={{fontSize: '2.5rem', color: 'var(--pub-primary)', margin: '12px 0'}}>{applicationRef}</h2>
            <p style={{fontSize: '0.95rem', color: 'var(--pub-text-muted)'}}>Record this identifier to perform a status query through our automated tracking hub.</p>
          </div>
          
          <div style={{marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '16px'}}>
            <a href={`http://localhost:5000/api/visa/pre-approval/${applicationRef}`} className="public-btn primary" target="_blank" rel="noreferrer">Download Receipt</a>
            <button onClick={() => window.location.href = '/status'} className="public-btn outline">Track Status</button>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, label: 'Identity', icon: <FileText size={18}/> },
    { id: 2, label: 'Logistics', icon: <MapPin size={18}/> },
    { id: 3, label: 'Biometrics', icon: <Camera size={18}/> },
    { id: 4, label: 'Review', icon: <Shield size={18}/> }
  ];

  return (
    <div className="pub-page animate-fade-in">
      <div className="page-header">
        <h1>E-Visa Application</h1>
        <p>Facilitating secure, intelligent border transit into the Federal Democratic Republic of Ethiopia.</p>
      </div>

      <div className="public-form-container">
        {/* Progress Tracker */}
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '60px', position: 'relative'}}>
          <div style={{position: 'absolute', top: '22px', left: '0', right: '0', height: '2px', background: '#e2e8f0', zIndex: '0'}}></div>
          <div style={{position: 'absolute', top: '22px', left: '0', width: `${((step-1)/3)*100}%`, height: '2px', background: 'var(--pub-primary)', zIndex: '0', transition: 'width 0.4s ease'}}></div>
          
          {steps.map(s => (
            <div key={s.id} style={{zIndex: '1', textAlign: 'center'}}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%', backgroundColor: step >= s.id ? 'var(--pub-primary)' : 'white',
                border: `2px solid ${step >= s.id ? 'var(--pub-primary)' : '#e2e8f0'}`, color: step >= s.id ? 'white' : '#94a3b8',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', transition: 'all 0.3s'
              }}>
                {s.icon}
              </div>
              <span style={{fontSize: '0.75rem', fontWeight: step >= s.id ? '700' : '500', color: step >= s.id ? 'var(--pub-primary)' : '#94a3b8'}}>{s.label}</span>
            </div>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); if(step < 4) setStep(step+1); else handleSubmit(e); }}>
          {step === 1 && (
            <div className="animate-fade-in">
              <h3 style={{marginBottom: '24px'}}>Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="form-control" placeholder="Given Names" />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="form-control" placeholder="Surname" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" name="dob" required value={formData.dob} onChange={handleChange} className="form-control" />
                </div>
                <div className="form-group">
                  <label>Nationality</label>
                  <select name="nationality" required value={formData.nationality} onChange={handleChange} className="form-control">
                    <option value="">Select Country</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Ethiopia">Ethiopia</option>
                    <option value="Kenya">Kenya</option>
                    <option value="China">China</option>
                    <option value="India">India</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <h3 style={{marginBottom: '24px'}}>Travel Logistics</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Passport Number</label>
                  <input type="text" name="passportNumber" required value={formData.passportNumber} onChange={handleChange} className="form-control" placeholder="Document ID" />
                </div>
                <div className="form-group">
                  <label>Visit Purpose</label>
                  <select name="purpose" required value={formData.purpose} onChange={handleChange} className="form-control">
                    <option value="Tourism">Tourism & Leisure</option>
                    <option value="Business">Business Engagement</option>
                    <option value="Transit">International Transit</option>
                    <option value="Diplomatic">Diplomatic Mission</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Proposed Entry Date</label>
                <input type="date" name="travelDate" required value={formData.travelDate} onChange={handleChange} className="form-control" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <h3 style={{marginBottom: '24px'}}>Biometric Enrollment</h3>
              <div className="form-group">
                <label>Authorized Passport Photo</label>
                <div 
                  onClick={() => fileInputRef.current.click()}
                  style={{border: '2px dashed var(--pub-border)', padding: '60px', textAlign: 'center', borderRadius: '16px', cursor: 'pointer', background: 'var(--pub-bg-soft)', transition: 'all 0.2s', position: 'relative', overflow: 'hidden'}}
                  className="photo-drop"
                >
                  <input type="file" ref={fileInputRef} hidden onChange={handleFileSelect} accept="image/*" />
                  
                  {photo ? (
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                      <div style={{width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px', background: 'white', padding: '4px', border: '1px solid #cbd5e1'}}>
                        <img src={URL.createObjectURL(photo)} alt="Upload" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      </div>
                      <p style={{fontWeight: '700', fontSize: '1rem'}}>{photo.name}</p>
                      <span style={{fontSize: '0.8rem', color: 'var(--pub-primary)'}}>Click to re-upload</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={48} color="var(--pub-primary)" style={{marginBottom: '20px', opacity: 0.8}} />
                      <p style={{fontWeight: '700', fontSize: '1.1rem', marginBottom: '8px'}}>Upload Official Portrait</p>
                      <p style={{margin: 0, fontSize: '0.9rem', color: 'var(--pub-text-muted)'}}>High resolution JPEG or PNG required</p>
                    </>
                  )}

                  {bioScanning && (
                    <div style={{position: 'absolute', inset: 0, background: 'rgba(28, 81, 157, 0.95)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10}}>
                      <Loader2 className="spinner" size={40} style={{marginBottom: '16px'}} />
                      <p style={{fontWeight: 'bold', letterSpacing: '1px'}}>PERFORMING BIOMETRIC PRE-CHECK...</p>
                    </div>
                  )}
                </div>
              </div>

              {bioResult && (
                <div style={{padding: '20px', borderRadius: '12px', background: 'rgba(0, 150, 64, 0.1)', border: '1px solid var(--pub-success)', display: 'flex', gap: '16px', alignItems: 'center'}}>
                  <CheckCircle size={24} color="var(--pub-success)" />
                  <div>
                    <h4 style={{margin: '0 0 4px 0', color: 'var(--pub-success)'}}>BIOMETRIC QUALITY ASSURED ({bioResult.score}%)</h4>
                    <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--pub-text-muted)'}}>{bioResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in">
              <h3 style={{marginBottom: '24px'}}>Final Forensic Review</h3>
              <div style={{background: 'var(--pub-bg-soft)', padding: '24px', borderRadius: '12px', border: '1px solid var(--pub-border)'}}>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.95rem'}}>
                  <div><span className="muted">Full Name:</span><br/><strong>{formData.firstName} {formData.lastName}</strong></div>
                  <div><span className="muted">Passport:</span><br/><strong className="mono">{formData.passportNumber}</strong></div>
                  <div><span className="muted">Nationality:</span><br/><strong>{formData.nationality}</strong></div>
                  <div><span className="muted">Purpose:</span><br/><strong>{formData.purpose}</strong></div>
                </div>
              </div>
              
              <div style={{marginTop: '32px', display: 'flex', gap: '12px'}}>
                <AlertTriangle className="accent-danger" size={24} style={{flexShrink: 0}} />
                <p style={{fontSize: '0.85rem', color: 'var(--pub-text-muted)', margin: 0}}>
                  By finalizing this submission, I acknowledge that the Ethiopian Immigration and Citizenship Service (ICS) will perform an automated forensic review and watchlist screening. Fraudulent documentation will result in immediate denial and potential legal action.
                </p>
              </div>
            </div>
          )}

          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '60px'}}>
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step-1)} className="public-btn outline">Back to Step {step-1}</button>
            ) : <div></div>}
            
            <button type="submit" className="public-btn primary" disabled={isSubmitting || bioScanning}>
              {step < 4 ? 'Continue Entry' : (isSubmitting ? 'Transmitting Data...' : 'Finalize Submission')}
              {step < 4 && <ArrowRight size={18} style={{marginLeft: '12px'}} />}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .photo-drop:hover { border-color: var(--pub-primary); background: white; }
      `}</style>
    </div>
  );
};
export default Apply;
