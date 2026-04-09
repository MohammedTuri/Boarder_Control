import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';

export default function Watchlists() {
    const [watchlists, setWatchlists] = useState([]);
    const [passport, setPassport] = useState('');
    const [notes, setNotes] = useState('');

    const loadWatchlists = async () => {
        try {
            const res = await axios.get('/api/watchlists');
            setWatchlists(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadWatchlists();
    }, []);

    const handleAdd = async () => {
        if (!passport) return;
        try {
            await axios.post('/api/watchlists', { passport_number: passport.toUpperCase(), notes: notes || 'Flagged for review' });
            setPassport('');
            setNotes('');
            loadWatchlists();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (num) => {
        try {
            await axios.delete(`/api/watchlists/${num}`);
            loadWatchlists();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <section className="view-section active">
            <div className="page-header">
                <h1>Watchlists & Alerts</h1>
                <p>Manage flagged individuals and active notices</p>
            </div>
            
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div className="stat-card" style={{ borderLeft: '4px solid var(--alert-red)' }}>
                    <div className="stat-icon watchlists"><AlertTriangle /></div>
                    <div className="stat-details">
                        <h3>Active Watchlist Entries</h3>
                        <h2>{watchlists.length}</h2>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="form-group" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                            <input 
                                type="text" 
                                placeholder="Passport No." 
                                value={passport} onChange={e => setPassport(e.target.value)} 
                                style={{ flex: 1 }}
                            />
                            <button className="btn-primary" onClick={handleAdd}>
                                <Plus size={18} /> Add Alert
                            </button>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Optional Notes/Reason" 
                            value={notes} onChange={e => setNotes(e.target.value)} 
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>
            </div>

            <div className="table-card">
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Passport No.</th>
                                <th>Notes</th>
                                <th>Date Added</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {watchlists.map(w => (
                                <tr key={w.passport_number}>
                                    <td><strong>{w.passport_number}</strong></td>
                                    <td>{w.notes}</td>
                                    <td>{new Date(w.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <button className="icon-btn" style={{ color: 'var(--alert-red)' }} onClick={() => handleDelete(w.passport_number)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {watchlists.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center' }}>No active watchlist entries.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
