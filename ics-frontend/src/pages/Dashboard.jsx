import React, { useState, useEffect } from 'react';
import { Users, UserCheck, AlertTriangle, ArrowUpRight, ArrowDownRight, Activity, Loader2, MapPin, ClipboardList, Shield, Globe, Plane, Cpu, Wifi, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { API_BASE_URL } from '../config';
import './Dashboard.css';

const mockChartData = [
  { time: '00:00', crossings: 120 },
  { time: '04:00', crossings: 85 },
  { time: '08:00', crossings: 450 },
  { time: '12:00', crossings: 580 },
  { time: '16:00', crossings: 490 },
  { time: '20:00', crossings: 290 },
  { time: '23:59', crossings: 150 },
];

const StatCard = ({ title, value, icon: Icon, trend, trendUp, colorClass, loading }) => (
  <div className={`glass-panel stat-card ${colorClass}`}>
    <div className="stat-header">
      <span className="stat-title">{title}</span>
      <div className="icon-wrapper">
        <Icon size={20} />
      </div>
    </div>
    <div className="stat-value">
      {loading ? <Loader2 className="spinner" size={24} /> : value}
    </div>
    <div className={`stat-trend ${trendUp ? 'positive' : 'negative'}`}>
      {trendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
      <span>{trend} vs last 24h</span>
    </div>
  </div>
);

const Dashboard = () => {
  const { authFetch } = useAuth();
  const { stationName } = useSettings();
  const [stats, setStats] = useState({ total: 0, today: 0, watchlist: 0, alerts: 0, pendingApplications: 0, totalNotifications: 0 });
  const [chartData, setChartData] = useState([]);
  const [stationData, setStationData] = useState([]);
  const [missionFeed, setMissionFeed] = useState([]);
  const [integrityStats, setIntegrityStats] = useState({ identityIntegrity: 0, biometricRate: 0, watchlistAccuracy: 0, avgProcessingTime: 0, systemAvailability: 100 });
  const [hardwareStatus, setHardwareStatus] = useState({ doc_reader: 'Online', bio_camera: 'Online', sys_link: 'Priority-1' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [statsResp, crossingsResp, feedResp, analyticsResp] = await Promise.all([
          authFetch('http://localhost:5000/api/stats'),
          authFetch('http://localhost:5000/api/crossings'),
          authFetch('http://localhost:5000/api/mission-feed'),
          authFetch(`http://localhost:5000/api/reports/stats?startDate=${new Date(Date.now() - 86400000).toISOString().split('T')[0]}`)
        ]);
        
        if (statsResp.ok) setStats(await statsResp.json());
        
        if (crossingsResp.ok) {
          const crossings = await crossingsResp.json();
          processChartData(crossings);
        }

        if (feedResp.ok) {
          setMissionFeed(await feedResp.json());
        }

        if (analyticsResp.ok) {
          const analytics = await analyticsResp.json();
          setStationData(analytics.stations || []);
        }

        const [integrityResp, hwResp] = await Promise.all([
          authFetch('http://localhost:5000/api/stats/integrity'),
          authFetch('http://localhost:5000/api/hardware/status')
        ]);
        if (integrityResp.ok) setIntegrityStats(await integrityResp.json());
        if (hwResp.ok) setHardwareStatus(await hwResp.json());
      } catch (err) {
        console.error('Operational data failure:', err);
      } finally {
        setLoading(false);
      }
    };
    loadOverview();
    const interval = setInterval(loadOverview, 30000);
    return () => clearInterval(interval);
  }, []);

  const processChartData = (crossings) => {
    const buckets = {};
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 3600000);
      const label = d.getHours() + ':00';
      buckets[label] = 0;
    }

    crossings.forEach(c => {
      const cDate = new Date(c.created_at);
      if (now.getTime() - cDate.getTime() < 24 * 3600000) {
        const label = cDate.getHours() + ':00';
        if (buckets[label] !== undefined) buckets[label]++;
      }
    });

    const formatted = Object.keys(buckets).map(time => ({
      time,
      crossings: buckets[time]
    }));
    setChartData(formatted);
  };

  return (
    <div className="dashboard-container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px'}}>
        <div>
          <h1 className="page-title" style={{marginBottom: '4px'}}>Command Overview</h1>
          <p className="muted text-sm" style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
            <MapPin size={14} className="accent-blue" />
            Active Deployment: <strong>{stationName}</strong>
          </p>
        </div>
        <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
           <div className={`sec-level-box ${stats.alerts > 10 ? 'delta' : stats.alerts > 5 ? 'charlie' : 'bravo'}`} style={{
             padding: '12px 24px',
             borderRadius: '12px',
             border: '1px solid rgba(255,255,255,0.1)',
             background: 'rgba(0,0,0,0.3)',
             textAlign: 'center'
           }}>
             <span className="muted text-xs block font-bold" style={{display: 'block', fontSize: '0.65rem', marginBottom: '4px'}}>MISSION SEC-LEVEL</span>
             <div style={{fontSize: '1.4rem', fontWeight: '900', letterSpacing: '2px', color: stats.alerts > 10 ? '#ef4444' : stats.alerts > 5 ? '#f59e0b' : '#3b82f6'}}>
               {stats.alerts > 10 ? 'DELTA' : stats.alerts > 5 ? 'CHARLIE' : 'BRAVO'}
             </div>
           </div>
           <div className="text-right">
             <Activity size={14} className="pulse" /> LIVE DATABASE CONNECTED
             <div className="text-xs muted" style={{marginTop: '4px'}}>Uptime: 142h 12m</div>
           </div>
        </div>
      </div>
      
      <div className="stats-grid">
        <StatCard title="Total Processed" value={(stats.total || 0).toLocaleString()} icon={Users} trend="+12.5%" trendUp={true} colorClass="emerald" loading={loading} />
        <StatCard title="Today's Entries" value={(stats.today || 0).toLocaleString()} icon={UserCheck} trend="+8.2%" trendUp={true} colorClass="blue" loading={loading} />
        <StatCard title="Mission Dispatches" value={(stats.totalNotifications || 0).toLocaleString()} icon={Globe} trend="Automated" trendUp={true} colorClass="blue" loading={loading} />
        <StatCard title="Pending Visas" value={(stats.pendingApplications || 0).toLocaleString()} icon={ClipboardList} trend={`${stats.pendingApplications || 0} awaiting`} trendUp={stats.pendingApplications > 0} colorClass="gold" loading={loading} />
        <StatCard title="Derogatory Matches" value={(stats.alerts || 0).toLocaleString()} icon={AlertTriangle} trend="-2.4%" trendUp={false} colorClass="danger" loading={loading} />
      </div>

      <div className="dashboard-content" style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px'}}>
        <div className="glass-panel chart-section">
          <div className="section-header">
            <h3>Crossing Volume (Last 24h)</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCrossings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-emerald)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--accent-emerald)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Area type="monotone" dataKey="crossings" stroke="var(--accent-emerald)" strokeWidth={3} fillOpacity={1} fill="url(#colorCrossings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel activity-feed">
          <div className="section-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h3><Activity size={18} className="accent-blue" /> Mission Integrity Feed</h3>
            <span className="badge text-xs" style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981'}}>ENCRYPTED LINK</span>
          </div>
          <div className="mini-feed">
            {missionFeed.map((event, idx) => {
              const EventIcon = event.type === 'AUDIT' ? Shield : event.type === 'NOTIFY' ? Globe : event.type === 'CROSS' ? Plane : Zap;
              const isAlert = event.details === 'Flagged' || event.title.includes('CONFLICT');
              return (
                <div key={idx} className={`feed-item type-${event.type.toLowerCase()} ${isAlert ? 'item-alert' : ''}`}>
                  <div className={`event-icon-box ${isAlert ? 'alert-bg' : ''}`}>
                    <EventIcon size={16} />
                  </div>
                  <div className="item-details">
                    <div className="item-main">
                      <strong style={isAlert ? {color: '#ef4444'} : {}}>{event.title}</strong>
                      <span className="item-time">{new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="item-meta">
                      <span className="item-details-text">{event.details}</span>
                      <span className="item-user">{event.user_id}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {missionFeed.length === 0 && <p className="muted" style={{textAlign: 'center', padding: '20px'}}>Monitoring operational frequency...</p>}
          </div>
        </div>
      </div>

      <div className="dashboard-content secondary-grid" style={{display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px', marginTop: '24px'}}>
        <div className="glass-panel hardware-telemetry">
           <div className="section-header">
            <h3><Cpu size={18} className="accent-blue" /> Hardware Telemetry</h3>
          </div>
          <div className="telemetry-grid" style={{marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
             <div className="telemetry-item">
                <div className="tel-main">
                   <div className="tel-icon"><Zap size={14} /></div>
                   <div className="tel-info">
                      <span className="muted text-xs">Document Reader</span>
                      <div className="font-bold">{hardwareStatus.doc_reader}</div>
                   </div>
                </div>
                <div style={{textAlign: 'right'}}>
                   <div className={`status-led ${hardwareStatus.doc_reader === 'Online' ? 'active' : ''}`}></div>
                   <div className="text-xs muted" style={{fontSize: '0.6rem'}}>0.8s scan</div>
                </div>
             </div>
             <div className="telemetry-item">
                <div className="tel-main">
                   <div className="tel-icon"><Wifi size={14} /></div>
                   <div className="tel-info">
                      <span className="muted text-xs">Biometric Camera</span>
                      <div className="font-bold">{hardwareStatus.bio_camera}</div>
                   </div>
                </div>
                <div style={{textAlign: 'right'}}>
                   <div className={`status-led ${hardwareStatus.bio_camera === 'Online' ? 'active' : ''}`}></div>
                   <div className="text-xs muted" style={{fontSize: '0.6rem'}}>48fps</div>
                </div>
             </div>
             <div className="telemetry-item">
                <div className="tel-main">
                   <div className="tel-icon"><Globe size={14} /></div>
                   <div className="tel-info">
                      <span className="muted text-xs">National System Link</span>
                      <div className="font-bold">{hardwareStatus.sys_link}</div>
                   </div>
                </div>
                <div style={{textAlign: 'right'}}>
                   <div className="status-led active"></div>
                   <div className="text-xs muted" style={{fontSize: '0.6rem'}}>12ms</div>
                </div>
             </div>
          </div>
          <div className="calibration-info" style={{marginTop: '20px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border-light)'}}>
             <div className="text-xs muted" style={{display: 'flex', justifyContent: 'space-between'}}>
                <span>Last Calibration:</span>
                <span>{new Date().toLocaleTimeString()}</span>
             </div>
             <div className="progress-bar-bg" style={{height: '2px', marginTop: '8px'}}><div className="progress-bar-fill pulse" style={{width: '100%', background: 'var(--accent-emerald)'}}></div></div>
          </div>
        </div>
        <div className="glass-panel station-chart-section">
          <div className="section-header">
            <h3>Station Activity (Last 24h)</h3>
          </div>
          <div style={{height: '300px', width: '100%', marginTop: '20px'}}>
            <ResponsiveContainer>
              <BarChart data={stationData} layout="vertical" margin={{ left: 40, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="station" type="category" stroke="var(--text-muted)" fontSize={11} width={100} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '8px'}} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                  {stationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--accent-blue)' : 'var(--glass-accent)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel metrics-summary">
           <div className="section-header">
            <h3>Operational Integrity Metrics</h3>
          </div>
          <div className="metrics-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '20px'}}>
             <div className="metric-box">
                <span className="muted text-xs">Identity Integrity</span>
                <div className="text-xl font-bold">{integrityStats.identityIntegrity}%</div>
                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{width: `${integrityStats.identityIntegrity}%`, background: 'var(--accent-emerald)'}}></div></div>
             </div>
             <div className="metric-box">
                <span className="muted text-xs">Biometric Verification Rate</span>
                <div className="text-xl font-bold">{integrityStats.biometricRate}%</div>
                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{width: `${integrityStats.biometricRate}%`}}></div></div>
             </div>
             <div className="metric-box">
                <span className="muted text-xs">Watchlist Hit Accuracy</span>
                <div className="text-xl font-bold">{integrityStats.watchlistAccuracy}%</div>
                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{width: `${integrityStats.watchlistAccuracy}%`}}></div></div>
             </div>
             <div className="metric-box">
                <span className="muted text-xs">Average Processing Time</span>
                <div className="text-xl font-bold">{integrityStats.avgProcessingTime}s</div>
                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{width: '70%', background: 'var(--accent-emerald)'}}></div></div>
             </div>
             <div className="metric-box">
                <span className="muted text-xs">System Availability</span>
                <div className="text-xl font-bold">{integrityStats.systemAvailability}%</div>
                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{width: '100%', background: 'var(--accent-emerald)'}}></div></div>
             </div>
             <div className="metric-box" style={{background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)'}}>
                <span className="muted text-xs">Mission Uptime</span>
                <div className="text-xl font-bold">99.98%</div>
                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{width: '99.9%'}}></div></div>
             </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .activity-feed { height: 400px; display: flex; flex-direction: column; }
        .mini-feed { flex: 1; overflow-y: auto; padding-right: 8px; }
        .feed-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--glass-border-light); }
        .feed-item:last-child { border: none; }
        .status-marker { width: 4px; border-radius: 4px; flex-shrink: 0; }
        .status-marker.cleared { background: #10b981; }
        .status-marker.flagged { background: #ef4444; }
        .item-details { flex: 1; }
        .item-main { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.9rem; }
        .item-type { font-size: 0.75rem; background: var(--glass-accent); padding: 2px 6px; borderRadius: 4px; }
        .item-meta { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); font-family: monospace; }
        .spinner { animation: spin 1s linear infinite; }
        
        .progress-bar-bg { height: 4px; background: var(--glass-border-light); border-radius: 2px; margin-top: 8px; overflow: hidden; }
        .progress-bar-fill { height: 100%; background: var(--accent-blue); border-radius: 2px; }
        .metric-box { padding: 16px; border-radius: 8px; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border-light); }
        
        .telemetry-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid var(--glass-border-light); }
        .tel-main { display: flex; gap: 12px; align-items: center; }
        .tel-icon { color: var(--accent-blue); }
        .status-led { width: 8px; height: 8px; border-radius: 50%; background: #444; }
        .status-led.active { background: #10b981; box-shadow: 0 0 8px #10b981; }
        
        .item-alert { background: rgba(239, 68, 68, 0.05); }
        .alert-bg { background: rgba(239, 68, 68, 0.2) !important; color: #ef4444 !important; }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-soft { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
        .pulse { animation: pulse-soft 2s infinite; }
      `}</style>
    </div>
  );
};

export default Dashboard;
