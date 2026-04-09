import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Trash2, Edit2, Download, Save, X } from 'lucide-react';

export default function Admin() {
    const [agents, setAgents] = useState([]);
    const [form, setForm] = useState({ id: '', name: '', passcode: '', checkpoint: 'Moyale', role: 'agent' });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);

    const loadAgents = async () => {
        try {
            const res = await axios.get('/api/admin/users');
            setAgents(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadAgents();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            if (isEditing) {
                const payload = { name: form.name, checkpoint: form.checkpoint, role: form.role };
                if (form.passcode) payload.passcode = form.passcode;
                await axios.put(`/api/admin/users/${form.id}`, payload);
                setIsEditing(false);
            } else {
                await axios.post('/api/admin/users', form);
            }
            setForm({ id: '', name: '', passcode: '', checkpoint: 'Moyale', role: 'agent' });
            loadAgents();
        } catch (err) {
            setError(err.response?.data?.error || `Failed to ${isEditing ? 'update' : 'create'} agent`);
        }
    };

    const handleEdit = (agent) => {
        setIsEditing(true);
        setForm({ id: agent.id, name: agent.name, passcode: '', checkpoint: agent.checkpoint, role: agent.role });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setForm({ id: '', name: '', passcode: '', checkpoint: 'Moyale', role: 'agent' });
        setError(null);
    };

    const exportToCSV = () => {
        const headers = ['Agent ID', 'Name', 'Checkpoint', 'Role'];
        const rows = agents.map(a => [
            a.id,
            a.name,
            a.checkpoint,
            a.role.toUpperCase()
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(',') + "\n"
            + rows.map(e => e.join(',')).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `border_agents_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to revoke this agent\'s access?')) return;
        try {
            await axios.delete(`/api/admin/users/${id}`);
            loadAgents();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <section className="view-section active">
            <div className="page-header">
                <h1>System Administration</h1>
                <p>Manage border agent credentials and system access</p>
            </div>
            
            <div className="processing-container">
                <div className="form-card" style={{ marginBottom: '32px', maxWidth: '100%' }}>
                    <h3 style={{ marginBottom: '16px' }}>{isEditing ? `Edit Agent: ${form.id}` : 'Register New Agent'}</h3>
                    {error && <p style={{ color: 'var(--alert-red)' }}>{error}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Agent ID <span className="req">*</span></label>
                                <input type="text" required={!isEditing} disabled={isEditing} placeholder="e.g. AGENT_04" value={form.id} onChange={e => setForm({...form, id: e.target.value})} style={isEditing ? { backgroundColor: 'var(--surface-color)', color: 'var(--text-muted)' } : {}} />
                            </div>
                            <div className="form-group">
                                <label>Full Name <span className="req">*</span></label>
                                <input type="text" required placeholder="Name Surname" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Passcode {isEditing ? <span className="text-muted" style={{ fontWeight: 'normal', fontSize: '0.85em' }}>(Leave blank to keep current)</span> : <span className="req">*</span>}</label>
                                <input type="password" required={!isEditing} placeholder="••••••••" value={form.passcode} onChange={e => setForm({...form, passcode: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Assigned Checkpoint</label>
                                <select value={form.checkpoint} onChange={e => setForm({...form, checkpoint: e.target.value})}>
                                    <option value="Moyale">Moyale (South)</option>
                                    <option value="Metema">Metema (North-West)</option>
                                    <option value="Galafi">Galafi (East)</option>
                                    <option value="Bole Intl">Bole Intl (Addis)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                                    <option value="agent">Agent (Standard)</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-actions" style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                            <button type="submit" className="btn-primary">
                                {isEditing ? <><Save size={18} /> Update Agent</> : <><UserPlus size={18} /> Provision Access</>}
                            </button>
                            {isEditing && (
                                <button type="button" className="btn-secondary" onClick={handleCancelEdit} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1rem', background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-color)', borderRadius: '6px', cursor: 'pointer' }}>
                                    <X size={18} /> Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            <div className="table-card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Active Personnel Registry</h3>
                    <button className="primary-btn" onClick={exportToCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1rem', cursor: 'pointer' }}>
                        <Download size={18} />
                        Export CSV
                    </button>
                </div>
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Agent ID</th>
                                <th>Name</th>
                                <th>Checkpoint</th>
                                <th>Role</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {agents.map(a => (
                                <tr key={a.id}>
                                    <td>{a.id}</td>
                                    <td>{a.name}</td>
                                    <td>{a.checkpoint}</td>
                                    <td><span className={`status-badge ${a.role === 'admin' ? 'flagged' : 'entry'}`}>{a.role.toUpperCase()}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="icon-btn" style={{ color: 'var(--text-muted)' }} onClick={() => handleEdit(a)} title="Edit Agent">
                                                <Edit2 size={18} />
                                            </button>
                                            <button className="icon-btn" style={{ color: 'var(--alert-red)' }} onClick={() => handleDelete(a.id)} title="Revoke Access">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
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
