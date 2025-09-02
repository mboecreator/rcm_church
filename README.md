# Revival Crusade Missions International - Church Website

A modern, responsive church website with dynamic events management system.

## Features

### Frontend
- **Responsive Design**: Mobile-first approach with beautiful animations
- **Dynamic Events**: Events loaded from backend API
- **Home Page**: Shows next 3 upcoming events automatically
- **Events Page**: Full events listing with filtering capabilities
- **Calendar Integration**: Interactive calendar view
- **Modern UI**: Professional design with church branding

### Backend
- **Python Flask API**: RESTful API for events management
- **SQLite Database**: Lightweight database for events storage
- **Admin Interface**: Easy-to-use admin panel for managing events
- **CORS Enabled**: Frontend-backend communication ready

## Installation & Setup

### Prerequisites
- Python 3.7 or higher
- pip (Python package installer)

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Run the Application
```bash
python app.py
```

The application will start on `http://localhost:5001`

### Step 3: Access the Website
- **Main Website**: http://localhost:5001
- **Events Page**: http://localhost:5001/events.html
- **Admin Panel**: http://localhost:5001/admin.html

## API Endpoints

### Events API
- `GET /api/events` - Get all events
- `GET /api/events/upcoming?limit=3` - Get upcoming events (for home page)
- `GET /api/events/<id>` - Get specific event
- `POST /api/events` - Create new event
- `PUT /api/events/<id>` - Update event
- `DELETE /api/events/<id>` - Delete event
- `GET /api/events/categories` - Get all categories
- `GET /api/events/calendar/<year>/<month>` - Get events for calendar

### Event Data Structure
```json
{
  "id": 1,
  "title": "Revival Crusade 2025",
  "description": "A powerful three-day crusade...",
  "date": "2025-03-15",
  "time": "18:00",
  "location": "Main Sanctuary",
  "category": "crusade",
  "created_at": "2025-01-01 12:00:00",
  "updated_at": "2025-01-01 12:00:00"
}
```

## Event Categories
- `crusade` - Revival Crusades
- `conference` - Leadership Conferences
- `youth` - Youth Events
- `prayer` - Prayer Meetings
- `service` - Regular Services
- `study` - Bible Studies

## Admin Panel Usage

### Adding Events
1. Go to http://localhost:5001/admin.html
2. Click "Add Event" tab
3. Fill in event details
4. Click "Add Event" button

### Editing Events
1. In the "View Events" tab, click "Edit" next to any event
2. Modify the details in the edit form
3. Click "Update Event"

### Deleting Events
1. In the "View Events" tab, click "Delete" next to any event
2. Confirm the deletion

## Home Page Events Logic

The home page automatically displays the **next 3 upcoming events** based on:
1. Events with dates >= today
2. Ordered by date (earliest first)
3. Limited to 3 events maximum

This ensures visitors always see the most relevant upcoming events.

## File Structure
```
/
├── app.py                 # Flask backend application
├── requirements.txt       # Python dependencies
├── church_events.db      # SQLite database (auto-created)
├── index.html            # Home page
├── events.html           # Events page
├── admin.html            # Admin panel
├── css/
│   └── styles.css        # Main stylesheet
├── js/
│   └── main.js           # Main JavaScript
└── images/               # Website images
```

## Database Schema

### Events Table
```sql
CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT,
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Customization

### Adding New Event Categories
1. Update the category options in `admin.html`
2. Add corresponding CSS styles for the new category badge
3. Update the filter buttons in `events.html`

### Styling Changes
- Main styles: `css/styles.css`
- Admin styles: Inline in `admin.html`
- Colors and branding can be modified in CSS variables

## Production Deployment

### For Production Use:
1. Change `app.run(debug=False)` in `app.py`
2. Use a production WSGI server like Gunicorn
3. Consider using PostgreSQL instead of SQLite
4. Add authentication for admin panel
5. Set up proper error handling and logging

### Example Production Command:
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Troubleshooting

### Common Issues:
1. **Port already in use**: Change port in `app.py` or kill existing process
2. **Database errors**: Delete `church_events.db` to reset database
3. **CORS errors**: Ensure Flask-CORS is installed and configured
4. **Events not loading**: Check browser console for API errors

### Development Tips:
- Use browser developer tools to debug API calls
- Check Flask console for backend errors
- Database file is created automatically on first run
- Sample events are inserted automatically

## Support

For technical support or questions about this church website system, please refer to the documentation or contact the development team.

---

**Revival Crusade Missions International**  
*Igniting Revival, Discipling Nations* 🙏