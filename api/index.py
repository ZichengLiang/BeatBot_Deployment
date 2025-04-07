from flask import Flask, request, jsonify, Response
import sys
import os
import json

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

# Import necessary components from backend
try:
    from app import app as flask_app
except ImportError as e:
    print(f"Error importing Flask app: {e}")
    # Create a minimal app if import fails
    flask_app = Flask(__name__)
    
    @flask_app.route('/')
    def home():
        return jsonify({"status": "API is running", "error": "Main app could not be imported"})

def handler(request):
    """
    Vercel serverless function handler
    """
    # Get the path and method from the request
    path = request.get('path', '/')
    http_method = request.get('method', 'GET')
    
    # Create a test client for the Flask app
    with flask_app.test_client() as client:
        # Get query parameters
        query_params = request.get('query', {})
        
        # Get headers (excluding host)
        headers = {k: v for k, v in request.get('headers', {}).items() if k.lower() != 'host'}
        
        # Get body if present
        body = request.get('body', '')
        
        # Make the request to the Flask app
        response = client.open(
            path=path,
            method=http_method,
            headers=headers,
            query_string=query_params,
            data=body
        )
        
        # Convert the response to the format expected by Vercel
        return {
            'statusCode': response.status_code,
            'headers': dict(response.headers),
            'body': response.get_data(as_text=True)
        }
        
# For local development
if __name__ == '__main__':
    flask_app.run(debug=True) 