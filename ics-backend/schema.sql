-- ICS Sovereign Data Schema (Production Ready)
-- Use this script to initialize your cloud database tables.


CREATE TABLE IF NOT EXISTS crossings (
    id SERIAL PRIMARY KEY,
    passport VARCHAR(50) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    nationality VARCHAR(50),
    dob DATE,
    expiry DATE,
    type VARCHAR(20),
    point_of_entry VARCHAR(100),
    status VARCHAR(20),
    photo_path VARCHAR(255),
    biometric_status VARCHAR(50),
    biometric_score DECIMAL(5,2),
    risk_score INTEGER,
    risk_level VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    passport_number VARCHAR(50) NOT NULL,
    nationality VARCHAR(50),
    dob DATE,
    purpose VARCHAR(50),
    travel_date DATE,
    status VARCHAR(20) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS watchlist (
    id SERIAL PRIMARY KEY,
    passport VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    nationality VARCHAR(50),
    reason TEXT,
    risk_level VARCHAR(20) DEFAULT 'High',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS biometric_archive (
    id SERIAL PRIMARY KEY,
    passport VARCHAR(50) NOT NULL,
    signature_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    application_id INT,
    type VARCHAR(50),
    recipient VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Delivered',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

