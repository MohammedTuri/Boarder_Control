import { useState, useEffect } from 'react';
import axios from 'axios';
import { LogIn, LogOut, ShieldAlert, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const [crossings, setCrossings] = useState([]);
    const [stats, setStats] = useState({ entries: 0, exits: 0, flags: 0 });

    const chartData = [
      { time: '00:00', entries: 120, exits: 80 },
      { time: '04:00', entries: 85, exits: 40 },
      { time: '08:00', entries: 350, exits: 220 },
      { time: '12:00', entries: 410, exits: 390 },
      { time: '16:00', entries: 290, exits: 450 },
      { time: '20:00', entries: 150, exits: 200 },
      { time: '24:00', entries: 90, exits: 60 },
    ];

    const exportToCSV = () => {
        const headers = ['Traveler Name', 'Passport No', 'Direction', 'Checkpoint', 'Time', 'Status'];
        const rows = crossings.map(c => [
            c.traveler_name,
            c.passport_number,
            c.direction,
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
        link.setAttribute("download", `recent_crossings.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const res = await axios.get('/api/crossings?limit=5');
                const data = res.data;
                setCrossings(data);
                
                // derive stats from all data or just endpoint
                // Since our API currently doesn't have a stats endpoint, we'll mock the top stats
                // Or calculate from full history if we fetch it. For prototype, we will just use mock counts
                setStats({ entries: 1245, exits: 890, flags: 3 });
            } catch (err) {
                console.error("Failed to load dashboard Data", err);
            }
        }
        fetchDashboard();
    }, []);

    return (
        <section className="view-section active">
            <div className="page-header">
                <h1>Command Center overview</h1>
                <p>Live metrics from all land portals</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon arrivals"><LogIn /></div>
                    <div className="stat-details">
                        <h3>Total Entries</h3>
                        <h2>{stats.entries.toLocaleString()}</h2>
                        <p className="trend up"><TrendingUp size={14} /> +12% vs yesterday</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon departures"><LogOut /></div>
                    <div className="stat-details">
                        <h3>Total Exits</h3>
                        <h2>{stats.exits.toLocaleString()}</h2>
                        <p className="trend up"><TrendingUp size={14} /> +5% vs yesterday</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon watchlists"><ShieldAlert /></div>
                    <div className="stat-details">
                        <h3>Watchlist Matches</h3>
                        <h2>{stats.flags}</h2>
                        <p className="trend down"><TrendingDown size={14} /> -1 vs yesterday</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-tables" style={{ marginBottom: '40px' }}>
                <div className="table-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>Daily Crossing Volume (Real-time)</h3>
                    </div>
                    <div style={{ width: '100%', height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorExits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickMargin={10} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} />
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-glass-heavy)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff' }} />
                                <Area type="monotone" dataKey="entries" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorEntries)" name="Entries" />
                                <Area type="monotone" dataKey="exits" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorExits)" name="Exits" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="dashboard-tables">
                <div className="table-card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>Recent Crossings</h3>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-secondary" onClick={exportToCSV} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                <Download size={16} /> Export CSV
                            </button>
                            <button className="btn-secondary" style={{ cursor: 'pointer' }}>View All</button>
                        </div>
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
                                {crossings.length === 0 ? (
                                    <tr><td colSpan="6" style={{textAlign:'center'}}>No recent activity</td></tr>
                                ) : (
                                    crossings.map(c => (
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
                                            <td>{c.direction}</td>
                                            <td>{c.checkpoint}</td>
                                            <td>{new Date(c.timestamp).toLocaleString()}</td>
                                            <td>
                                                <span className={`status-badge ${c.status === 'entry' ? 'entry' : c.status === 'exit' ? 'exit' : 'flagged'}`}>
                                                    {c.status.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}
