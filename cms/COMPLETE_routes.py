from app import app, db, User, Page, NewsItem, Event, Document
from flask import render_template_string, redirect, url_for, request, flash, jsonify, send_from_directory
from flask_login import login_user, logout_user, login_required, current_user
from datetime import datetime
import os

# Login route
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username, password=password).first()
        if user:
            login_user(user)
            return redirect(url_for('admin_dashboard'))
        flash('Invalid credentials')
    
    return render_template_string('''
    <!DOCTYPE html>
    <html>
    <head><title>CMS Login</title></head>
    <body>
        <h2>CMS Login</h2>
        <form method="post">
            <p>Username: <input type="text" name="username" required></p>
            <p>Password: <input type="password" name="password" required></p>
            <p><input type="submit" value="Login"></p>
        </form>
    </body>
    </html>
    ''')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

# Admin dashboard
@app.route('/admin')
@login_required
def admin_dashboard():
    return render_template_string('''
    <!DOCTYPE html>
    <html>
    <head><title>CMS Dashboard</title></head>
    <body>
        <h1>CMS Dashboard</h1>
        <nav>
            <a href="{{ url_for('manage_pages') }}">Manage Pages</a> |
            <a href="{{ url_for('manage_news') }}">Manage News</a> |
            <a href="{{ url_for('manage_events') }}">Manage Events</a> |
            <a href="{{ url_for('logout') }}">Logout</a>
        </nav>
    </body>
    </html>
    ''')

# API Routes for frontend
@app.route('/api/pages')
def api_pages():
    pages = Page.query.all()
    return jsonify([{
        'id': p.id,
        'title': p.title,
        'content': p.content,
        'slug': p.slug,
        'updated_at': p.updated_at.isoformat() if p.updated_at else None
    } for p in pages])

@app.route('/api/pages/<slug>')
def api_page(slug):
    page = Page.query.filter_by(slug=slug).first()
    if page:
        return jsonify({
            'id': page.id,
            'title': page.title,
            'content': page.content,
            'slug': page.slug,
            'updated_at': page.updated_at.isoformat() if page.updated_at else None
        })
    return jsonify({'error': 'Page not found'}), 404

@app.route('/api/news')
def api_news():
    news = NewsItem.query.order_by(NewsItem.date.desc()).all()
    return jsonify([{
        'id': n.id,
        'title': n.title,
        'content': n.content,
        'date': n.date.isoformat() if n.date else None
    } for n in news])

@app.route('/api/events')
def api_events():
    events = Event.query.order_by(Event.date.asc()).all()
    return jsonify([{
        'id': e.id,
        'title': e.title,
        'description': e.description,
        'date': e.date.isoformat() if e.date else None,
        'location': e.location
    } for e in events])

# Page management
@app.route('/admin/pages')
@login_required
def manage_pages():
    pages = Page.query.all()
    return render_template_string('''
    <!DOCTYPE html>
    <html>
    <head><title>Manage Pages</title></head>
    <body>
        <h1>Manage Pages</h1>
        <a href="{{ url_for('admin_dashboard') }}">Back to Dashboard</a>
        <h2>Add New Page</h2>
        <form method="post" action="{{ url_for('add_page') }}">
            <p>Title: <input type="text" name="title" required></p>
            <p>Slug: <input type="text" name="slug" required></p>
            <p>Content: <textarea name="content" rows="10" cols="50" required></textarea></p>
            <p><input type="submit" value="Add Page"></p>
        </form>
        <h2>Existing Pages</h2>
        <ul>
        {% for page in pages %}
            <li>{{ page.title }} ({{ page.slug }}) - <a href="{{ url_for('edit_page', id=page.id) }}">Edit</a></li>
        {% endfor %}
        </ul>
    </body>
    </html>
    ''', pages=pages)

@app.route('/admin/pages/add', methods=['POST'])
@login_required
def add_page():
    title = request.form['title']
    slug = request.form['slug']
    content = request.form['content']
    
    page = Page(title=title, slug=slug, content=content)
    db.session.add(page)
    db.session.commit()
    
    return redirect(url_for('manage_pages'))

# News management
@app.route('/admin/news')
@login_required
def manage_news():
    news = NewsItem.query.order_by(NewsItem.date.desc()).all()
    return render_template_string('''
    <!DOCTYPE html>
    <html>
    <head><title>Manage News</title></head>
    <body>
        <h1>Manage News</h1>
        <a href="{{ url_for('admin_dashboard') }}">Back to Dashboard</a>
        <h2>Add News Item</h2>
        <form method="post" action="{{ url_for('add_news') }}">
            <p>Title: <input type="text" name="title" required></p>
            <p>Content: <textarea name="content" rows="10" cols="50" required></textarea></p>
            <p><input type="submit" value="Add News"></p>
        </form>
        <h2>Existing News</h2>
        <ul>
        {% for item in news %}
            <li>{{ item.title }} - {{ item.date.strftime('%Y-%m-%d') }}</li>
        {% endfor %}
        </ul>
    </body>
    </html>
    ''', news=news)

@app.route('/admin/news/add', methods=['POST'])
@login_required
def add_news():
    title = request.form['title']
    content = request.form['content']
    
    news = NewsItem(title=title, content=content)
    db.session.add(news)
    db.session.commit()
    
    return redirect(url_for('manage_news'))

# Events management
@app.route('/admin/events')
@login_required
def manage_events():
    events = Event.query.order_by(Event.date.asc()).all()
    return render_template_string('''
    <!DOCTYPE html>
    <html>
    <head><title>Manage Events</title></head>
    <body>
        <h1>Manage Events</h1>
        <a href="{{ url_for('admin_dashboard') }}">Back to Dashboard</a>
        <h2>Add Event</h2>
        <form method="post" action="{{ url_for('add_event') }}">
            <p>Title: <input type="text" name="title" required></p>
            <p>Description: <textarea name="description" rows="5" cols="50" required></textarea></p>
            <p>Date: <input type="datetime-local" name="date" required></p>
            <p>Location: <input type="text" name="location"></p>
            <p><input type="submit" value="Add Event"></p>
        </form>
        <h2>Upcoming Events</h2>
        <ul>
        {% for event in events %}
            <li>{{ event.title }} - {{ event.date.strftime('%Y-%m-%d %H:%M') }} at {{ event.location or 'TBD' }}</li>
        {% endfor %}
        </ul>
    </body>
    </html>
    ''', events=events)

@app.route('/admin/events/add', methods=['POST'])
@login_required
def add_event():
    title = request.form['title']
    description = request.form['description']
    date_str = request.form['date']
    location = request.form['location']
    
    date = datetime.fromisoformat(date_str)
    event = Event(title=title, description=description, date=date, location=location)
    db.session.add(event)
    db.session.commit()
    
    return redirect(url_for('manage_events'))

# Root route
@app.route('/')
def index():
    return redirect(url_for('admin_dashboard'))

