#!/usr/bin/env python3
"""
Revival Crusade Missions International - Events API
Flask backend for managing church events
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from datetime import datetime, timedelta
import sqlite3
import os
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Database configuration
DATABASE = 'church_events.db'

def init_db():
    """Initialize the database with events table"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            date DATE NOT NULL,
            time TEXT,
            location TEXT NOT NULL,
            category TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Insert sample events if table is empty
    cursor.execute('SELECT COUNT(*) FROM events')
    if cursor.fetchone()[0] == 0:
        sample_events = [
            (
                'Revival Crusade 2025',
                'A powerful three-day crusade featuring anointed preaching, worship, and prayer for healing and salvation. Join us for this transformative experience as we seek God\'s face together.',
                '2025-12-15',
                '18:00',
                'Main Sanctuary',
                'crusade'
            ),
            (
                'Leadership Conference 2025',
                'Intensive training for church leaders and ministry workers, focusing on effective leadership and spiritual growth. This conference is designed to equip leaders with practical tools.',
                '2025-11-20',
                '09:00',
                'Conference Hall',
                'conference'
            ),
            (
                'Youth Revival 2025',
                'Special event designed for young people, featuring contemporary worship and relevant biblical teaching. This revival is tailored to address the unique challenges facing today\'s youth.',
                '2025-10-10',
                '19:00',
                'Youth Hall',
                'youth'
            ),
            (
                'Monthly Prayer & Fasting',
                'Join us for our monthly prayer and fasting session as we seek God\'s face together. This is a time of corporate prayer, intercession, and spiritual breakthrough.',
                '2025-09-15',
                '18:00',
                'Prayer Room',
                'prayer'
            ),
            (
                'Sunday Worship Service',
                'Join us every Sunday for our worship services featuring powerful preaching, anointed worship, and fellowship. We have two services to accommodate different schedules.',
                '2025-09-08',
                '09:00',
                'Main Sanctuary',
                'service'
            ),
            (
                'Midweek Bible Study',
                'Deep dive into God\'s Word with interactive study sessions and meaningful discussions. Perfect for spiritual growth and fellowship with other believers.',
                '2025-09-05',
                '19:00',
                'Fellowship Hall',
                'study'
            )
        ]
        
        cursor.executemany('''
            INSERT INTO events (title, description, date, time, location, category)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', sample_events)
    
    conn.commit()
    conn.close()

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    """Serve the main index.html file"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    return send_from_directory('.', filename)

@app.route('/api/events', methods=['GET'])
def get_all_events():
    """Get all events, optionally filtered by category"""
    category = request.args.get('category')
    
    conn = get_db_connection()
    
    if category and category != 'all':
        events = conn.execute(
            'SELECT * FROM events WHERE category = ? ORDER BY date ASC',
            (category,)
        ).fetchall()
    else:
        events = conn.execute(
            'SELECT * FROM events ORDER BY date ASC'
        ).fetchall()
    
    conn.close()
    
    events_list = []
    for event in events:
        events_list.append({
            'id': event['id'],
            'title': event['title'],
            'description': event['description'],
            'date': event['date'],
            'time': event['time'],
            'location': event['location'],
            'category': event['category'],
            'created_at': event['created_at'],
            'updated_at': event['updated_at']
        })
    
    return jsonify(events_list)

@app.route('/api/events/upcoming', methods=['GET'])
def get_upcoming_events():
    """Get upcoming events (next events from today), limited by query parameter"""
    limit = request.args.get('limit', 10, type=int)
    today = datetime.now().date()
    
    conn = get_db_connection()
    events = conn.execute(
        'SELECT * FROM events WHERE date >= ? ORDER BY date ASC LIMIT ?',
        (today, limit)
    ).fetchall()
    conn.close()
    
    events_list = []
    for event in events:
        events_list.append({
            'id': event['id'],
            'title': event['title'],
            'description': event['description'],
            'date': event['date'],
            'time': event['time'],
            'location': event['location'],
            'category': event['category'],
            'created_at': event['created_at'],
            'updated_at': event['updated_at']
        })
    
    return jsonify(events_list)

@app.route('/api/events/<int:event_id>', methods=['GET'])
def get_event(event_id):
    """Get a specific event by ID"""
    conn = get_db_connection()
    event = conn.execute(
        'SELECT * FROM events WHERE id = ?',
        (event_id,)
    ).fetchone()
    conn.close()
    
    if event is None:
        return jsonify({'error': 'Event not found'}), 404
    
    return jsonify({
        'id': event['id'],
        'title': event['title'],
        'description': event['description'],
        'date': event['date'],
        'time': event['time'],
        'location': event['location'],
        'category': event['category'],
        'created_at': event['created_at'],
        'updated_at': event['updated_at']
    })

@app.route('/api/events', methods=['POST'])
def create_event():
    """Create a new event"""
    data = request.get_json()
    
    required_fields = ['title', 'description', 'date', 'location', 'category']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO events (title, description, date, time, location, category)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        data['title'],
        data['description'],
        data['date'],
        data.get('time', ''),
        data['location'],
        data['category']
    ))
    
    event_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({'id': event_id, 'message': 'Event created successfully'}), 201

@app.route('/api/events/<int:event_id>', methods=['PUT'])
def update_event(event_id):
    """Update an existing event"""
    data = request.get_json()
    
    conn = get_db_connection()
    
    # Check if event exists
    event = conn.execute('SELECT * FROM events WHERE id = ?', (event_id,)).fetchone()
    if event is None:
        conn.close()
        return jsonify({'error': 'Event not found'}), 404
    
    # Update event
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE events 
        SET title = ?, description = ?, date = ?, time = ?, location = ?, category = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (
        data.get('title', event['title']),
        data.get('description', event['description']),
        data.get('date', event['date']),
        data.get('time', event['time']),
        data.get('location', event['location']),
        data.get('category', event['category']),
        event_id
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Event updated successfully'})

@app.route('/api/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    """Delete an event"""
    conn = get_db_connection()
    
    # Check if event exists
    event = conn.execute('SELECT * FROM events WHERE id = ?', (event_id,)).fetchone()
    if event is None:
        conn.close()
        return jsonify({'error': 'Event not found'}), 404
    
    # Delete event
    conn.execute('DELETE FROM events WHERE id = ?', (event_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Event deleted successfully'})

@app.route('/api/events/categories', methods=['GET'])
def get_categories():
    """Get all event categories"""
    conn = get_db_connection()
    categories = conn.execute(
        'SELECT DISTINCT category FROM events ORDER BY category'
    ).fetchall()
    conn.close()
    
    category_list = [row['category'] for row in categories]
    return jsonify(category_list)

@app.route('/api/events/calendar/<int:year>/<int:month>', methods=['GET'])
def get_calendar_events(year, month):
    """Get events for a specific month/year for calendar display"""
    # Get first and last day of the month
    first_day = datetime(year, month, 1).date()
    if month == 12:
        last_day = datetime(year + 1, 1, 1).date() - timedelta(days=1)
    else:
        last_day = datetime(year, month + 1, 1).date() - timedelta(days=1)
    
    conn = get_db_connection()
    events = conn.execute(
        'SELECT * FROM events WHERE date >= ? AND date <= ? ORDER BY date ASC',
        (first_day, last_day)
    ).fetchall()
    conn.close()
    
    events_list = []
    for event in events:
        events_list.append({
            'id': event['id'],
            'title': event['title'],
            'description': event['description'],
            'date': event['date'],
            'time': event['time'],
            'location': event['location'],
            'category': event['category']
        })
    
    return jsonify(events_list)

if __name__ == '__main__':
    # Initialize database
    init_db()
    
    # Run the application
    print("🙏 Revival Crusade Missions International - Events API Starting...")
    print("📅 Events API available at: http://localhost:5001/api/events")
    print("🏠 Website available at: http://localhost:5001")
    
    app.run(debug=True, host='0.0.0.0', port=5001)