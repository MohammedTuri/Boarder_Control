import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { AlertCircle, X, ShieldCheck, Upload, Camera } from 'lucide-react';

export default function Processing() {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        passport_number: '',
        given_names: '',
        surname: '',
        nationality: 'ETH',
        direction: 'entry',
        checkpoint: user?.checkpoint || 'Moyale'
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [alert, setAlert] = useState(null);
    const [success, setSuccess] = useState(false);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlert(null);
        setSuccess(false);

        const payloadData = new FormData();
        payloadData.append('traveler_name', `${formData.given_names} ${formData.surname}`);
        payloadData.append('passport_number', formData.passport_number);
        payloadData.append('direction', formData.direction);
        payloadData.append('checkpoint', formData.checkpoint);
        payloadData.append('status', formData.direction);
        if (photoFile) {
            payloadData.append('photo', photoFile);
        }

        try {
            await axios.post('/api/crossings', payloadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(true);
            setFormData({ ...formData, passport_number: '', given_names: '', surname: '' });
            setPhotoFile(null);
            setPhotoPreview(null);
        } catch (error) {
            if (error.response?.status === 403) {
                setAlert(error.response.data);
                payloadData.set('status', 'denied');
                await axios.post('/api/crossings', payloadData, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(() => {});
            } else {
                setAlert({ error: 'System Error', notes: 'Unable to process traveler at this time.' });
            }
        }
    };

    return (
        <section className="view-section active">
            <div className="page-header">
                <h1>Process Traveler</h1>
                <p>Scan MRZ or enter passport details manually</p>
            </div>

            {alert && (
                <div className="alert-banner" style={{ display: 'flex' }}>
                    <div className="alert-content">
                        <AlertCircle size={28} color="var(--alert-red)" />
                        <div>
                            <h4>WATCHLIST MATCH DETECTED</h4>
                            <p>{alert.notes}</p>
                            <p style={{ marginTop: '4px' }}>This passport number ({formData.passport_number}) matches an active notice. Detain individual immediately.</p>
                        </div>
                    </div>
                </div>
            )}

            {success && (
                <div className="alert-banner" style={{ display: 'flex', backgroundColor: 'var(--safe-green-bg)', borderColor: 'var(--safe-green)', animation: 'none' }}>
                    <div className="alert-content">
                        <ShieldCheck size={28} color="var(--safe-green)" />
                        <div>
                            <h4 style={{ color: 'var(--safe-green)' }}>CLEARANCE GRANTED</h4>
                            <p style={{ color: '#065f46' }}>Traveler has been processed successfully.</p>
                        </div>
                    </div>
                    <button onClick={() => setSuccess(false)} className="close-alert" style={{ color: 'var(--safe-green)' }}><X /></button>
                </div>
            )}

            <div className="processing-container">
                <div className="form-card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-row processing-top-row">
                            <div className="form-group photo-group">
                                <label>Traveler Photo <span className="req">*</span></label>
                                <div className="photo-dropzone glass-panel" onClick={() => document.getElementById('photoInput').click()}>
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Traveler Preview" className="preview-image" />
                                    ) : (
                                        <div className="upload-prompt">
                                            <Camera size={32} />
                                            <span>Capture or Upload</span>
                                        </div>
                                    )}
                                </div>
                                <input type="file" id="photoInput" accept="image/*" className="hidden" onChange={handlePhotoChange} required={!photoPreview} />
                            </div>
                            
                            <div className="right-group-details" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="form-row" style={{ marginBottom: 0 }}>
                                    <div className="form-group">
                                        <label>Passport Number <span className="req">*</span></label>
                                        <input 
                                            type="text" 
                                            required 
                                            placeholder="e.g. EP1234567" 
                                            value={formData.passport_number}
                                            onChange={e => setFormData({...formData, passport_number: e.target.value.toUpperCase()})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Nationality</label>
                                        <select 
                                            value={formData.nationality}
                                            onChange={e => setFormData({...formData, nationality: e.target.value})}
                                        >
                                            <option value="ETH">Ethiopian (ETH)</option>
                                            <option value="KEN">Kenyan (KEN)</option>
                                            <option value="DJI">Djiboutian (DJI)</option>
                                            <option value="SOM">Somali (SOM)</option>
                                            <option value="ERI">Eritrean (ERI)</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row" style={{ marginBottom: 0 }}>
                                    <div className="form-group">
                                        <label>Given Names <span className="req">*</span></label>
                                        <input 
                                            type="text" 
                                            required 
                                            placeholder="First Middle" 
                                            value={formData.given_names}
                                            onChange={e => setFormData({...formData, given_names: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Surname <span className="req">*</span></label>
                                        <input 
                                            type="text" 
                                            required 
                                            placeholder="Last" 
                                            value={formData.surname}
                                            onChange={e => setFormData({...formData, surname: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Checkpoint</label>
                                <select 
                                    value={formData.checkpoint}
                                    onChange={e => setFormData({...formData, checkpoint: e.target.value})}
                                >
                                    <option value="Moyale">Moyale (South)</option>
                                    <option value="Metema">Metema (North-West)</option>
                                    <option value="Galafi">Galafi (East)</option>
                                    <option value="Dewele">Dewele (East)</option>
                                    <option value="Bole Intl">Bole Intl (Addis)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Direction</label>
                                <div className="radio-group">
                                    <label className="radio-btn">
                                        <input 
                                            type="radio" 
                                            name="direction" 
                                            value="entry" 
                                            checked={formData.direction === 'entry'} 
                                            onChange={e => setFormData({...formData, direction: e.target.value})}
                                        /> 
                                        Entry to ETH
                                    </label>
                                    <label className="radio-btn">
                                        <input 
                                            type="radio" 
                                            name="direction" 
                                            value="exit" 
                                            checked={formData.direction === 'exit'}
                                            onChange={e => setFormData({...formData, direction: e.target.value})}
                                        /> 
                                        Exit ETH
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div className="form-actions glass-panel">
                            <button type="button" className="btn-secondary" onClick={() => { setFormData({...formData, passport_number: '', given_names: '', surname: ''}); setPhotoFile(null); setPhotoPreview(null); }}>Clear</button>
                            <button type="submit" className="btn-primary" disabled={alert !== null}><ShieldCheck size={18}/> Authorize Crossing</button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}
