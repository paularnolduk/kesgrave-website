#!/usr/bin/env python3
"""
Main application entry point for Kesgrave CMS
"""

# Import the Flask app
from app import app

# Import all routes (this registers them with the app)
import routes

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
