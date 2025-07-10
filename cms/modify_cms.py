#!/usr/bin/env python3
"""
Script to modify the original CMS file for production deployment
"""

def modify_cms_file():
    # Read the original file
    with open('cms_routes.py', 'r') as f:
        content = f.read()
    
    # Remove the original app initialization and imports
    lines = content.split('\n')
    modified_lines = []
    skip_until_route = False
    
    for i, line in enumerate(lines):
        # Skip the original imports and app initialization
        if i < 20 and ('from flask import Flask' in line or 
                      'app = Flask(__name__)' in line or
                      'from flask_cors import CORS' in line):
            continue
            
        # Replace the original app initialization with import
        if i == 0:
            modified_lines.append('from app import app, db, login_manager')
            modified_lines.append('from flask import render_template_string, redirect, url_for, request, flash, jsonify, send_from_directory')
            modified_lines.append('from flask_login import UserMixin, login_user, logout_user, login_required, current_user')
            modified_lines.append('from datetime import datetime, timedelta')
            modified_lines.append('from dateutil.relativedelta import relativedelta')
            modified_lines.append('import os')
            modified_lines.append('import re')
            modified_lines.append('import json')
            modified_lines.append('import uuid')
            modified_lines.append('from werkzeug.utils import secure_filename')
            modified_lines.append('from flask import make_response')
            modified_lines.append('')
            
        # Skip the duplicate app.run() calls
        if 'app.run(' in line:
            continue
            
        # Skip the if __name__ == '__main__' blocks
        if "if __name__ == '__main__':" in line:
            skip_until_route = True
            continue
            
        if skip_until_route and line.strip().startswith('@app.route'):
            skip_until_route = False
            
        if not skip_until_route:
            modified_lines.append(line)
    
    # Write the modified content
    with open('cms_routes.py', 'w') as f:
        f.write('\n'.join(modified_lines))
    
    print("CMS file modified successfully!")

if __name__ == '__main__':
    modify_cms_file()

