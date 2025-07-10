import os
from flask import Flask, render_template_string, redirect, url_for, request, flash, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_cors import CORS
from datetime import datetime, timedelta
import json
import uuid
from werkzeug.utils import secure_filename

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'kesgrave-cms-secret-key-2025')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///kesgrave_working.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

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

# Create upload directories
upload_dirs = ['councillors', 'content/images', 'content/downloads', 'events', 'meetings', 'homepage/logo', 'homepage/slides']
for upload_dir in upload_dirs:
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], upload_dir), exist_ok=True)

# User class for authentication
class AdminUser(UserMixin):
    def __init__(self, id, username='admin'):
        self.id = id
        self.username = username

@login_manager.user_loader
def load_user(user_id):
    return AdminUser(user_id)

# Helper functions
def format_uk_date(date_obj):
    """Format datetime object to UK format DD/MM/YYYY"""
    if isinstance(date_obj, datetime):
        return date_obj.strftime('%d/%m/%Y')
    return date_obj

def format_uk_datetime(date_obj):
    """Format datetime object to UK format DD/MM/YYYY HH:MM"""
    if isinstance(date_obj, datetime):
        return date_obj.strftime('%d/%m/%Y %H:%M')
    return date_obj

# Add template filters
app.jinja_env.filters['uk_date'] = format_uk_date
app.jinja_env.filters['uk_datetime'] = format_uk_datetime

# Database Models
class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    color = db.Column(db.String(7), default='#3498db')
    description = db.Column(db.String(200))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class CouncillorTag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    councillor_id = db.Column(db.Integer, db.ForeignKey('councillor.id'), nullable=False)
    tag_id = db.Column(db.Integer, db.ForeignKey('tag.id'), nullable=False)

