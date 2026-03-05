from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
import os
from flask import Flask, request, jsonify, send_file
import bcrypt
import uuid
import json
from models import db, User, Document, ActivityLog, AccessLog
from utils import *
from functools import wraps

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['JWT_SECRET_KEY'] = 'jwt-secret-key-change-in-production'# Database configuration for Render (PostgreSQL)
database_url = os.environ.get('DATABASE_URL', 'sqlite:///secure_vault.db')
if database_url and database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size

# Initialize extensions
CORS(app)
jwt = JWTManager(app)
db.init_app(app)
limiter = Limiter(app=app, key_func=get_remote_address)

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'}

def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ==================== AUTHENTICATION ROUTES ====================

@app.route('/api/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['full_name', 'username', 'email', 'password', 'confirm_password']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    if data['password'] != data['confirm_password']:
        return jsonify({'error': 'Passwords do not match'}), 400
    
    # Check if user exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 400
    
    # Create new user
    user = User(
        full_name=data['full_name'],
        username=data['username'],
        email=data['email'],
        phone=data.get('phone', ''),
        password_hash=hash_password(data['password']),
        role='user'  # Default role
    )
    
    db.session.add(user)
    db.session.commit()
    
    # Log activity
    log = ActivityLog(
        user_id=user.id,
        action='register',
        ip_address=get_client_ip(),
        user_agent=request.headers.get('User-Agent'),
        **get_device_info(request.headers.get('User-Agent', ''))
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'message': 'Registration successful',
        'user': user.to_dict()
    }), 201

@app.route('/api/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    data = request.get_json()
    
    if not data.get('username_or_email') or not data.get('password'):
        return jsonify({'error': 'Username/Email and password required'}), 400
    
    # Find user by email or username
    user = User.query.filter(
        (User.email == data['username_or_email']) | 
        (User.username == data['username_or_email'])
    ).first()
    
    if not user or not check_password(data['password'], user.password_hash):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    if not user.is_active:
        return jsonify({'error': 'Account is deactivated'}), 403
    
    # Update last login
    user.last_login = datetime.utcnow()
    
    # Log activity
    log = ActivityLog(
        user_id=user.id,
        action='login',
        ip_address=get_client_ip(),
        user_agent=request.headers.get('User-Agent'),
        **get_device_info(request.headers.get('User-Agent', ''))
    )
    db.session.add(log)
    db.session.commit()
    
    # Create access token
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': user.to_dict()
    }), 200

# ==================== USER DASHBOARD ROUTES ====================

