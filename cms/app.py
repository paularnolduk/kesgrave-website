import os
from flask import Flask, render_template_string, redirect, url_for, request, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_cors import CORS
from datetime import datetime
import json

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'kesgrave-cms-secret-key-2025')

# Database configuration - FIXED for Render deployment
if os.environ.get("RENDER"):
    # On Render, use a persistent SQLite database in /opt/render/project/src
    db_path = "/opt/render/project/src/kesgrave_working.db"
    print(f"📁 Render environment detected, using database path: {db_path}")
else:
    # Local development
    db_path = "kesgrave_working.db"
    print(f"📁 Local environment, using database path: {db_path}")

app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Enable CORS
CORS(app, origins=[
    os.environ.get('FRONTEND_URL', 'http://localhost:3000'),
    'https://kesgrave-cms.onrender.com',
    'https://kesgravetowncouncil.onrender.com'
])

# User class for authentication
class AdminUser(UserMixin):
    def __init__(self, id, username='admin'):
        self.id = id
        self.username = username

@login_manager.user_loader
def load_user(user_id):
    return AdminUser(user_id)

# Minimal Database Models - only basic columns
class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Meeting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Slide(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    image_url = db.Column(db.String(500))
    is_active = db.Column(db.Boolean, default=True)
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Routes
@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        # Simple authentication (you should use proper password hashing in production)
        if username == 'admin' and password == os.environ.get('ADMIN_PASSWORD', 'admin123'):
            user = AdminUser(1)
            login_user(user)
            flash('Logged in successfully!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password!', 'error')
    
    return render_template_string('''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Kesgrave CMS - Login</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 400px; margin: 100px auto; padding: 20px; }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input[type="text"], input[type="password"] { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
            button { background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; width: 100%; }
            button:hover { background-color: #0056b3; }
            .alert { padding: 10px; margin-bottom: 15px; border-radius: 4px; }
            .alert-error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
            .alert-success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            h1 { text-align: center; color: #333; }
        </style>
    </head>
    <body>
        <h1>Kesgrave CMS</h1>
        {% with messages = get_flashed_messages(with_categories=true) %}
            {% if messages %}
                {% for category, message in messages %}
                    <div class="alert alert-{{ category }}">{{ message }}</div>
                {% endfor %}
            {% endif %}
        {% endwith %}
        
        <form method="POST">
            <div class="form-group">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">Login</button>
        </form>
        
        <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>Default credentials: admin / admin123</p>
            <p>Database: {{ db_path }}</p>
        </div>
    </body>
    </html>
    ''', db_path=db_path)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Logged out successfully!', 'success')
    return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    # Get counts for dashboard
    event_count = Event.query.count()
    meeting_count = Meeting.query.count()
    slide_count = Slide.query.count()
    
    return render_template_string('''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Kesgrave CMS - Dashboard</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
            .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
            .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
            .stat-number { font-size: 2em; font-weight: bold; color: #007bff; }
            .stat-label { color: #666; margin-top: 5px; }
            .actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
            .action-card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; }
            .action-card h3 { margin-top: 0; color: #333; }
            .btn { display: inline-block; padding: 8px 16px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 5px; }
            .btn:hover { background-color: #0056b3; }
            .btn-secondary { background-color: #6c757d; }
            .btn-secondary:hover { background-color: #545b62; }
            .logout { background-color: #dc3545; color: white; text-decoration: none; padding: 8px 16px; border-radius: 4px; }
            .logout:hover { background-color: #c82333; }
            h1 { color: #333; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Kesgrave CMS Dashboard</h1>
            <a href="/logout" class="logout">Logout</a>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">{{ event_count }}</div>
                <div class="stat-label">Events</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{{ meeting_count }}</div>
                <div class="stat-label">Meetings</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{{ slide_count }}</div>
                <div class="stat-label">Slides</div>
            </div>
        </div>
        
        <div class="actions">
            <div class="action-card">
                <h3>Events Management</h3>
                <p>Manage community events and activities.</p>
                <a href="/events" class="btn">View Events</a>
                <a href="/events/add" class="btn">Add Event</a>
            </div>
            
            <div class="action-card">
                <h3>Meetings Management</h3>
                <p>Manage council meetings and agendas.</p>
                <a href="/meetings" class="btn">View Meetings</a>
                <a href="/meetings/add" class="btn">Add Meeting</a>
            </div>
            
            <div class="action-card">
                <h3>Homepage Slides</h3>
                <p>Manage homepage slider content.</p>
                <a href="/slides" class="btn">View Slides</a>
                <a href="/slides/add" class="btn">Add Slide</a>
            </div>
            
            <div class="action-card">
                <h3>Database Info</h3>
                <p>Database: {{ db_path }}</p>
                <a href="/health" class="btn btn-secondary">Health Check</a>
            </div>
        </div>
    </body>
    </html>
    ''', event_count=event_count, meeting_count=meeting_count, slide_count=slide_count, db_path=db_path)

@app.route('/health')
def health_check():
    try:
        # Test database connection
        event_count = Event.query.count()
        meeting_count = Meeting.query.count()
        slide_count = Slide.query.count()
        
        return jsonify({
            "status": "healthy",
            "database": "connected",
            "database_path": db_path,
            "counts": {
                "events": event_count,
                "meetings": meeting_count,
                "slides": slide_count
            },
            "timestamp": datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy", 
            "error": str(e),
            "database_path": db_path,
            "timestamp": datetime.utcnow().isoformat()
        }), 500

@app.route('/events')
@login_required
def list_events():
    events = Event.query.order_by(Event.date.desc()).all()
    return render_template_string('''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Events - Kesgrave CMS</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f8f9fa; }
            .btn { display: inline-block; padding: 6px 12px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 2px; }
            .btn:hover { background-color: #0056b3; }
            .btn-danger { background-color: #dc3545; }
            .btn-danger:hover { background-color: #c82333; }
            h1 { color: #333; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Events ({{ event_count }})</h1>
            <div>
                <a href="/events/add" class="btn">Add New Event</a>
                <a href="/dashboard" class="btn" style="background-color: #6c757d;">Back to Dashboard</a>
            </div>
        </div>
        
        {% if events %}
        <table>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {% for event in events %}
                <tr>
                    <td>{{ event.title }}</td>
                    <td>{{ event.date.strftime('%Y-%m-%d %H:%M') if event.date }}</td>
                    <td>{{ event.location or 'N/A' }}</td>
                    <td>
                        <a href="/events/edit/{{ event.id }}" class="btn">Edit</a>
                        <a href="/events/delete/{{ event.id }}" class="btn btn-danger" onclick="return confirm('Are you sure?')">Delete</a>
                    </td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
        {% else %}
        <p>No events found. <a href="/events/add">Add the first event</a>.</p>
        {% endif %}
    </body>
    </html>
    ''', events=events, event_count=len(events))

@app.route('/meetings')
@login_required
def list_meetings():
    meetings = Meeting.query.order_by(Meeting.date.desc()).all()
    return render_template_string('''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Meetings - Kesgrave CMS</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f8f9fa; }
            .btn { display: inline-block; padding: 6px 12px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 2px; }
            .btn:hover { background-color: #0056b3; }
            .btn-danger { background-color: #dc3545; }
            .btn-danger:hover { background-color: #c82333; }
            h1 { color: #333; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Meetings ({{ meeting_count }})</h1>
            <div>
                <a href="/meetings/add" class="btn">Add New Meeting</a>
                <a href="/dashboard" class="btn" style="background-color: #6c757d;">Back to Dashboard</a>
            </div>
        </div>
        
        {% if meetings %}
        <table>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {% for meeting in meetings %}
                <tr>
                    <td>{{ meeting.title }}</td>
                    <td>{{ meeting.date.strftime('%Y-%m-%d %H:%M') if meeting.date }}</td>
                    <td>{{ meeting.location or 'N/A' }}</td>
                    <td>
                        <a href="/meetings/edit/{{ meeting.id }}" class="btn">Edit</a>
                        <a href="/meetings/delete/{{ meeting.id }}" class="btn btn-danger" onclick="return confirm('Are you sure?')">Delete</a>
                    </td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
        {% else %}
        <p>No meetings found. <a href="/meetings/add">Add the first meeting</a>.</p>
        {% endif %}
    </body>
    </html>
    ''', meetings=meetings, meeting_count=len(meetings))

# Create tables and ensure database exists
with app.app_context():
    try:
        db.create_all()
        print("✅ Database tables created/verified successfully")
        
        # Test database connection
        event_count = Event.query.count()
        meeting_count = Meeting.query.count()
        slide_count = Slide.query.count()
        print(f"📊 Database stats - Events: {event_count}, Meetings: {meeting_count}, Slides: {slide_count}")
        
    except Exception as e:
        print(f"❌ Error with database: {e}")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

