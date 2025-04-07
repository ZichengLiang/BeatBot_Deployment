from functools import wraps
from flask import request, jsonify
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"message": "No authorization header provided"}), 401
        
        try: 
            # Extract the token from the auth header
            token = auth_header.split(" ")[1]
            # Verify the token with supabase
            user = supabase.auth.get_user(token)
            # Add user to the request context
            request.user = user
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"message": "Invalid token"}), 401
        
    return decorated


