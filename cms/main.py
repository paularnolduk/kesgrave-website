#!/usr/bin/env python3
"""
Main application entry point for Kesgrave CMS
This file imports the app configuration and all routes
"""

from app import app, db
import cms_routes  # This imports all the routes

# Create database tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    # This is for local development only
    # In production, Gunicorn will import this file and use the 'app' object
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)

