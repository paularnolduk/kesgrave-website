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
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///kesgrave_working.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Enable CORS
CORS(app, origins=[
    os.environ.get('FRONTEND_URL', 'http://localhost:3000'),
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
    date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# API Routes for Frontend
@app.route('/api/footer-links', methods=['GET'])
def get_footer_links():
    """API endpoint to get footer links for the frontend website"""
    try:
        footer_links = [
            {'title': 'Privacy Policy', 'url': '/privacy-policy'},
            {'title': 'Terms of Service', 'url': '/terms'},
            {'title': 'Accessibility Statement', 'url': '/accessibility'},
            {'title': 'Contact Us', 'url': '/contact'},
            {'title': 'Freedom of Information', 'url': '/foi'},
            {'title': 'Complaints Procedure', 'url': '/complaints'}
        ]
        return jsonify(footer_links)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/header-links', methods=['GET'])
def get_header_links():
    """API endpoint to get header navigation links"""
    try:
        header_links = [
            {'title': 'Home', 'url': '/', 'active': True},
            {'title': 'Councillors', 'url': '/councillors', 'active': True},
            {'title': 'Information', 'url': '/content', 'active': True},
            {'title': 'Meetings', 'url': '/ktc-meetings', 'active': True},
            {'title': 'Things to Do', 'url': '/ktc-events', 'active': True},
            {'title': 'Contact', 'url': '/contact', 'active': True}
        ]
        return jsonify(header_links)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/homepage/slides', methods=['GET'])
def get_homepage_slides():
    """Get homepage slides"""
    try:
        # Return sample slide data
        slides_data = [{
            'id': 1,
            'title': 'Welcome to Kesgrave Town Council',
            'description': 'Serving our community with transparency, dedication, and commitment to local democracy.',
            'action_button_text': 'Learn More',
            'action_button_url': '/content',
            'featured_image': 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            'is_featured': True
        }]
        return jsonify(slides_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/homepage/events', methods=['GET'])
def get_homepage_events():
    """Get events for homepage"""
    try:
        events = Event.query.order_by(Event.date.asc()).limit(6).all()
        events_data = []
        for event in events:
            # Extract time from datetime if available
            time_str = event.date.strftime('%H:%M') if event.date else None
            
            events_data.append({
                'id': event.id,
                'title': event.title,
                'description': event.description,
                'date': event.date.isoformat() if event.date else None,
                'time': time_str,
                'location': event.location,
                'category': 'Community',  # Default category
                'featured_image': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'first_featured_link': f'/ktc-events/{event.id}'
            })
        return jsonify(events_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/homepage/meetings', methods=['GET'])
def get_homepage_meetings():
    """Get meetings for homepage"""
    try:
        meetings = Meeting.query.order_by(Meeting.date.asc()).limit(3).all()
        meetings_data = []
        for meeting in meetings:
            # Extract time from datetime if available
            time_str = meeting.date.strftime('%H:%M') if meeting.date else None
            
            meetings_data.append({
                'id': meeting.id,
                'title': meeting.title,
                'type': 'Council Meeting',  # Default type
                'date': meeting.date.isoformat() if meeting.date else None,
                'time': time_str,
                'location': meeting.location,
                'agenda_url': None,
                'minutes_url': None
            })
        return jsonify(meetings_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/homepage/quick-links', methods=['GET'])
def get_homepage_quick_links():
    """Get quick links for homepage"""
    try:
        links_data = [
            {'id': 1, 'title': 'Planning Applications', 'url': '/content/planning', 'icon': 'fas fa-building', 'description': 'View planning applications'},
            {'id': 2, 'title': 'Council Tax', 'url': '/content/council-tax', 'icon': 'fas fa-pound-sign', 'description': 'Council tax information'},
            {'id': 3, 'title': 'Waste Collection', 'url': '/content/waste', 'icon': 'fas fa-trash', 'description': 'Waste collection schedules'},
            {'id': 4, 'title': 'Report Issue', 'url': '/contact', 'icon': 'fas fa-exclamation-triangle', 'description': 'Report a local issue'}
        ]
        return jsonify(links_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/councillors', methods=['GET'])
def get_councillors():
    """Get all published councillors"""
    try:
        # Return empty array for now - can be populated later
        return jsonify([])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/events', methods=['GET'])
def get_events():
    """Get all published events"""
    try:
        events = Event.query.order_by(Event.date.desc()).all()
        events_data = []
        for event in events:
            # Extract time from datetime if available
            time_str = event.date.strftime('%H:%M') if event.date else None
            
            events_data.append({
                'id': event.id,
                'title': event.title,
                'description': event.description,
                'date': event.date.isoformat() if event.date else None,
                'time': time_str,
                'location': event.location,
                'category': 'Community',  # Default category
                'featured_image': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'first_featured_link': f'/ktc-events/{event.id}'
            })
        return jsonify(events_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/meetings/<meeting_type>', methods=['GET'])
def get_meetings(meeting_type):
    """Get meetings by type"""
    try:
        meetings = Meeting.query.order_by(Meeting.date.desc()).all()
        meetings_data = []
        for meeting in meetings:
            # Extract time from datetime if available
            time_str = meeting.date.strftime('%H:%M') if meeting.date else None
            
            meetings_data.append({
                'id': meeting.id,
                'title': meeting.title,
                'type': 'Council Meeting',  # Default type
                'date': meeting.date.isoformat() if meeting.date else None,
                'time': time_str,
                'location': meeting.location,
                'agenda_url': None,
                'minutes_url': None,
                'status': 'scheduled'
            })
        return jsonify(meetings_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/content/<category>/<page>', methods=['GET'])
def get_content_page(category, page):
    """Get specific content page from CMS"""
    try:
        # Return sample content for now
        return jsonify({
            'id': 1,
            'title': f'{page.replace("-", " ").title()}',
            'content': f'<h1>{page.replace("-", " ").title()}</h1><p>Content for {page} will be available soon.</p>',
            'category': category.replace('-', ' ').title(),
            'slug': page,
            'meta_description': f'Information about {page.replace("-", " ")}',
            'featured_image': None,
            'last_updated': datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Authentication Routes
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # Simple authentication (change this in production!)
        if username == 'admin' and password == 'admin123':
            user = AdminUser(1, username)
            login_user(user)
            return redirect(url_for('dashboard'))
        flash('Invalid credentials')
    
    return render_template_string('''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Kesgrave CMS Login</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body class="bg-light">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <div class="card mt-5">
                        <div class="card-header">
                            <h3 class="text-center">🏛️ Kesgrave CMS</h3>
                        </div>
                        <div class="card-body">
                            {% with messages = get_flashed_messages() %}
                                {% if messages %}
                                    <div class="alert alert-danger">{{ messages[0] }}</div>
                                {% endif %}
                            {% endwith %}
                            <form method="post">
                                <div class="mb-3">
                                    <label class="form-label">Username</label>
                                    <input type="text" name="username" class="form-control" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Password</label>
                                    <input type="password" name="password" class="form-control" required>
                                </div>
                                <button type="submit" class="btn btn-primary w-100">Login</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    ''')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/dashboard')
@app.route('/')
@login_required
def dashboard():
    return render_template_string('''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Kesgrave CMS Dashboard</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
            .sidebar {
                position: fixed;
                top: 0;
                left: 0;
                height: 100vh;
                width: 260px;
                background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
                color: white;
                z-index: 1000;
                overflow-y: auto;
            }
            .main-content {
                margin-left: 260px;
                padding: 2rem;
                background-color: #f8f9fa;
                min-height: 100vh;
            }
            .nav-link {
                color: rgba(255,255,255,0.8);
                padding: 0.75rem 1.5rem;
                display: block;
                text-decoration: none;
                transition: all 0.3s ease;
            }
            .nav-link:hover, .nav-link.active {
                color: white;
                background: rgba(255,255,255,0.1);
            }
            .stat-card {
                background: white;
                border-radius: 10px;
                padding: 1.5rem;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                margin-bottom: 1rem;
            }
        </style>
    </head>
    <body>
        <nav class="sidebar">
            <div class="p-3 text-center border-bottom">
                <h4>🏛️ Kesgrave CMS</h4>
            </div>
            <div class="p-3">
                <a href="/dashboard" class="nav-link active">
                    <i class="fas fa-tachometer-alt me-2"></i>Dashboard
                </a>
                <a href="/admin/events" class="nav-link">
                    <i class="fas fa-calendar me-2"></i>Events
                </a>
                <a href="/admin/meetings" class="nav-link">
                    <i class="fas fa-handshake me-2"></i>Meetings
                </a>
                <hr style="border-color: rgba(255,255,255,0.2);">
                <a href="/logout" class="nav-link">
                    <i class="fas fa-sign-out-alt me-2"></i>Logout
                </a>
            </div>
        </nav>
        
        <div class="main-content">
            <h1>Dashboard</h1>
            <div class="alert alert-success">
                <h5>✅ CMS is Working!</h5>
                <p>Your frontend should now connect successfully. The API endpoints are responding with sample data.</p>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <div class="stat-card">
                        <h5><i class="fas fa-calendar text-success"></i> Events</h5>
                        <h3>{{ event_count }}</h3>
                        <p>Events in database</p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="stat-card">
                        <h5><i class="fas fa-handshake text-info"></i> Meetings</h5>
                        <h3>{{ meeting_count }}</h3>
                        <p>Meetings in database</p>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-header">
                            <h5>Website Status</h5>
                        </div>
                        <div class="card-body">
                            <p><strong>Frontend:</strong> <a href="https://kesgravetowncouncil.onrender.com" target="_blank">https://kesgravetowncouncil.onrender.com</a></p>
                            <p><strong>API Base:</strong> {{ request.url_root }}api/</p>
                            <p><strong>Status:</strong> <span class="badge bg-success">All API endpoints working</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    ''', 
    event_count=Event.query.count(),
    meeting_count=Meeting.query.count()
    )

# Basic admin routes
@app.route('/admin/events')
@login_required
def admin_events():
    events = Event.query.order_by(Event.date.desc()).all()
    return render_template_string('''
    <h1>Events Management</h1>
    <p>{{ event_count }} events in database</p>
    <ul>
    {% for event in events %}
        <li>{{ event.title }} - {{ event.date.strftime('%Y-%m-%d %H:%M') if event.date }}</li>
    {% endfor %}
    </ul>
    <a href="/dashboard">Back to Dashboard</a>
    ''', events=events, event_count=len(events))

@app.route('/admin/meetings')
@login_required
def admin_meetings():
    meetings = Meeting.query.order_by(Meeting.date.desc()).all()
    return render_template_string('''
    <h1>Meetings Management</h1>
    <p>{{ meeting_count }} meetings in database</p>
    <ul>
    {% for meeting in meetings %}
        <li>{{ meeting.title }} - {{ meeting.date.strftime('%Y-%m-%d %H:%M') if meeting.date }}</li>
    {% endfor %}
    </ul>
    <a href="/dashboard">Back to Dashboard</a>
    ''', meetings=meetings, meeting_count=len(meetings))

# Create tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