class Councillor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(100))
    intro = db.Column(db.Text)
    bio = db.Column(db.Text)
    address = db.Column(db.Text)
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    qualifications = db.Column(db.Text)
    image_filename = db.Column(db.String(255))
    social_links = db.Column(db.Text)
    is_published = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ContentPage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), default='draft')
    meta_description = db.Column(db.String(160))
    featured_image = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(200))
    category = db.Column(db.String(100))
    status = db.Column(db.String(20), default='published')
    featured_image = db.Column(db.String(255))
    first_featured_link = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Meeting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    type = db.Column(db.String(100), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(200))
    agenda_url = db.Column(db.String(255))
    minutes_url = db.Column(db.String(255))
    status = db.Column(db.String(20), default='scheduled')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class HomepageSlide(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    action_button_text = db.Column(db.String(50))
    action_button_url = db.Column(db.String(255))
    featured_image = db.Column(db.String(255))
    is_featured = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    order_position = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class QuickLink(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    url = db.Column(db.String(255), nullable=False)
    icon = db.Column(db.String(50))
    description = db.Column(db.String(200))
    is_active = db.Column(db.Boolean, default=True)
    order_position = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

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
        slides = HomepageSlide.query.filter_by(is_active=True).order_by(HomepageSlide.order_position).all()
        slides_data = []
        for slide in slides:
            slides_data.append({
                'id': slide.id,
                'title': slide.title,
                'description': slide.description,
                'action_button_text': slide.action_button_text,
                'action_button_url': slide.action_button_url,
                'featured_image': slide.featured_image,
                'is_featured': slide.is_featured
            })
        return jsonify(slides_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/homepage/events', methods=['GET'])
def get_homepage_events():
    """Get events for homepage"""
    try:
        events = Event.query.filter_by(status='published').order_by(Event.date.asc()).limit(6).all()
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
                'category': event.category,
                'featured_image': event.featured_image,
                'first_featured_link': event.first_featured_link
            })
        return jsonify(events_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/homepage/meetings', methods=['GET'])
def get_homepage_meetings():
    """Get meetings for homepage"""
    try:
        meetings = Meeting.query.filter_by(status='scheduled').order_by(Meeting.date.asc()).limit(3).all()
        meetings_data = []
        for meeting in meetings:
            # Extract time from datetime if available
            time_str = meeting.date.strftime('%H:%M') if meeting.date else None
            
            meetings_data.append({
                'id': meeting.id,
                'title': meeting.title,
                'type': meeting.type,
                'date': meeting.date.isoformat() if meeting.date else None,
                'time': time_str,
                'location': meeting.location,
                'agenda_url': meeting.agenda_url,
                'minutes_url': meeting.minutes_url
            })
        return jsonify(meetings_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/homepage/quick-links', methods=['GET'])
def get_homepage_quick_links():
    """Get quick links for homepage"""
    try:
        links = QuickLink.query.filter_by(is_active=True).order_by(QuickLink.order_position).all()
        links_data = []
        for link in links:
            links_data.append({
                'id': link.id,
                'title': link.title,
                'url': link.url,
                'icon': link.icon,
                'description': link.description
            })
        return jsonify(links_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/councillors', methods=['GET'])
def get_councillors():
    """Get all published councillors"""
    try:
        councillors = Councillor.query.filter_by(is_published=True).all()
        councillors_data = []
        for councillor in councillors:
            councillors_data.append({
                'id': councillor.id,
                'name': councillor.name,
                'title': councillor.title,
                'intro': councillor.intro,
                'bio': councillor.bio,
                'address': councillor.address,
                'email': councillor.email,
                'phone': councillor.phone,
                'qualifications': councillor.qualifications,
                'image_filename': councillor.image_filename,
                'social_links': json.loads(councillor.social_links) if councillor.social_links else {}
            })
        return jsonify(councillors_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/events', methods=['GET'])
def get_events():
    """Get all published events"""
    try:
        events = Event.query.filter_by(status='published').order_by(Event.date.desc()).all()
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
                'category': event.category,
                'featured_image': event.featured_image,
                'first_featured_link': event.first_featured_link
            })
        return jsonify(events_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/meetings/<meeting_type>', methods=['GET'])
def get_meetings(meeting_type):
    """Get meetings by type"""
    try:
        meetings = Meeting.query.filter_by(
            type=meeting_type.replace('-', ' ').title()
        ).order_by(Meeting.date.desc()).all()
        
        meetings_data = []
        for meeting in meetings:
            # Extract time from datetime if available
            time_str = meeting.date.strftime('%H:%M') if meeting.date else None
            
            meetings_data.append({
                'id': meeting.id,
                'title': meeting.title,
                'type': meeting.type,
                'date': meeting.date.isoformat() if meeting.date else None,
                'time': time_str,
                'location': meeting.location,
                'agenda_url': meeting.agenda_url,
                'minutes_url': meeting.minutes_url,
                'status': meeting.status
            })
        return jsonify(meetings_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/content/<category>/<page>', methods=['GET'])
def get_content_page(category, page):
    """Get specific content page from CMS"""
    try:
        content_page = ContentPage.query.filter_by(
            category=category.replace('-', ' ').title(),
            slug=page,
            status='published'
        ).first()
        
        if not content_page:
            return jsonify({'error': 'Page not found'}), 404
            
        return jsonify({
            'id': content_page.id,
            'title': content_page.title,
            'content': content_page.content,
            'category': content_page.category,
            'slug': content_page.slug,
            'meta_description': content_page.meta_description,
            'featured_image': content_page.featured_image,
            'last_updated': content_page.updated_at.isoformat() if content_page.updated_at else None
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
                <a href="/admin/homepage" class="nav-link">
                    <i class="fas fa-home me-2"></i>Homepage
                </a>
                <a href="/admin/content" class="nav-link">
                    <i class="fas fa-file-alt me-2"></i>Content
                </a>
                <a href="/admin/meetings" class="nav-link">
                    <i class="fas fa-handshake me-2"></i>Meetings
                </a>
                <a href="/admin/events" class="nav-link">
                    <i class="fas fa-calendar me-2"></i>Events
                </a>
                <a href="/admin/councillors" class="nav-link">
                    <i class="fas fa-users me-2"></i>Councillors
                </a>
                <hr style="border-color: rgba(255,255,255,0.2);">
                <a href="/logout" class="nav-link">
                    <i class="fas fa-sign-out-alt me-2"></i>Logout
                </a>
            </div>
        </nav>
        
        <div class="main-content">
            <h1>Dashboard</h1>
            <div class="row">
                <div class="col-md-3">
                    <div class="stat-card">
                        <h5><i class="fas fa-users text-primary"></i> Councillors</h5>
                        <h3>{{ councillor_count }}</h3>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <h5><i class="fas fa-calendar text-success"></i> Events</h5>
                        <h3>{{ event_count }}</h3>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <h5><i class="fas fa-handshake text-info"></i> Meetings</h5>
                        <h3>{{ meeting_count }}</h3>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <h5><i class="fas fa-file-alt text-warning"></i> Content Pages</h5>
                        <h3>{{ content_count }}</h3>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5>Quick Actions</h5>
                        </div>
                        <div class="card-body">
                            <a href="/admin/events" class="btn btn-primary me-2">Add Event</a>
                            <a href="/admin/meetings" class="btn btn-success me-2">Add Meeting</a>
                            <a href="/admin/content" class="btn btn-info">Add Content</a>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5>Website Links</h5>
                        </div>
                        <div class="card-body">
                            <p><strong>Frontend:</strong> <a href="https://kesgravetowncouncil.onrender.com" target="_blank">https://kesgravetowncouncil.onrender.com</a></p>
                            <p><strong>API Base:</strong> {{ request.url_root }}api/</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    ''', 
    councillor_count=Councillor.query.count(),
    event_count=Event.query.count(),
    meeting_count=Meeting.query.count(),
    content_count=ContentPage.query.count()
    )

# Basic admin routes (simplified for deployment)
@app.route('/admin/events')
@login_required
def admin_events():
    return render_template_string('<h1>Events Management</h1><p>Events management interface would go here.</p><a href="/dashboard">Back to Dashboard</a>')

@app.route('/admin/meetings')
@login_required
def admin_meetings():
    return render_template_string('<h1>Meetings Management</h1><p>Meetings management interface would go here.</p><a href="/dashboard">Back to Dashboard</a>')

@app.route('/admin/councillors')
@login_required
def admin_councillors():
    return render_template_string('<h1>Councillors Management</h1><p>Councillors management interface would go here.</p><a href="/dashboard">Back to Dashboard</a>')

@app.route('/admin/content')
@login_required
def admin_content():
    return render_template_string('<h1>Content Management</h1><p>Content management interface would go here.</p><a href="/dashboard">Back to Dashboard</a>')

@app.route('/admin/homepage')
@login_required
def admin_homepage():
    return render_template_string('<h1>Homepage Management</h1><p>Homepage management interface would go here.</p><a href="/dashboard">Back to Dashboard</a>')

# Create tables and sample data
with app.app_context():
    db.create_all()
    
    # Create sample data if tables are empty
    if HomepageSlide.query.count() == 0:
        sample_slide = HomepageSlide(
            title='Welcome to Kesgrave Town Council',
            description='Serving our community with transparency, dedication, and commitment to local democracy.',
            action_button_text='Learn More',
            action_button_url='/content',
            featured_image='https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            is_featured=True,
            is_active=True,
            order_position=1
        )
        db.session.add(sample_slide)
    
    if Event.query.count() == 0:
        sample_event = Event(
            title='Community Clean-Up Day',
            description='Join us for our monthly community clean-up event. Help keep Kesgrave beautiful and meet your neighbors.',
            date=datetime(2025, 7, 15, 10, 0),
            location='Kesgrave Recreation Ground',
            category='Community',
            status='published',
            featured_image='https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        )
        db.session.add(sample_event)
    
    if Meeting.query.count() == 0:
        sample_meeting = Meeting(
            title='Town Council Meeting',
            type='Council Meeting',
            date=datetime(2025, 7, 20, 19, 0),
            location='Community Centre',
            status='scheduled'
        )
        db.session.add(sample_meeting)
    
    if QuickLink.query.count() == 0:
        quick_links = [
            QuickLink(title='Planning Applications', url='/content/planning', icon='fas fa-building', order_position=1),
            QuickLink(title='Council Tax', url='/content/council-tax', icon='fas fa-pound-sign', order_position=2),
            QuickLink(title='Waste Collection', url='/content/waste', icon='fas fa-trash', order_position=3),
            QuickLink(title='Report Issue', url='/contact', icon='fas fa-exclamation-triangle', order_position=4)
        ]
        for link in quick_links:
            db.session.add(link)
    
    db.session.commit()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
