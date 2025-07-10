import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# Database configuration
if os.environ.get('DATABASE_URL'):
    # Production database (PostgreSQL on Render)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
else:
    # Development database (SQLite)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///kesgrave_cms.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# File upload configuration
app.config['UPLOAD_FOLDER'] = os.environ.get('UPLOAD_FOLDER', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize extensions
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# CORS configuration
if os.environ.get('FLASK_ENV') == 'production':
    # Production CORS - specify allowed origins
    frontend_url = os.environ.get('FRONTEND_URL', 'https://your-frontend-domain.onrender.com')
    CORS(app, origins=[frontend_url])
else:
    # Development CORS - allow all origins
    CORS(app, origins=['http://localhost:5173', 'http://127.0.0.1:5173'])

# Import the rest of the application after app initialization
# This prevents circular imports
if __name__ == '__main__':
    # Development server
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
else:
    # Production server (Gunicorn)
    pass

