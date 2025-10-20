#!/usr/bin/env python3
"""
Run script for the Grant Tag System backend
"""

from app import app, init_db

if __name__ == '__main__':
    print("Starting Grant Tag System Backend...")
    print("Backend will be available at: http://localhost:5000")
    print("API documentation available at: http://localhost:5000/api/health")
    print("Press Ctrl+C to stop the server")
    
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
