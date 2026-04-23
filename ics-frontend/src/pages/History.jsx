import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Filter, Loader2, Globe, BarChart, ArrowLeft, CheckCircle, XCircle, Clock, ShieldCheck, Download, PieChart as PieChartIcon, Table as TableIcon, TrendingUp, Scan, ShieldAlert } from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, 
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, 
  AreaChart, Area, Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import './History.css';

const REPORT_TEMPLATES = [
  { id: 'crossings', title: 'Daily Crossing Audit', desc: 'Forensic list of traveler entries and exits including watchlist intercepts.', icon: FileText, color: 'rgba(59, 130, 246, 0.1)', iconColor: 'var(--accent-blue)' },
  { id: 'visa_stats', title: 'Visa Statistics Overview', desc: 'Aggregate counts of approved, rejected, and pending visa applications.', icon: BarChart, color: 'rgba(16, 185, 129, 0.1)', iconColor: 'var(--accent-emerald)' },
  { id: 'visa_approved', title: 'Approved Visa Report', desc: 'Full list of approved visa applications within the selected period.', icon: CheckCircle, color: 'rgba(16, 185, 129, 0.1)', iconColor: '#10b981' },
  { id: 'visa_pending', title: 'Pending Visa Report', desc: 'All visa applications currently awaiting officer review and decision.', icon: Clock, color: 'rgba(251, 191, 36, 0.1)', iconColor: '#f59e0b' },
  { id: 'visa_rejected', title: 'Rejected Visa Report', desc: 'Complete record of denied visa applications for compliance auditing.', icon: XCircle, color: 'rgba(239, 68, 68, 0.1)', iconColor: '#ef4444' },
  { id: 'notifications', title: 'Communication Dispatch Log', desc: 'Track all automated mission messages and document notifications sent to travelers.', icon: Globe, color: 'rgba(99, 102, 241, 0.1)', iconColor: 'var(--accent-blue)' },
  { id: 'biometric_audit', title: 'Biometric Integrity Audit', desc: 'Specialized forensic log of all identity conflicts and biometric anomalies.', icon: Scan, color: 'rgba(239, 68, 68, 0.1)', iconColor: '#ef4444' },
];

