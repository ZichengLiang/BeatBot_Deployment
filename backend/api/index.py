from http.server import BaseHTTPRequestHandler
import sys
import os

# Add the parent directory to the path so we can import from app.py
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(parent_dir)

# Import the Flask app
from app import app

# Create a handler for Vercel serverless functions
class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write(b'Flask API is running')
        
    def do_POST(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(b'{"message": "POST request received"}')

# For local development
if __name__ == '__main__':
    app.run(debug=True) 