@app.route('/api/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    documents = Document.query.filter_by(user_id=current_user_id).all()
    
    total_documents = len(documents)
    total_views = sum(doc.views_count for doc in documents)
    total_downloads = sum(doc.downloads_count for doc in documents)
    active_links = sum(1 for doc in documents if doc.status == 'active')
    
    # Document type distribution
    type_distribution = {}
    for doc in documents:
        ext = doc.file_type or 'unknown'
        type_distribution[ext] = type_distribution.get(ext, 0) + 1
    
    return jsonify({
        'total_documents': total_documents,
        'total_views': total_views,
        'total_downloads': total_downloads,
        'active_links': active_links,
        'type_distribution': type_distribution,
        'recent_activity': get_recent_activity(current_user_id)
    }), 200

@app.route('/api/documents', methods=['GET'])
@jwt_required()
def get_documents():
    current_user_id = get_jwt_identity()
    
    # Get query parameters
    search = request.args.get('search', '')
    filter_type = request.args.get('filter', 'all')
    category = request.args.get('category', '')
    
    query = Document.query.filter_by(user_id=current_user_id)
    
    if search:
        query = query.filter(Document.title.contains(search))
    
    if filter_type != 'all':
        if filter_type == 'active':
            query = query.filter(Document.is_active == True)
        elif filter_type == 'expired':
            query = query.filter(Document.expiry_date < datetime.utcnow())
        elif filter_type == 'limit_reached':
            query = query.filter(Document.view_limit > 0, Document.current_views >= Document.view_limit)
        elif filter_type == 'shared':
            query = query.filter(Document.is_shared == True)
    
    if category:
        query = query.filter_by(category=category)
    
    documents = query.order_by(Document.created_at.desc()).all()
    
    return jsonify({
        'documents': [doc.to_dict() for doc in documents]
    }), 200

@app.route('/api/documents/<document_id>', methods=['GET'])
@jwt_required()
def get_document(document_id):
    current_user_id = get_jwt_identity()
    
    document = Document.query.filter_by(id=document_id, user_id=current_user_id).first()
    
    if not document:
        return jsonify({'error': 'Document not found'}), 404
    
    return jsonify(document.to_dict()), 200

@app.route('/api/documents/<document_id>/activity', methods=['GET'])
@jwt_required()
def get_document_activity(document_id):
    current_user_id = get_jwt_identity()
    
    document = Document.query.filter_by(id=document_id, user_id=current_user_id).first()
    
    if not document:
        return jsonify({'error': 'Document not found'}), 404
    
    logs = AccessLog.query.filter_by(document_id=document_id).order_by(AccessLog.timestamp.desc()).limit(50).all()
    
    return jsonify({
        'logs': [log.to_dict() for log in logs]
    }), 200

# ==================== UPLOAD ROUTES ====================

@app.route('/api/upload', methods=['POST'])
@jwt_required()
@limiter.limit("20 per hour")
def upload_file():
    current_user_id = get_jwt_identity()
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    # Get form data
    title = request.form.get('title', file.filename)
    description = request.form.get('description', '')
    category = request.form.get('category', '')
    tags = request.form.get('tags', '')
    
    # Security settings
    expiry_days = int(request.form.get('expiry_days', 0))
    view_limit = int(request.form.get('view_limit', 0))
    password_protected = request.form.get('password_protected') == 'true'
    document_password = request.form.get('document_password', '') if password_protected else None
    watermark_enabled = request.form.get('watermark_enabled') == 'true'
    device_restriction = request.form.get('device_restriction', 'both')
    allow_download = request.form.get('allow_download') != 'false'
    allow_print = request.form.get('allow_print') != 'false'
    
    # Save file securely
    original_filename = secure_filename(file.filename)
    unique_filename = generate_unique_filename(original_filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    file.save(file_path)
    
    # Calculate expiry date
    expiry_date = None
    if expiry_days > 0:
        expiry_date = datetime.utcnow() + timedelta(days=expiry_days)
    
    # Create document record
    document = Document(
        title=title,
        description=description,
        filename=original_filename,
        file_path=file_path,
        file_size=os.path.getsize(file_path),
        file_type=original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else 'unknown',
        category=category,
        tags=tags,
        expiry_date=expiry_date,
        view_limit=view_limit,
        password_protected=password_protected,
        document_password=hash_password(document_password) if document_password else None,
        watermark_enabled=watermark_enabled,
        device_restriction=device_restriction,
        allow_download=allow_download,
        allow_print=allow_print,
        user_id=current_user_id
    )
    
    db.session.add(document)
    
    # Log activity
    log = ActivityLog(
        user_id=current_user_id,
        document_id=document.id,
        action='upload',
        ip_address=get_client_ip(),
        user_agent=request.headers.get('User-Agent'),
        **get_device_info(request.headers.get('User-Agent', ''))
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'message': 'File uploaded successfully',
        'document': document.to_dict()
    }), 201

# ==================== SHARED LINK ROUTES ====================

@app.route('/api/share/<token>', methods=['GET'])
def access_shared_document(token):
    document = Document.query.filter_by(unique_token=token, is_active=True).first()
    
    if not document:
        return jsonify({'error': 'Document not found or access revoked'}), 404
    
    # Check if document is expired
    if document.expiry_date and document.expiry_date < datetime.utcnow():
        return jsonify({'error': 'Document link has expired'}), 403
    
    # Check view limit
    if document.view_limit > 0 and document.current_views >= document.view_limit:
        return jsonify({'error': 'View limit reached'}), 403
    
    # Check device restriction
    device_valid, device_message = validate_device_access(
        document.device_restriction, 
        request.headers.get('User-Agent', '')
    )
    if not device_valid:
        return jsonify({'error': device_message}), 403
    
    # Get client info
    ip = get_client_ip()
    user_agent = request.headers.get('User-Agent', '')
    device_info = get_device_info(user_agent)
    
    # Check if document requires password
    if document.password_protected:
        # Return that password is required
        return jsonify({
            'requires_password': True,
            'document_id': document.id,
            'document_info': {
                'title': document.title,
                'filename': document.filename,
                'file_size': document.file_size,
                'file_type': document.file_type,
                'views_count': document.views_count,
                'downloads_count': document.downloads_count,
                'allow_download': document.allow_download,
                'allow_print': document.allow_print
            }
        }), 200
    
    # No password required, return document info
    return jsonify({
        'requires_password': False,
        'document_id': document.id,
        'document_info': {
            'title': document.title,
            'filename': document.filename,
            'file_size': document.file_size,
            'file_type': document.file_type,
            'views_count': document.views_count,
            'downloads_count': document.downloads_count,
            'allow_download': document.allow_download,
            'allow_print': document.allow_print
        }
    }), 200

@app.route('/api/share/<token>/verify-password', methods=['POST'])
def verify_document_password(token):
    data = request.get_json()
    password = data.get('password')
    
    document = Document.query.filter_by(unique_token=token).first()
    
    if not document or not document.password_protected:
        return jsonify({'error': 'Invalid request'}), 400
    
    if not document.document_password or not check_password(password, document.document_password):
        return jsonify({'error': 'Invalid password'}), 401
    
    return jsonify({'message': 'Password verified'}), 200

@app.route('/api/share/<token>/view', methods=['POST'])
def view_document(token):
    document = Document.query.filter_by(unique_token=token, is_active=True).first()
    
    if not document:
        return jsonify({'error': 'Document not found'}), 404
    
    # Check all access conditions
    if document.expiry_date and document.expiry_date < datetime.utcnow():
        return jsonify({'error': 'Document expired'}), 403
    
    if document.view_limit > 0 and document.current_views >= document.view_limit:
        return jsonify({'error': 'View limit reached'}), 403
    
    device_valid, device_message = validate_device_access(
        document.device_restriction, 
        request.headers.get('User-Agent', '')
    )
    if not device_valid:
        return jsonify({'error': device_message}), 403
    
    # Get client info
    ip = get_client_ip()
    user_agent = request.headers.get('User-Agent', '')
    device_info = get_device_info(user_agent)
    
    # Check if password required (should be verified in previous step)
    data = request.get_json() or {}
    if document.password_protected and not data.get('password_verified'):
        return jsonify({'error': 'Password required'}), 401
    
    # Increment view count
    document.current_views += 1
    document.views_count += 1
    
    # Log access
    access_log = AccessLog(
        document_id=document.id,
        access_type='view',
        ip_address=ip,
        user_agent=user_agent,
        **device_info,
        location=get_location(ip),
        success=True
    )
    db.session.add(access_log)
    db.session.commit()
    
    # For secure viewing, we'll return the file with appropriate headers
    if document.watermark_enabled:
        # Create a watermarked version for viewing
        # This is simplified - you'd want to create a temporary copy with watermark
        return send_file(
            document.file_path,
            download_name=document.filename,
            as_attachment=False
        )
    
    return send_file(
        document.file_path,
        download_name=document.filename,
        as_attachment=False
    )

@app.route('/api/share/<token>/download', methods=['POST'])
def download_document(token):
    document = Document.query.filter_by(unique_token=token, is_active=True).first()
    
    if not document:
        return jsonify({'error': 'Document not found'}), 404
    
    if not document.allow_download:
        return jsonify({'error': 'Download not allowed for this document'}), 403
    
    # Check all access conditions
    if document.expiry_date and document.expiry_date < datetime.utcnow():
        return jsonify({'error': 'Document expired'}), 403
    
    if document.view_limit > 0 and document.current_views >= document.view_limit:
        return jsonify({'error': 'View limit reached'}), 403
    
    device_valid, device_message = validate_device_access(
        document.device_restriction, 
        request.headers.get('User-Agent', '')
    )
    if not device_valid:
        return jsonify({'error': device_message}), 403
    
    # Get client info
    ip = get_client_ip()
    user_agent = request.headers.get('User-Agent', '')
    device_info = get_device_info(user_agent)
    
    # Increment download count
    document.downloads_count += 1
    
    # Log access
    access_log = AccessLog(
        document_id=document.id,
        access_type='download',
        ip_address=ip,
        user_agent=user_agent,
        **device_info,
        location=get_location(ip),
        success=True
    )
    db.session.add(access_log)
    db.session.commit()
    
    return send_file(
        document.file_path,
        download_name=document.filename,
        as_attachment=True
    )

# ==================== ADMIN ROUTES ====================

@app.route('/api/admin/stats', methods=['GET'])
@admin_required
def get_admin_stats():
    # Total counts
    total_users = User.query.count()
    total_documents = Document.query.count()
    active_links = Document.query.filter_by(is_active=True).count()
    total_logins_today = ActivityLog.query.filter(
        ActivityLog.action == 'login',
        ActivityLog.timestamp >= datetime.utcnow().date()
    ).count()
    
    # Upload percentage (today vs yesterday)
    today_uploads = Document.query.filter(
        Document.created_at >= datetime.utcnow().date()
    ).count()
    yesterday_uploads = Document.query.filter(
        Document.created_at >= datetime.utcnow().date() - timedelta(days=1),
        Document.created_at < datetime.utcnow().date()
    ).count()
    
    upload_percentage = 0
    if yesterday_uploads > 0:
        upload_percentage = ((today_uploads - yesterday_uploads) / yesterday_uploads) * 100
    
    # File type distribution
    file_types = {}
    for doc in Document.query.all():
        ext = doc.file_type or 'unknown'
        file_types[ext] = file_types.get(ext, 0) + 1
    
    # Recent registrations
    recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()
    
    # Recent documents
    recent_documents = Document.query.order_by(Document.created_at.desc()).limit(5).all()
    
    # Recent activities
    recent_activities = ActivityLog.query.order_by(ActivityLog.timestamp.desc()).limit(10).all()
    
    return jsonify({
        'total_users': total_users,
        'total_documents': total_documents,
        'active_links': active_links,
        'total_logins_today': total_logins_today,
        'upload_percentage': upload_percentage,
        'file_type_distribution': file_types,
        'recent_users': [user.to_dict() for user in recent_users],
        'recent_documents': [doc.to_dict() for doc in recent_documents],
        'recent_activities': [log.to_dict() for log in recent_activities]
    }), 200

@app.route('/api/admin/users', methods=['GET'])
@admin_required
def get_all_users():
    users = User.query.all()
    return jsonify({
        'users': [user.to_dict() for user in users]
    }), 200

@app.route('/api/admin/users/<user_id>', methods=['GET'])
@admin_required
def get_user_details(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    documents = Document.query.filter_by(user_id=user_id).all()
    activity_logs = ActivityLog.query.filter_by(user_id=user_id).order_by(ActivityLog.timestamp.desc()).limit(50).all()
    
    return jsonify({
        'user': user.to_dict(),
        'documents': [doc.to_dict() for doc in documents],
        'activity_logs': [log.to_dict() for log in activity_logs]
    }), 200

@app.route('/api/admin/users/<user_id>/status', methods=['PUT'])
@admin_required
def update_user_status(user_id):
    data = request.get_json()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if 'is_active' in data:
        user.is_active = data['is_active']
    
    if 'role' in data:
        user.role = data['role']
    
    db.session.commit()
    
    return jsonify({
        'message': 'User updated successfully',
        'user': user.to_dict()
    }), 200

@app.route('/api/admin/documents', methods=['GET'])
@admin_required
def get_all_documents():
    documents = Document.query.order_by(Document.created_at.desc()).all()
    return jsonify({
        'documents': [doc.to_dict() for doc in documents]
    }), 200

@app.route('/api/admin/documents/<document_id>', methods=['DELETE'])
@admin_required
def admin_delete_document(document_id):
    document = Document.query.get(document_id)
    
    if not document:
        return jsonify({'error': 'Document not found'}), 404
    
    # Delete file
    try:
        os.remove(document.file_path)
    except:
        pass
    
    db.session.delete(document)
    db.session.commit()
    
    return jsonify({'message': 'Document deleted successfully'}), 200

@app.route('/api/admin/activity-logs', methods=['GET'])
@admin_required
def get_system_logs():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    logs = ActivityLog.query.order_by(ActivityLog.timestamp.desc()).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'logs': [log.to_dict() for log in logs.items],
        'total': logs.total,
        'pages': logs.pages,
        'current_page': logs.page
    }), 200

