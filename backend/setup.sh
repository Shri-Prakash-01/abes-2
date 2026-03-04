#!/bin/bash

echo "Setting up Secure Vault Backend..."

# Check Python version
python_version=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
echo "Python version: $python_version"

# Install system dependencies (for macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Installing system dependencies for macOS..."
    brew install libjpeg libtiff little-cms2 openjpeg
fi

# Install Python packages
echo "Installing Python packages..."
pip install --upgrade pip
pip install Flask==3.0.0
pip install Flask-CORS==4.0.1
pip install Flask-SQLAlchemy==3.1.1
pip install Flask-JWT-Extended==4.6.0
pip install bcrypt==4.1.2
pip install python-dotenv==1.0.0
pip install Werkzeug==3.0.1
pip install PyPDF2==3.0.1
pip install user-agents==2.2.0
pip install qrcode==7.4.2
pip install redis==5.0.1
pip install celery==5.3.4
pip install Flask-Limiter==3.5.0
pip install python-magic==0.4.27

# Install Pillow separately with binary only option
pip install --only-binary=:all: Pillow==10.1.0

echo "Setup complete!"

# Create uploads directory
mkdir -p uploads

# Initialize database
python -c "from app import app; from models import db; app.app_context().push(); db.create_all()"

echo "Database initialized!"
