// Constants for Storage Keys
const STORAGE_KEY = 'ics_border_control_data';

// Default Data Models
const defaultCrossings = [
    { name: "John Doe", passport: "US0987654", direction: "Entry", checkpoint: "Bole Intl", time: "10:24 AM", status: "entry" },
    { name: "Fatima Ali", passport: "SOM123456", direction: "Exit", checkpoint: "Moyale", time: "09:12 AM", status: "exit" },
    { name: "Bereket T.", passport: "ETH999999", direction: "Entry", checkpoint: "Metema", time: "08:45 AM", status: "entry" }
];

const defaultWatchlist = [
    "REDD4455", // Mock Interpol Red Notice
    "EP666777", // Local Flag
    "XX112233"
];

// Initialize State from LocalStorage or Defaults
let appData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    crossings: defaultCrossings,
    watchlist: defaultWatchlist,
    stats: {
        totalEntries: 1245,
        totalExits: 890,
        totalAlerts: 3
    }
};

// Convenience references
let mockCrossings = appData.crossings;
let mockWatchlist = appData.watchlist;
let totalEntries = appData.stats.totalEntries;
let totalExits = appData.stats.totalExits;
let totalAlerts = appData.stats.totalAlerts;

// Save function to persist data
function saveData() {
    appData.stats = { totalEntries, totalExits, totalAlerts };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

// Authentication Data Model
let agentData = JSON.parse(localStorage.getItem('ics_agents_data')) || {
    'AGENT_01': { name: 'Abebe T.', checkpoint: 'Moyale', pass: 'demo123', role: 'admin' },
    'AGENT_02': { name: 'Sara Y.', checkpoint: 'Bole Intl', pass: 'demo123', role: 'agent' },
    'AGENT_03': { name: 'Dawit S.', checkpoint: 'Metema', pass: 'demo123', role: 'agent' }
};
let currentAgent = null;

function saveAgents() {
    localStorage.setItem('ics_agents_data', JSON.stringify(agentData));
}

// Core UI Logic
function switchTab(tabId) {
    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.remove('active');
        el.classList.add('hidden');
    });
    
    document.querySelectorAll('.nav-links li').forEach(el => {
        el.classList.remove('active');
    });
    
    document.getElementById(`view-${tabId}`).classList.remove('hidden');
    document.getElementById(`view-${tabId}`).classList.add('active');
    event.currentTarget.parentElement.classList.add('active');
}

// Security Check and Population
document.addEventListener('DOMContentLoaded', () => {
    const savedAgent = localStorage.getItem('ics_current_user');
    
    if (savedAgent && agentData[savedAgent]) {
        loginSuccess(savedAgent);
    } else {
        const loginForm = document.getElementById('login-form');
        if(loginForm) loginForm.addEventListener('submit', handleLogin);
    }
});

function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('login-username').value.trim().toUpperCase();
    const pass = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    
    if (agentData[user] && agentData[user].pass === pass) {
        errorEl.classList.add('hidden');
        localStorage.setItem('ics_current_user', user);
        loginSuccess(user);
    } else {
        errorEl.classList.remove('hidden');
    }
}

function loginSuccess(userId) {
    currentAgent = agentData[userId];
    currentAgent.id = userId;
    
    // Admin check
    const adminNav = document.getElementById('nav-admin');
    if (adminNav) {
        if (currentAgent.role === 'admin') adminNav.classList.remove('hidden');
        else adminNav.classList.add('hidden');
    }
    
    // Update Agent User Interface
    document.getElementById('agent-name-display').textContent = `Agent ${currentAgent.name}`;
    document.getElementById('agent-chk-display').textContent = currentAgent.checkpoint;
    
    // Default the form mapping to the assigned checkpoint
    const ppChk = document.getElementById('pp-checkpoint');
    if(ppChk) ppChk.value = currentAgent.checkpoint;
    
    // Switch views
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    
    // Initialize standard logic
    renderTable();
    renderWatchlist();
    renderAdminTable();
    updateDashboardStats();
    
    const processForm = document.getElementById('processing-form');
    if(processForm) {
        processForm.removeEventListener('submit', handleFormSubmit);
        processForm.addEventListener('submit', handleFormSubmit);
    }
}

function logout() {
    localStorage.removeItem('ics_current_user');
    location.reload();
}

function renderTable() {
    const tbody = document.querySelector('#recent-crossings-table tbody');
    const fullTbody = document.querySelector('#full-history-table tbody');
    
    if(tbody) tbody.innerHTML = '';
    if(fullTbody) fullTbody.innerHTML = '';
    
    mockCrossings.forEach(crossing => {
        const tr = document.createElement('tr');
        
        const badgeClass = crossing.status;
        const statusText = crossing.status === 'flagged' ? 'FLAGGED' : crossing.status.toUpperCase();
        
        tr.innerHTML = `
            <td><strong>${crossing.name}</strong></td>
            <td>${crossing.passport}</td>
            <td>${crossing.direction}</td>
            <td>${crossing.checkpoint}</td>
            <td>${crossing.time}</td>
            <td><span class="status-badge ${badgeClass}">${statusText}</span></td>
        `;
        
        if(tbody) tbody.prepend(tr.cloneNode(true));
        if(fullTbody) fullTbody.prepend(tr);
    });
}

