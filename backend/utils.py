import os
import bcrypt
import jwt
import uuid
import hashlib
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
from werkzeug.utils import secure_filename
import PyPDF2
from PIL import Image, ImageDraw, ImageFont
import io
import base64
import user_agents
import requests

def hash_password(password):
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def check_password(password, hashed):
    """Check a password against a hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_token(user_id):
    """Generate JWT token"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=1)
    }
    return jwt.encode(payload, os.getenv('JWT_SECRET_KEY', 'secret'), algorithm='HS256')

def verify_token(token):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, os.getenv('JWT_SECRET_KEY', 'secret'), algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def get_client_ip():
    """Get client IP address"""
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0]
    return request.remote_addr

def get_device_info(user_agent_string):
    """Parse user agent to get device info"""
    ua = user_agents.parse(user_agent_string)
    return {
        'device_type': 'mobile' if ua.is_mobile else 'tablet' if ua.is_tablet else 'desktop',
        'browser': ua.browser.family,
        'os': ua.os.family,
        'device': ua.device.family
    }

def get_location(ip):
    """Get location from IP (simplified - use a proper IP geolocation service)"""
    try:
        response = requests.get(f'http://ip-api.com/json/{ip}')
        if response.status_code == 200:
            data = response.json()
            return f"{data.get('city', '')}, {data.get('country', '')}"
    except:
        pass
    return 'Unknown'

def add_watermark_to_pdf(pdf_path, watermark_text):
    """Add watermark to PDF"""
    # This is a simplified version - you'd need a proper PDF library
    return pdf_path

def add_watermark_to_image(image_path, watermark_text):
    """Add watermark to image"""
    try:
        img = Image.open(image_path)
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Create a transparent layer for watermark
        watermark = Image.new('RGBA', img.size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(watermark)
        
        # Use default font
        try:
            font = ImageFont.truetype("arial.ttf", 36)
        except:
            font = ImageFont.load_default()
        
        # Calculate text size and position
        text_bbox = draw.textbbox((0, 0), watermark_text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        
        # Position at center with 45-degree rotation effect
        x = (img.width - text_width) // 2
        y = (img.height - text_height) // 2
        
        # Draw watermark with transparency
        for i in range(0, img.width, text_width + 50):
            for j in range(0, img.height, text_height + 50):
                draw.text((i, j), watermark_text, fill=(128, 128, 128, 128), font=font)
        
        # Composite the images
        watermarked = Image.alpha_composite(img, watermark)
        watermarked = watermarked.convert('RGB')
        watermarked.save(image_path)
        
        return image_path
    except Exception as e:
        print(f"Error adding watermark: {e}")
        return image_path

def validate_device_access(device_restriction, user_agent_string):
    """Validate if device type is allowed"""
    device_info = get_device_info(user_agent_string)
    device_type = device_info['device_type']
    
    if device_restriction == 'mobile' and device_type != 'mobile':
        return False, "This document can only be accessed from mobile devices"
    elif device_restriction == 'desktop' and device_type == 'mobile':
        return False, "This document can only be accessed from desktop/laptop devices"
    
    return True, "Device access granted"

def generate_unique_filename(original_filename):
    """Generate a unique filename"""
    ext = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else ''
    return f"{uuid.uuid4().hex}.{ext}" if ext else uuid.uuid4().hex

def format_file_size(size_bytes):
    """Format file size to human readable format"""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    elif size_bytes < 1024 * 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    else:
        return f"{size_bytes / (1024 * 1024 * 1024):.1f} GB"
