import React from 'react';
import { ShieldCheck, MapPin, Bell, Zap, RefreshCcw } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import './Settings.css';

const Settings = () => {
  const { stationName, alertLevel, enableNotifications, refreshInterval, updateSettings } = useSettings();

  return (
    <div className="settings-container">
      <h1 className="page-title">Command Configuration</h1>
      
      <div className="settings-grid">
        {/* Station Identity */}
        <div className="glass-panel settings-card">
          <div className="card-header">
            <MapPin size={20} className="header-icon" />
            <h2>Station Identity</h2>
          </div>
          <div className="card-body">
            <p className="muted text-sm">Configure the operational name of the current Port of Entry.</p>
            <div className="input-block">
              <label>Current Deployment Station</label>
              <input 
                type="text" 
                className="sys-input" 
                value={stationName} 
                onChange={(e) => updateSettings({ stationName: e.target.value })}
                placeholder="e.g. Addis Ababa HQ"
              />
            </div>
          </div>
        </div>

        {/* Operational Alert Level */}
        <div className="glass-panel settings-card">
          <div className="card-header">
            <Zap size={20} className="header-icon" />
            <h2>Security Alert Level</h2>
          </div>
          <div className="card-body">
            <p className="muted text-sm">Escalate station readiness status. This affects visual monitoring across all consoles.</p>
            <div className="input-block">
              <label>Current DEFCON Status</label>
              <select 
                className="sys-input" 
                value={alertLevel} 
                onChange={(e) => updateSettings({ alertLevel: e.target.value })}
              >
                <option value="Normal">Normal Operations</option>
                <option value="Elevated">Elevated Awareness</option>
                <option value="High">High Security Alert</option>
                <option value="Critical">Critical Threat Response</option>
              </select>
            </div>
            <div className={`status-preview ${alertLevel.toLowerCase()}`}>
              <div className="pulse-dot"></div>
              <span>CURRENT STATUS: {alertLevel.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* System Preferences */}
        <div className="glass-panel settings-card">
          <div className="card-header">
            <Bell size={20} className="header-icon" />
            <h2>Telemetry & UI</h2>
          </div>
          <div className="card-body">
            <div className="toggle-row">
              <div className="toggle-info">
                <strong>Real-time Security Alerts</strong>
                <p className="muted text-xs">Enable high-priority matching notifications in the header.</p>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={enableNotifications} 
                  onChange={(e) => updateSettings({ enableNotifications: e.target.checked })} 
                />
                <span className="slider round"></span>
              </label>
            </div>
            
            <div className="input-block" style={{marginTop: '24px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                <label>Data Refresh Interval</label>
                <span className="text-xs accent-blue">{refreshInterval} seconds</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="120" 
                step="5"
                value={refreshInterval} 
                onChange={(e) => updateSettings({ refreshInterval: parseInt(e.target.value) })}
                className="sys-range"
              />
            </div>
          </div>
        </div>

        <div className="glass-panel settings-card muted-card">
          <div className="card-header">
            <ShieldCheck size={20} className="header-icon" />
            <h2>Security Policy</h2>
          </div>
          <div className="card-body">
            <p className="text-sm muted" style={{lineHeight: '1.6'}}>
              Industrial configuration changes are persistent and affect all active agents at this station. 
              Always ensure the **Station Identity** is correctly registered during border transfer.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .card-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
        .status-preview { margin-top: 10px; padding: 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 10px; }
        .status-preview.normal { background: rgba(16, 185, 129, 0.1); color: var(--accent-emerald); }
        .status-preview.elevated { background: rgba(59, 130, 246, 0.1); color: var(--accent-blue); }
        .status-preview.high { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .status-preview.critical { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
        .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; animation: statusPulse 1.5s infinite; }
        @keyframes statusPulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        
        .toggle-row { display: flex; justify-content: space-between; align-items: center; }
        .toggle-info strong { font-size: 0.9rem; display: block; margin-bottom: 2px; }
        
        .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--bg-dark); transition: .4s; border: 1px solid var(--glass-border); }
        .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: var(--text-muted); transition: .4s; }
        input:checked + .slider { background-color: var(--accent-blue); border-color: var(--accent-blue); }
        input:checked + .slider:before { transform: translateX(20px); background-color: white; }
        .slider.round { border-radius: 24px; }
        .slider.round:before { border-radius: 50%; }

        .sys-range { width: 100%; height: 6px; background: var(--bg-dark); border-radius: 5px; appearance: none; outline: none; }
        .sys-range::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; background: var(--accent-blue); cursor: pointer; border-radius: 50%; }
      `}</style>
    </div>
  );
};
export default Settings;
