#!/usr/bin/env python3
"""
Startup script for the Comic Generation Server
"""
import os
import sys
from app import app

def check_environment():
    """Check if all required environment variables are set"""
    required_vars = [
        'GROQ_API_KEY',
        'STABILITY_KEY', 
        'IMGBB_API_KEY'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease set these variables in your .env file")
        return False
    
    return True

def main():
    print("🎨 Starting Comic Generation Server...")
    
    if not check_environment():
        sys.exit(1)
    
    # Get port and host from environment variables
    port = int(os.getenv('PORT', 5001))
    host = os.getenv('HOST', '0.0.0.0')
    
    print("✅ Environment check passed")
    print(f"🚀 Server starting on http://{host}:{port}")
    
    app.run(debug=True, port=port, host=host)

if __name__ == '__main__':
    main()