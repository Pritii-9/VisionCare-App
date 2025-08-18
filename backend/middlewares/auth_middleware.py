from flask import request, jsonify

def require_auth(f):
    def wrapper(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or token != "Bearer your_token_here":
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper