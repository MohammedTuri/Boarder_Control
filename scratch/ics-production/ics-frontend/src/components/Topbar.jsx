import { useState, useEffect } from 'react';
import { Search, Bell, Clock } from 'lucide-react';

export default function Topbar() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="top-nav glass-panel-dark">
            <div className="search-bar glass-input">
                <Search size={18} color="var(--text-muted)" />
                <input type="text" placeholder="Search individual profiles..." />
            </div>
            <div className="nav-actions">
                <div className="live-clock">
                    <Clock size={16} color="var(--accent-gold)" />
                    <span>{time.toISOString().substring(0, 19).replace('T', ' ')} UTC</span>
                </div>
                <button className="icon-btn" style={{ background: 'transparent', border: 'none', position: 'relative', cursor: 'pointer' }}>
                    <Bell size={22} color="var(--text-muted)" />
                    <span className="badge">3</span>
                </button>
                <div className="system-status">
                    <span className="dot"></span>
                    SECURE ACTIVE
                </div>
            </div>
        </header>
    );
}
