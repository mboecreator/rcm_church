-- Create database
CREATE DATABASE rcm_church;

-- Connect to the database
\c rcm_church;

-- Create tables
CREATE TABLE sermons (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    speaker VARCHAR(100) NOT NULL,
    video_url VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    description TEXT,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO sermons (title, date, speaker, video_url, description) VALUES
('Walking in Faith', '2025-08-20', 'Pastor John', '#', 'A powerful message about walking in faith'),
('The Power of Prayer', '2025-08-13', 'Pastor John', '#', 'Understanding the importance of prayer');

INSERT INTO events (title, date, time, description, location) VALUES
('Sunday Service', '2025-08-27', '10:00', 'Weekly worship service', 'Main Sanctuary'),
('Youth Meeting', '2025-08-25', '18:00', 'Youth fellowship and Bible study', 'Youth Hall');
