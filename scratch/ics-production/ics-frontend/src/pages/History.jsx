import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Download } from 'lucide-react';

export default function History() {
    const [history, setHistory] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        async function fetchHistory() {
            try {
                // Fetch up to 100 for the log
                const res = await axios.get('/api/crossings?limit=100');
                setHistory(res.data);
            } catch (err) {
                console.error("Failed to load history", err);
            }
        }
        fetchHistory();
    }, []);

    const filteredHistory = history.filter(c => 
        c.passport_number.toLowerCase().includes(search.toLowerCase()) ||
        c.traveler_name.toLowerCase().includes(search.toLowerCase())
    );

    const exportToCSV = () => {
        const headers = ['Traveler Name', 'Passport No', 'Direction', 'Checkpoint', 'Time', 'Status'];
        const rows = filteredHistory.map(c => [
            c.traveler_name,
            c.passport_number,
            c.direction === 'entry' ? 'Entry' : c.direction === 'exit' ? 'Exit' : c.direction,
            c.checkpoint,
            new Date(c.timestamp).toLocaleString().replace(/,/g, ''),
            c.status.toUpperCase()
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(',') + "\n"
            + rows.map(e => e.join(',')).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `border_crossings_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <section className="view-section active">
            <div className="page-header">
                <h1>Timeline Log</h1>
                <p>Complete historical log of all border crossings</p>
            </div>
            <div className="table-card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div className="search-bar" style={{ width: '100%', maxWidth: '400px', margin: 0, border: '1px solid var(--border-light)' }}>
                        <Search size={18} color="var(--text-muted)" />
                        <input 
                            type="text" 
                            placeholder="Search history by Passport or Name..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="primary-btn" onClick={exportToCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1rem', cursor: 'pointer' }}>
                        <Download size={18} />
                        Export CSV
                    </button>
                </div>
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Photo</th>
                                <th>Traveler</th>
                                <th>Passport No.</th>
                                <th>Direction</th>
                                <th>Checkpoint</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.map(c => (
                                <tr key={c.id}>
                                    <td>
                                        {c.photo_url ? (
                                            <img src={c.photo_url} alt="portrait" className="traveler-thumb" />
                                        ) : (
                                            <div className="traveler-thumb fallback">N/A</div>
                                        )}
                                    </td>
                                    <td><div style={{fontWeight: 600, color: 'var(--text-main)'}}>{c.traveler_name}</div></td>
                                    <td style={{fontFamily: 'monospace', color: 'var(--text-muted)'}}>{c.passport_number}</td>
                                    <td>{c.direction === 'entry' ? 'Entry' : c.direction === 'exit' ? 'Exit' : c.direction}</td>
                                    <td>{c.checkpoint}</td>
                                    <td>{new Date(c.timestamp).toLocaleString()}</td>
                                    <td>
                                        <span className={`status-badge ${c.status === 'entry' ? 'entry' : c.status === 'exit' ? 'exit' : 'flagged'}`}>
                                            {c.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