# ==================== PROFILE ROUTES ====================

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200

@app.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    data = request.get_json()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Update allowed fields
    if 'full_name' in data:
        user.full_name = data['full_name']
    if 'phone' in data:
        user.phone = data['phone']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    }), 200

@app.route('/api/profile/change-password', methods=['POST'])
@jwt_required()
def change_password():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    data = request.get_json()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Verify current password
    if not check_password(data['current_password'], user.password_hash):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    # Update password
    user.password_hash = hash_password(data['new_password'])
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'}), 200

# ==================== UTILITY FUNCTIONS ====================

def get_recent_activity(user_id):
    logs = ActivityLog.query.filter_by(user_id=user_id).order_by(ActivityLog.timestamp.desc()).limit(10).all()
    return [log.to_dict() for log in logs]

# ==================== INITIALIZATION ====================

# Remove the @app.before_first_request decorator and use with app.app_context():
# ==================== INITIALIZATION ====================

# Create tables and admin user on startup
# ==================== INITIALIZATION ====================

def init_db():
    with app.app_context():
        db.create_all()
        
        # Create admin user if not exists
        admin = User.query.filter_by(role='admin').first()
        if not admin:
            admin = User(
                full_name='System Admin',
                username='admin',
                email='admin@securevault.com',
                password_hash=hash_password('Admin@123'),
                role='admin',
                is_verified=True
            )
            db.session.add(admin)
            db.session.commit()
            print("✅ Admin user created successfully")
        else:
            print("✅ Admin user already exists")

# Initialize database on startup
init_db()
if __name__ == '__main__':
    print("🚀 Secure Vault Backend Starting...")
    print(f"📁 Upload folder: {app.config['UPLOAD_FOLDER']}")
    print(f"🗄️  Database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    print("=" * 50)
    port = int(os.environ.get('PORT', 5000))  # Render ka PORT use karo
    app.run(host='0.0.0.0', port=port)  # 0.0.0.0 par listen karo
