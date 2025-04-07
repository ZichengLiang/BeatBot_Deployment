import sys
import os

# Add the parent directory to the path so we can import from app.py
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(parent_dir)

# Import the Flask app
from app import app

# For Vercel deployment
from flask import Flask, jsonify, request

# Create a handler for Vercel serverless functions
def handler(event, context):
    return app(event, context)

# For local development
if __name__ == '__main__':
    app.run(debug=True) 