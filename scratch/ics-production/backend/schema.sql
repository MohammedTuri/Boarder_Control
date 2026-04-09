-- Prepare the Database
CREATE DATABASE ics_borders;

\c ics_borders;

-- Core Tables
CREATE TABLE agents (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    checkpoint VARCHAR(100) NOT NULL,
    passcode_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'agent'
);

CREATE TABLE crossings (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(50) REFERENCES agents(id),
    traveler_name VARCHAR(100) NOT NULL,
    passport_number VARCHAR(50) NOT NULL,
    direction VARCHAR(20) NOT NULL,
    checkpoint VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE watchlists (
    passport_number VARCHAR(50) PRIMARY KEY,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
