from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='user')  # 'user' or 'admin'
    is_verified = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    profile_image = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    documents = db.relationship('Document', backref='owner', lazy=True)
    activity_logs = db.relationship('ActivityLog', backref='user', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'full_name': self.full_name,
            'username': self.username,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'is_verified': self.is_verified,
            'is_active': self.is_active,
            'profile_image': self.profile_image,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'documents_count': len(self.documents)
        }

class Document(db.Model):
    __tablename__ = 'documents'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    filename = db.Column(db.String(200), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer)  # in bytes
    file_type = db.Column(db.String(50))
    category = db.Column(db.String(50))
    tags = db.Column(db.String(200))
    
    # Security Settings
    expiry_date = db.Column(db.DateTime)
    view_limit = db.Column(db.Integer, default=0)  # 0 = unlimited
    current_views = db.Column(db.Integer, default=0)
    password_protected = db.Column(db.Boolean, default=False)
    document_password = db.Column(db.String(200))
    watermark_enabled = db.Column(db.Boolean, default=False)
    device_restriction = db.Column(db.String(20), default='both')  # 'mobile', 'desktop', 'both'
    allow_download = db.Column(db.Boolean, default=True)
    allow_print = db.Column(db.Boolean, default=True)
    
    # Tracking
    unique_token = db.Column(db.String(100), unique=True, default=lambda: str(uuid.uuid4()))
    is_active = db.Column(db.Boolean, default=True)
    is_shared = db.Column(db.Boolean, default=False)
    views_count = db.Column(db.Integer, default=0)
    downloads_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    
    access_logs = db.relationship('AccessLog', backref='document', lazy=True)
    
    @property
    def status(self):
        if not self.is_active:
            return 'inactive'
        if self.expiry_date and self.expiry_date < datetime.utcnow():
            return 'expired'
        if self.view_limit > 0 and self.current_views >= self.view_limit:
            return 'limit_reached'
        return 'active'
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'filename': self.filename,
            'file_size': self.file_size,
            'file_type': self.file_type,
            'category': self.category,
            'tags': self.tags,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'view_limit': self.view_limit,
            'current_views': self.current_views,
            'password_protected': self.password_protected,
            'watermark_enabled': self.watermark_enabled,
            'device_restriction': self.device_restriction,
            'allow_download': self.allow_download,
            'allow_print': self.allow_print,
            'unique_token': self.unique_token,
            'is_active': self.is_active,
            'is_shared': self.is_shared,
            'views_count': self.views_count,
            'downloads_count': self.downloads_count,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user_id': self.user_id,
            'shareable_link': f"/share/{self.unique_token}"
        }

class ActivityLog(db.Model):
    __tablename__ = 'activity_logs'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    document_id = db.Column(db.String(36), db.ForeignKey('documents.id'))
    action = db.Column(db.String(50))  # 'upload', 'view', 'download', 'print', 'share', 'delete', etc.
    ip_address = db.Column(db.String(50))
    user_agent = db.Column(db.String(200))
    device_type = db.Column(db.String(50))
    browser = db.Column(db.String(50))
    os = db.Column(db.String(50))
    location = db.Column(db.String(100))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='success')
    details = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'document_id': self.document_id,
            'action': self.action,
            'ip_address': self.ip_address,
            'device_type': self.device_type,
            'browser': self.browser,
            'os': self.os,
            'location': self.location,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'status': self.status,
            'details': self.details
        }

class AccessLog(db.Model):
    __tablename__ = 'access_logs'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = db.Column(db.String(36), db.ForeignKey('documents.id'), nullable=False)
    access_type = db.Column(db.String(20))  # 'view', 'download', 'print'
    ip_address = db.Column(db.String(50))
    user_agent = db.Column(db.String(200))
    device_type = db.Column(db.String(50))
    browser = db.Column(db.String(50))
    os = db.Column(db.String(50))
    location = db.Column(db.String(100))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    success = db.Column(db.Boolean, default=True)
    failure_reason = db.Column(db.String(200))
    
    def to_dict(self):
        return {
            'id': self.id,
            'document_id': self.document_id,
            'access_type': self.access_type,
            'ip_address': self.ip_address,
            'device_type': self.device_type,
            'browser': self.browser,
            'os': self.os,
            'location': self.location,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'success': self.success,
            'failure_reason': self.failure_reason
        }
