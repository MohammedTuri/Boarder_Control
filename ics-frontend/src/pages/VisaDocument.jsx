import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Printer, Download, ArrowLeft, 
  Globe, Calendar, MapPin, User, FileText, Loader2, AlertTriangle,
  QrCode
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './VisaDocument.css';

const VisaDocument = () => {
  const { reference } = useParams();
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVisaData = async () => {
      try {
        // Use a public or authenticated fetch depending on the context
        // In this case, we use the specific application lookup by reference
        const resp = await fetch(`http://localhost:5000/api/applications/status/${reference}`);
        if (resp.ok) {
          setData(await resp.json());
        } else {
          setError('IDENTIFICATION FAILED: E-Visa record not located.');
        }
      } catch (err) {
        setError('Communication error with ICS archives.');
      } finally {
        setLoading(false);
      }
    };
    fetchVisaData();
  }, [reference]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="visa-doc-loading">
        <Loader2 className="spinner" size={48} />
        <p>Retrieving secure mission document...</p>
      </div>
    );
  }

  if (error || !data || data.status !== 'Approved') {
    return (
      <div className="visa-doc-error">
        <AlertTriangle size={64} color="#ef4444" />
        <h2>Document Retrieval Failed</h2>
        <p>{error || 'This application has not been approved for electronic issuance.'}</p>
        <button onClick={() => navigate(-1)} className="back-btn"><ArrowLeft size={18} /> Return</button>
      </div>
    );
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=http://localhost:5173/verify/${reference}`;
  const expiryDate = new Date(new Date(data.travel_date).getTime() + (90 * 24 * 60 * 60 * 1000)); // 90 days from travel date

  return (
    <div className="visa-doc-container animate-fade-in">
      <div className="no-print doc-controls">
        <button onClick={() => navigate(-1)} className="control-btn"><ArrowLeft size={18} /> Back</button>
        <div style={{display: 'flex', gap: '12px'}}>
          <button onClick={handlePrint} className="control-btn primary"><Printer size={18} /> Print Document</button>
        </div>
      </div>

      <div className="visa-paper" id="visa-document">
        {/* Header */}
        <div className="visa-header">
          <div className="govt-seal">
             <div className="seal-outer">
               <Globe size={40} strokeWidth={1} />
             </div>
          </div>
          <div className="header-text">
            <h4>FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA</h4>
            <h3>IMMIGRATION AND CITIZENSHIP SERVICE (ICS)</h3>
            <h2>ELECTRONIC VISA (E-VISA)</h2>
          </div>
          <div className="doc-meta">
            <span className="ref-label">DOCUMENT NUMBER</span>
            <span className="ref-val mono">{reference}</span>
          </div>
        </div>

        {/* Main Section */}
        <div className="visa-body">
          <div className="visa-main-info">
            <div className="photo-panel">
               <div className="photo-placeholder">
                  <User size={80} strokeWidth={1} color="#cbd5e1" />
                  <span className="photo-tag">DIGITAL ID PHOTO</span>
               </div>
               <div className="verification-label">
                  <ShieldCheck size={14} /> SECURITY VERIFIED
               </div>
            </div>

            <div className="info-grid">
              <div className="info-field full">
                <label>FULL NAME OF HOLDER</label>
                <div className="val">{data.first_name} {data.last_name}</div>
              </div>
              <div className="info-field">
                <label>PASSPORT NUMBER</label>
                <div className="val mono">{data.passport_number}</div>
              </div>
              <div className="info-field">
                <label>NATIONALITY</label>
                <div className="val uppercase">{data.nationality}</div>
              </div>
              <div className="info-field">
                <label>DATE OF BIRTH</label>
                <div className="val">{new Date(data.dob).toLocaleDateString()}</div>
              </div>
              <div className="info-field">
                <label>VISA TYPE / PURPOSE</label>
                <div className="val">{data.purpose}</div>
              </div>
            </div>
          </div>

          <div className="visa-dates" style={{
            background: 'rgba(28, 81, 157, 0.03)',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '24px',
            marginTop: '32px'
          }}>
            <div className="date-box">
              <label>DATE OF ISSUANCE</label>
              <div className="val">{new Date(data.created_at).toLocaleDateString()}</div>
            </div>
            <div className="date-box highlight">
              <label>CLEARANCE EXPIRY</label>
              <div className="val" style={{color: '#1c519d'}}>{expiryDate.toLocaleDateString()}</div>
            </div>
            <div className="date-box">
              <label>ENTRIES ALLOWED</label>
              <div className="val" style={{fontWeight: '900', color: '#1e293b'}}>SINGLE ENTRY</div>
            </div>
          </div>

          <div className="visa-footer">
            <div className="security-section">
              <div className="qr-box">
                <img src={qrUrl} alt="Verification QR" />
                <span>SCAN TO VERIFY</span>
              </div>
              <div className="security-text">
                <p><strong>IMPORTANT NOTICE:</strong> This e-Visa is a valid travel document issued by the Federal Democratic Republic of Ethiopia. It must be presented along with a valid passport at the point of entry. Any alteration to this document renders it null and void.</p>
                <div className="digital-signature">
                  <div className="sig-line"></div>
                  <span>DIGITALLY SIGNED BY DIRECTOR GENERAL OF ICS</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="security-microtext">
          VALID FOR ENTRY VIA AUTHORIZED AIRPORTS AND LAND BORDERS ONLY. 
          ISSUED BY THE FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA. 
          SECURITY HASH: {reference.slice(0, 8)}-{Date.now().toString(16)}
        </div>
      </div>
    </div>
  );
};

export default VisaDocument;