function renderWatchlist() {
    const tbody = document.querySelector('#watchlist-table tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    const countEl = document.getElementById('watchlist-count');
    if(countEl) countEl.textContent = mockWatchlist.length;
    
    mockWatchlist.forEach(passport => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${passport}</strong></td>
            <td>Interdict on sight</td>
            <td><button class="btn-secondary" style="color: var(--alert-red); border-color: var(--alert-red); padding: 6px 12px; font-size: 12px;" onclick="removeWatchlist('${passport}')">Remove</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function addWatchlist() {
    const input = document.getElementById('new-watchlist-pp');
    if(!input) return;
    const val = input.value.trim().toUpperCase();
    if(val && !mockWatchlist.includes(val)) {
        mockWatchlist.push(val);
        input.value = '';
        saveData(); // Persist changes
        renderWatchlist();
        showToast('Added to active alerts network', 'error');
    }
}

function removeWatchlist(passport) {
    const idx = mockWatchlist.indexOf(passport);
    if(idx > -1) {
        mockWatchlist.splice(idx, 1);
        saveData(); // Persist changes
        renderWatchlist();
        showToast('Removed from watchlist', 'success');
    }
}

function filterHistory() {
    const input = document.getElementById('history-search');
    if(!input) return;
    const query = input.value.toLowerCase();
    const rows = document.querySelectorAll('#full-history-table tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
    });
}

function updateDashboardStats() {
    document.getElementById('total-entries').textContent = totalEntries.toLocaleString();
    document.getElementById('total-exits').textContent = totalExits.toLocaleString();
    document.getElementById('total-alerts').textContent = totalAlerts.toLocaleString();
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'bx-check-circle' : 'bx-error-circle';
    toast.innerHTML = `<i class='bx ${icon}'></i> ${message}`;
    
    container.appendChild(toast);
    
    // Fade in
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Form Handlers
function handleFormSubmit(e) {
    e.preventDefault();
    
    const passport = document.getElementById('pp-number').value.trim().toUpperCase();
    const given = document.getElementById('pp-given').value.trim();
    const surname = document.getElementById('pp-surname').value.trim();
    const direction = document.querySelector('input[name="direction"]:checked').value;
    const checkpoint = document.getElementById('pp-checkpoint').value;
    
    const fullName = `${given} ${surname}`;
    
    // WATCHLIST CHECK
    if (mockWatchlist.includes(passport)) {
        // Trigger alert banner
        document.getElementById('alert-banner').classList.remove('hidden');
        
        // Add to history as flagged
        mockCrossings.push({
            name: fullName,
            passport: passport,
            direction: direction,
            checkpoint: checkpoint,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            status: "flagged"
        });
        
        totalAlerts++;
        saveData(); // Persist changes
        renderTable();
        updateDashboardStats();
        
        showToast('Processing Halted - Watchlist Match', 'error');
        return;
    }
    
    // NORMAL PROCESSING
    mockCrossings.push({
        name: fullName,
        passport: passport,
        direction: direction,
        checkpoint: checkpoint,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        status: direction.toLowerCase()
    });
    
    if(direction === "Entry") totalEntries++;
    if(direction === "Exit") totalExits++;
    
    saveData(); // Persist changes
    renderTable();
    updateDashboardStats();
    
    showToast(`Traveler ${direction} Authorized Successfully`);
    document.getElementById('processing-form').reset();
}

function dismissAlert() {
    document.getElementById('alert-banner').classList.add('hidden');
    document.getElementById('processing-form').reset();
}

// ADMIN FUNCTIONS
function renderAdminTable() {
    const tbody = document.querySelector('#agents-table tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    Object.keys(agentData).forEach(id => {
        const agent = agentData[id];
        const tr = document.createElement('tr');
        
        const roleBadge = agent.role === 'admin' 
            ? '<span class="status-badge exit">ADMIN</span>' 
            : '<span class="status-badge entry">AGENT</span>';
            
        // Safety lock so they can't delete themselves or AGENT_01
        const actionHtml = (id !== currentAgent.id && id !== 'AGENT_01') 
            ? `<button class="btn-secondary" style="color: var(--alert-red); border-color: var(--alert-red); padding: 4px 10px; font-size: 11px;" onclick="removeAgent('${id}')">Revoke</button>` 
            : `<span style="color:var(--text-muted); font-size:11px;">Protected</span>`;
            
        tr.innerHTML = `
            <td><strong>${id}</strong></td>
            <td>${agent.name}</td>
            <td>${agent.checkpoint}</td>
            <td>${roleBadge}</td>
            <td>${actionHtml}</td>
        `;
        tbody.appendChild(tr);
    });
}

function addAgent() {
    const id = document.getElementById('new-agent-id').value.trim().toUpperCase();
    const name = document.getElementById('new-agent-name').value.trim();
    const pass = document.getElementById('new-agent-pass').value;
    const chk = document.getElementById('new-agent-chk').value;
    const role = document.getElementById('new-agent-role').value;
    
    if(!id || !name || !pass) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    if(agentData[id]) {
        showToast('Agent ID already exists', 'error');
        return;
    }
    
    agentData[id] = { name, checkpoint: chk, pass, role };
    saveAgents();
    renderAdminTable();
    showToast('Agent provisioned successfully');
    document.getElementById('agent-form').reset();
}

function removeAgent(id) {
    if(agentData[id]) {
        delete agentData[id];
        saveAgents();
        renderAdminTable();
        showToast('Agent access revoked', 'success');
    }
}