const History = () => {
  const { authFetch } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [reportType, setReportType] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'analytics'
  const [exporting, setExporting] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];
  const [filters, setFilters] = useState({ 
    start: today, 
    end: today, 
    passport: '', 
    nationality: '', 
    entryPoint: '', 
    purpose: '', 
    crossingType: '' 
  });

  const currentTemplate = REPORT_TEMPLATES.find(t => t.id === reportType);

  const generateReport = useCallback(async (e = null) => {
    if (e) e.preventDefault();
    if (!reportType) return; // Prevent calls if no report selected
    setLoading(true);
    try {
      if (reportType === 'visa_stats') {
        const query = new URLSearchParams({ startDate: filters.start, endDate: filters.end, nationality: filters.nationality }).toString();
        const resp = await authFetch(`/api/reports/stats?${query}`);
        if (resp.ok) setResults(await resp.json());
      } else if (reportType === 'crossings') {
        const query = new URLSearchParams({ startDate: filters.start, endDate: filters.end, passport: filters.passport, nationality: filters.nationality, type: filters.crossingType }).toString();
        const [listResp, statsResp] = await Promise.all([
          authFetch(`/api/crossings?${query}`),
          authFetch(`/api/reports/stats?startDate=${filters.start}&endDate=${filters.end}&nationality=${filters.nationality}`)
        ]);
        if (listResp.ok && statsResp.ok) {
          const list = await listResp.json();
          const stats = await statsResp.json();
          setResults({ data: list, trends: stats.trends, stations: stats.stations });
        }
      } else if (reportType === 'notifications') {
        const query = new URLSearchParams({ startDate: filters.start, endDate: filters.end }).toString();
        const resp = await authFetch(`/api/reports/notifications?${query}`);
        if (resp.ok) setResults(await resp.json());
      } else if (reportType === 'biometric_audit') {
        const query = new URLSearchParams({ startDate: filters.start, endDate: filters.end, nationality: filters.nationality }).toString();
        const resp = await authFetch(`/api/reports/biometric?${query}`);
        if (resp.ok) setResults(await resp.json());
      } else {
        const statusMap = { visa_approved: 'Approved', visa_pending: 'Pending', visa_rejected: 'Rejected' };
        const query = new URLSearchParams({ startDate: filters.start, endDate: filters.end, status: statusMap[reportType], nationality: filters.nationality, purpose: filters.purpose }).toString();
        const resp = await authFetch(`/api/reports/applications?${query}`);
        if (resp.ok) setResults(await resp.json());
      }
    } catch (err) {
      console.error('Report generation failed:', err);
    } finally {
      setLoading(false);
    }
  }, [reportType, filters, authFetch]);

  const backToCatalog = () => {
    setSearchParams({});
    setReportType(null);
    setResults(null);
  };

  // Read report type from URL query param and auto-trigger
  useEffect(() => {
    const report = searchParams.get('report');
    if (report && REPORT_TEMPLATES.find(t => t.id === report)) {
      setReportType(report);
      setResults(null); // Synch clearing to prevent rendering old data with new template
    } else {
      setReportType(null);
      setResults(null);
    }
  }, [searchParams, generateReport]);

  const exportToCSV = async () => {
    if (!results) return;
    setExporting(true);
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      let rows = [];
      let filename = `ICS_Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;

      if (reportType === 'visa_stats') {
        const headers = ["Category", "Status", "Count"];
        rows.push(headers.join(","));
        results.applications.forEach(a => rows.push(`Visa Application,${a.status},${a.count}`));
        results.nationalities.forEach(n => rows.push(`Origin Audit,${n.nationality},${n.count}`));
      } else {
        const dataToExport = Array.isArray(results) ? results : (results.data || []);
        if (dataToExport.length > 0) {
          const headers = Object.keys(dataToExport[0]);
          rows.push(headers.join(","));
          dataToExport.forEach(obj => {
            rows.push(headers.map(h => `"${obj[h]}"`).join(","));
          });
        }
      }

      csvContent += rows.join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Forensic Audit Log
      await authFetch('/api/audit/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DATA_EXPORT',
          details: { reportType, filename, rowCount: rows.length - 1 }
        })
      });
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const CHART_COLORS = ['#3b82f6', '#10b981', '#fbbf24', '#ef4444', '#8b5cf6', '#ec4899'];

  // --- LANDING VIEW (no report selected) ---
  if (!reportType) {
    return (
      <div className="history-container animate-fade-in">
        <h1 className="page-title">Mission Reporting Hub</h1>
        <div className="glass-panel" style={{padding: '80px', textAlign: 'center'}}>
          <FileText size={56} className="muted" style={{marginBottom: '20px', opacity: 0.4}} />
          <h3>Select a Report</h3>
          <p className="muted" style={{maxWidth: '400px', margin: '12px auto 0'}}>
            Use the <strong>Operational Reports</strong> dropdown in the sidebar to choose a report type and begin generating intelligence.
          </p>
        </div>
      </div>
    );
  }

  // --- Visa Application Table Renderer ---
  const renderVisaTable = (data) => (
    <div className="table-wrapper animate-fade-in">
      <table className="crossing-table">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Applicant</th>
            <th>Passport</th>
            <th>Nationality</th>
            <th>Purpose</th>
            <th>Status</th>
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          {data.map(app => (
            <tr key={app.id}>
              <td className="mono accent-blue text-sm">{app.reference_number}</td>
              <td>{app.first_name} {app.last_name}</td>
              <td className="mono text-sm">{app.passport_number}</td>
              <td className="uppercase">{app.nationality}</td>
              <td>{app.purpose}</td>
              <td><span className={`status-pill ${app.status?.toLowerCase()}`}>{app.status}</span></td>
              <td className="text-xs muted">{new Date(app.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // --- Crossings Table Renderer ---
  const renderCrossingsTable = (data) => (
    <div className="table-wrapper animate-fade-in">
      <table className="crossing-table">
        <thead>
          <tr>
            <th>Traveler</th>
            <th>Document</th>
            <th>Origin</th>
            <th>Type</th>
            <th>Station</th>
            <th>Status</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {data.map(c => (
            <tr key={c.id}>
              <td>{c.full_name}</td>
              <td className="mono accent-blue text-sm">{c.passport}</td>
              <td className="uppercase">{c.nationality}</td>
              <td><span className={`type-tag ${c.type?.toLowerCase()}`}>{c.type}</span></td>
              <td className="text-xs">{c.point_of_entry || 'Legacy'}</td>
              <td><span className={`status-pill ${c.status?.toLowerCase()}`}>{c.status}</span></td>
              <td className="text-xs muted">{new Date(c.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // --- Stats Renderer ---
  const renderStats = (data) => (
    <div className="visa-stats-results animate-fade-in">
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px'}}>
        <div className="stat-pill glass-panel">
          <span className="muted">Approved Visas</span>
          <div className="val text-lg" style={{color: '#10b981'}}>{data?.applications?.find(a => a.status === 'Approved')?.count || 0}</div>
        </div>
        <div className="stat-pill glass-panel">
          <span className="muted">Rejected Visas</span>
          <div className="val text-lg" style={{color: '#ef4444'}}>{data?.applications?.find(a => a.status === 'Rejected')?.count || 0}</div>
        </div>
        <div className="stat-pill glass-panel">
          <span className="muted">Pending Requests</span>
          <div className="val text-lg" style={{color: '#f59e0b'}}>{data?.applications?.find(a => a.status === 'Pending')?.count || 0}</div>
        </div>
      </div>

      <div className="glass-panel" style={{padding: '24px'}}>
        <h3>Nationality Distribution (Top 10)</h3>
        <div style={{marginTop: '20px'}}>
          {data.nationalities && data.nationalities.length > 0 ? data.nationalities.map(n => (
            <div key={n.nationality} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--glass-border-light)'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <Globe size={16} className="muted" />
                <span className="uppercase font-medium">{n.nationality}</span>
              </div>
              <span className="badge">{n.count} Records</span>
            </div>
          )) : <p className="muted text-sm">No nationality data available for this date range.</p>}
        </div>
      </div>
    </div>
  );

  const renderVisualAnalysis = () => {
    if (reportType === 'visa_stats') {
      const pieData = (results?.applications || []).map((a, i) => ({ name: a.status, value: parseInt(a.count) }));
      const barData = (results?.nationalities || []).map(n => ({ country: n.nationality, count: parseInt(n.count) }));
      const areaData = results?.trends?.applications?.map(t => ({ date: new Date(t.date).toLocaleDateString(), volume: parseInt(t.count) })) || [];

      return (
        <div className="analytics-view animate-fade-in">
          <div className="analytics-grid">
            <div className="glass-panel chart-box">
              <h3><TrendingUp size={16} /> Submission Volume Trend</h3>
              <div style={{height: 250, width: '100%', marginTop: 20}}>
                <ResponsiveContainer>
                  <AreaChart data={areaData}>
                    <defs>
                      <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <ReTooltip contentStyle={{background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', color: 'var(--text-main)'}} />
                    <Area type="monotone" dataKey="volume" stroke="var(--accent-blue)" fillOpacity={1} fill="url(#colorVol)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel chart-box">
              <h3><PieChartIcon size={16} /> Status Distribution</h3>
              <div style={{height: 250, width: '100%', marginTop: 20}}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                    </Pie>
                    <ReTooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="analytics-grid" style={{marginTop: 24}}>
            <div className="glass-panel chart-box">
              <h3><Globe size={16} /> Top Origins Intelligence</h3>
              <div style={{height: 300, width: '100%', marginTop: 20}}>
                <ResponsiveContainer>
                  <ReBarChart data={barData} layout="vertical">
                    <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis dataKey="country" type="category" stroke="var(--text-muted)" fontSize={12} width={100} />
                    <ReTooltip />
                    <Bar dataKey="count" fill="var(--accent-emerald)" radius={[0, 4, 4, 0]} />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel chart-box">
              <h3><MapPin size={16} /> Station Distribution</h3>
              <div style={{height: 300, width: '100%', marginTop: 20}}>
                <ResponsiveContainer>
                  <ReBarChart data={(results?.stations || []).map(s => ({ station: s.station, count: parseInt(s.count) }))} layout="vertical">
                    <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis dataKey="station" type="category" stroke="var(--text-muted)" fontSize={12} width={100} />
                    <ReTooltip />
                    <Bar dataKey="count" fill="var(--accent-blue)" radius={[0, 4, 4, 0]} />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Generic Volume Trend for other reports
    const trendData = (reportType === 'crossings' ? results.trends?.crossings : results.trends?.applications) || [];
    const formattedTrend = trendData.map(t => ({ date: new Date(t.date).toLocaleDateString(), volume: parseInt(t.count) }));
    const stationData = (results?.stations || []).map(s => ({ station: s.station, count: parseInt(s.count) }));

    return (
      <div className="analytics-view animate-fade-in">
        <div className="analytics-grid">
          <div className="glass-panel chart-box">
            <h3><TrendingUp size={16} /> Operational Volume Trend</h3>
            <div style={{height: 350, width: '100%', marginTop: 20}}>
              <ResponsiveContainer>
                <AreaChart data={formattedTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <ReTooltip />
                  <Area type="monotone" dataKey="volume" stroke="var(--accent-emerald)" fill="rgba(16, 185, 129, 0.1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel chart-box">
            <h3><MapPin size={16} /> Current Station Distribution</h3>
            <div style={{height: 350, width: '100%', marginTop: 20}}>
              <ResponsiveContainer>
                <ReBarChart data={stationData} layout="vertical">
                  <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis dataKey="station" type="category" stroke="var(--text-muted)" fontSize={12} width={120} />
                  <ReTooltip />
                  <Bar dataKey="count" fill="var(--accent-blue)" radius={[0, 4, 4, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Determine what to render in the results area ---
  const renderResults = () => {
    if (!results) {
      return (
        <div className="empty-state" style={{padding: '80px', textAlign: 'center'}}>
          <Filter size={48} className="muted" style={{marginBottom: '20px'}} />
          <h3>Awaiting Configuration</h3>
          <p className="muted">Configure your report parameters above and click <strong>Generate Report</strong> to retrieve intelligence data.</p>
        </div>
      );
    }

    if (viewMode === 'analytics' && results && (reportType === 'visa_stats' || results.trends)) {
      return renderVisualAnalysis();
    }
    
    // Safety check: ensure results matches reportType structure
    if (reportType === 'visa_stats' && Array.isArray(results)) return <div className="loader-box"><Loader2 className="spinner" /> Synchronizing intelligence data...</div>;

    if (reportType === 'visa_stats') return renderStats(results);
    if (reportType === 'crossings') {
      const data = results.data || results;
      return Array.isArray(data) && data.length > 0 ? renderCrossingsTable(data) : <p className="muted" style={{padding: '40px', textAlign: 'center'}}>No crossing records found for this period.</p>;
    }
    
    if (reportType === 'biometric_audit') {
      const data = results.data || [];
      return (
        <div className="table-wrapper animate-fade-in">
          <table className="crossing-table">
            <thead>
              <tr>
                <th>Traveler</th>
                <th>Passport</th>
                <th>Nationality</th>
                <th>Biometric Status</th>
                <th>Score</th>
                <th>Risk Level</th>
                <th>Identified At</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id} className={item.risk_level === 'Critical' ? 'row-alert' : ''}>
                  <td style={{fontWeight: 600}}>{item.full_name}</td>
                  <td className="mono accent-blue text-sm">{item.passport}</td>
                  <td className="uppercase">{item.nationality}</td>
                  <td>
                    <span className={`status-pill ${item.biometric_status?.toLowerCase().replace(' ', '-')}`}>
                      {item.biometric_status}
                    </span>
                  </td>
                  <td className="mono" style={{color: item.biometric_score < 70 ? '#ef4444' : 'inherit'}}>{item.biometric_score}%</td>
                  <td>
                    <span className={`risk-tag ${item.risk_level?.toLowerCase()}`}>
                      {item.risk_level}
                    </span>
                  </td>
                  <td className="text-xs muted">{new Date(item.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && <p className="muted" style={{padding: '40px', textAlign: 'center'}}>No biometric anomalies detected for this period. Integrity remains within mission parameters.</p>}
        </div>
      );
    }
    
    // Visa status reports
    return Array.isArray(results) && results.length > 0 ? renderVisaTable(results) : <p className="muted" style={{padding: '40px', textAlign: 'center'}}>No visa applications found matching this criteria.</p>;
  };

  // --- REPORT DETAIL VIEW ---
  return (
    <div className="history-container animate-fade-in">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
          <button className="icon-btn" onClick={backToCatalog} style={{background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'var(--text-main)'}}><ArrowLeft size={22} /></button>
          <div>
            <h1 className="page-title" style={{margin: 0}}>{currentTemplate?.title}</h1>
            <span className="badge text-xs accent-blue" style={{marginTop: '4px', display: 'inline-block'}}>REPORT ACTIVE</span>
          </div>
        </div>
        
        {results && (
          <div style={{display: 'flex', gap: '12px'}}>
            <div className="view-toggle glass-panel">
              <button className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')}><TableIcon size={16} /> Data</button>
              <button className={viewMode === 'analytics' ? 'active' : ''} onClick={() => setViewMode('analytics')}><BarChart size={16} /> Intelligence</button>
            </div>
            <button className="sys-btn secondary" onClick={exportToCSV} disabled={exporting}>
              {exporting ? <Loader2 className="spinner" size={16} /> : <Download size={16} />}
              Export CSV
            </button>
          </div>
        )}
      </div>

      <div className="history-grid">
        <div className="glass-panel main-history-table" style={{padding: '24px'}}>
          {loading ? (
            <div style={{padding: '80px', textAlign: 'center'}}>
              <Loader2 className="spinner" size={40} style={{color: 'var(--accent-blue)'}} />
              <p className="muted" style={{marginTop: '16px'}}>Querying secure archives...</p>
            </div>
          ) : renderResults()}
        </div>

        <div className="sidebar-history">
          <div className="glass-panel report-generator" style={{padding: '24px'}}>
            <h3>
              {currentTemplate ? (
                <>
                  <currentTemplate.icon size={18} style={{marginRight: '8px', verticalAlign: 'middle', color: currentTemplate.iconColor}} />
                  {currentTemplate.title}
                </>
              ) : (
                <>
                  <Filter size={18} style={{marginRight: '8px', verticalAlign: 'middle'}} />
                  Report Criteria
                </>
              )}
            </h3>
            <form onSubmit={generateReport} style={{marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
              <div className="input-block">
                <label>{reportType === 'crossings' ? 'Entry Date (From)' : reportType === 'visa_stats' ? 'Report Period (From)' : 'Application Date (From)'}</label>
                <input required type="date" className="sys-input" value={filters.start} onChange={e => setFilters({...filters, start: e.target.value})} />
              </div>
              <div className="input-block">
                <label>{reportType === 'crossings' ? 'Entry Date (To)' : reportType === 'visa_stats' ? 'Report Period (To)' : 'Application Date (To)'}</label>
                <input required type="date" className="sys-input" value={filters.end} onChange={e => setFilters({...filters, end: e.target.value})} />
              </div>

              <div className="input-block">
                <label>Country / Nationality</label>
                <input type="text" className="sys-input uppercase" placeholder="e.g. ETHIOPIAN" value={filters.nationality} onChange={e => setFilters({...filters, nationality: e.target.value})} />
              </div>

              {reportType === 'crossings' && (
                <>
                  <div className="input-block">
                    <label>Passport Number</label>
                    <input type="text" className="sys-input uppercase" placeholder="Optional" value={filters.passport} onChange={e => setFilters({...filters, passport: e.target.value})} />
                  </div>
                  <div className="input-block">
                    <label>Crossing Type</label>
                    <select className="sys-input" value={filters.crossingType} onChange={e => setFilters({...filters, crossingType: e.target.value})}>
                      <option value="">All Types</option>
                      <option value="Entry">Entry</option>
                      <option value="Exit">Exit</option>
                    </select>
                  </div>
                </>
              )}

              {['visa_approved', 'visa_pending', 'visa_rejected'].includes(reportType) && (
                <div className="input-block">
                  <label>Travel Purpose</label>
                  <select className="sys-input" value={filters.purpose} onChange={e => setFilters({...filters, purpose: e.target.value})}>
                    <option value="">All Purposes</option>
                    <option value="Tourism">Tourism</option>
                    <option value="Business">Business</option>
                    <option value="Education">Education</option>
                    <option value="Medical">Medical</option>
                    <option value="Transit">Transit</option>
                    <option value="Work">Work</option>
                    <option value="Diplomatic">Diplomatic</option>
                  </select>
                </div>
              )}

              <button type="submit" className="sys-btn primary" disabled={loading} style={{marginTop: '8px'}}>
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .catalog-card { padding: 28px; border-radius: 16px; cursor: pointer; transition: all 0.3s ease; display: flex; gap: 20px; align-items: start; border: 1px solid var(--glass-border); }
        .catalog-card:hover { transform: translateY(-4px); background: rgba(255,255,255,0.05); border-color: var(--accent-blue); }
        .card-icon { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .card-info h3 { margin: 0 0 6px 0; font-size: 1.1rem; }
        .stat-pill { padding: 20px; border-radius: 12px; text-align: center; }
        .stat-pill .val { font-size: 1.8rem; font-weight: 700; margin-top: 8px; }
        
        .view-toggle { display: flex; padding: 4px; gap: 4px; border-radius: 8px; }
        .view-toggle button { background: transparent; border: none; padding: 6px 12px; color: var(--text-muted); cursor: pointer; border-radius: 6px; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; transition: all 0.2s; }
        .view-toggle button.active { background: var(--glass-accent); color: var(--text-main); }
        .analytics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .chart-box h3 { margin: 0; font-size: 0.9rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px; }
        
        .item-alert { background: rgba(239, 68, 68, 0.05); }
        .alert-bg { background: rgba(239, 68, 68, 0.2) !important; color: #ef4444 !important; }
        
        .row-alert { background: rgba(239, 68, 68, 0.03); }
        .risk-tag { font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
        .risk-tag.critical { background: #ef4444; color: #fff; }
        .risk-tag.elevated { background: #fbbf24; color: #000; }
        .risk-tag.low { background: #10b981; color: #fff; }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default History;
