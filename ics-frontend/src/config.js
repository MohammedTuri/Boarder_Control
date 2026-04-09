// ICS Mission Configuration
// Centrally manages environment-specific variables for industrial deployment.

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const SYSTEM_VERSION = '1.0.4-INDUSTRIAL';
export const SECURE_PROTOCOL = 'TLS 1.3 - 256bit';
