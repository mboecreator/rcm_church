#!/usr/bin/env python3
"""
Quick start script for RCMI Church Management System
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required Python packages"""
    print("📦 Installing Python packages...")
    try:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
        print("✅ All packages installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing packages: {e}")
        return False

def start_server():
    """Start the Flask server"""
    print("🚀 Starting RCMI Church Management System...")
    print("=" * 60)
    print("📊 Admin Panel: http://localhost:5000/admin")
    print("🏠 Public Site: http://localhost:5000")
    print("🔑 Default Login: admin@rcmi.org / admin123")
    print("=" * 60)
    print("Press Ctrl+C to stop the server")
    print()
    
    try:
        subprocess.run([sys.executable, 'app.py'])
    except KeyboardInterrupt:
        print("\n👋 Server stopped. Goodbye!")

if __name__ == '__main__':
    print("🏛️  RCMI Church Management System")
    print("=" * 40)
    
    # Check if requirements.txt exists
    if not os.path.exists('requirements.txt'):
        print("❌ requirements.txt not found!")
        sys.exit(1)
    
    # Install requirements
    if install_requirements():
        print()
        start_server()
    else:
        print("❌ Failed to install requirements. Please check your Python installation.")
        sys.exit(1)