// ICS Mission Configuration
// Centrally manages environment-specific variables for industrial deployment.

export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 'https://ics-backend-production.onrender.com' : 'http://localhost:5000');

if (import.meta.env.PROD) {
  console.log('%c ICS MISSION CONTROL ', 'background: #1c519d; color: white; font-weight: bold;', `Connecting to backend at: ${API_BASE_URL}`);
}

export const SYSTEM_VERSION = '1.0.4-INDUSTRIAL';
export const SECURE_PROTOCOL = 'TLS 1.3 - 256bit';
