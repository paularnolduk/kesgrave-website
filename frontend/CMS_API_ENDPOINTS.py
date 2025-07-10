# CMS API Endpoints for Kesgrave Website Integration
# Add these routes to your cms_final_complete.py file

from flask import jsonify

# Footer Links API Endpoint
@app.route('/api/footer-links', methods=['GET'])
def get_footer_links():
    """API endpoint to get footer links for the frontend website"""
    try:
        # You can customize these links or pull from database
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

# Header Links API Endpoint (Optional)
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

# Content Pages API Endpoint (Optional - for dynamic content)
@app.route('/api/content/<category>/<page>', methods=['GET'])
def get_content_page(category, page):
    """Get specific content page from CMS"""
    try:
        # Query your ContentPage model
        content_page = ContentPage.query.filter_by(
            category=category.replace('-', ' ').title(),
            slug=page
        ).first()
        
        if not content_page:
            return jsonify({'error': 'Page not found'}), 404
            
        return jsonify({
            'title': content_page.title,
            'content': content_page.content,
            'category': content_page.category,
            'last_updated': content_page.updated_at.isoformat() if content_page.updated_at else None,
            'status': content_page.status
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# CORS Support for Local Development
@app.after_request
def after_request(response):
    """Add CORS headers for local development"""
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Alternative: More flexible CORS for development
# from flask_cors import CORS
# CORS(app, origins=['http://localhost:5173'])

# Events API Endpoint (Optional - for dynamic events)
@app.route('/api/events', methods=['GET'])
def get_events():
    """Get events for the frontend website"""
    try:
        events = Event.query.filter_by(status='published').order_by(Event.date.desc()).all()
        events_data = []
        
        for event in events:
            events_data.append({
                'id': event.id,
                'title': event.title,
                'description': event.description,
                'date': event.date.isoformat() if event.date else None,
                'time': event.time,
                'location': event.location,
                'category': event.category
            })
        
        return jsonify(events_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Meetings API Endpoint (Optional - for dynamic meetings)
@app.route('/api/meetings/<meeting_type>', methods=['GET'])
def get_meetings(meeting_type):
    """Get meetings by type for the frontend website"""
    try:
        meetings = Meeting.query.filter_by(
            type=meeting_type.replace('-', ' ').title()
        ).order_by(Meeting.date.desc()).all()
        
        meetings_data = []
        for meeting in meetings:
            meetings_data.append({
                'id': meeting.id,
                'title': meeting.title,
                'date': meeting.date.isoformat() if meeting.date else None,
                'time': meeting.time,
                'location': meeting.location,
                'agenda_url': meeting.agenda_url,
                'minutes_url': meeting.minutes_url
            })
        
        return jsonify(meetings_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

