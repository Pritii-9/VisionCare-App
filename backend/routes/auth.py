from flask import Blueprint, request, jsonify, session, current_app
import os

auth_bp = Blueprint('auth_bp', __name__)

# A secret key is required for session management. 
# It's better to set this once on the main app object.
# We'll assume the main app.py sets app.config['SECRET_KEY'] = os.urandom(24)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Processes the login request and sets a session."""
    db = current_app.config["DATABASE"]
    data = request.get_json()

    if not data or not data.get('id') or not data.get('password'):
        return jsonify({'error': 'Missing ID or password'}), 400

    user_id = data.get('id')
    password = data.get('password')
    
    # Find user in the 'users' collection in MongoDB
    users_collection = db.users
    user = users_collection.find_one({"id": user_id, "password": password})

    if user:
        # Store user's role and ID in the session
        session['role'] = user['designation']
        session['user_id'] = user['id']
        return jsonify({
            'message': 'Login successful!',
            'role': user['designation']
        }), 200
    else:
        return jsonify({'error': 'Invalid ID or password'}), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Clears the user session."""
    session.clear()
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/protected_data')
def protected_data():
    """An example of a protected route that requires a session."""
    if 'role' in session:
        role = session['role']
        return jsonify({'message': f'Welcome! You have access to {role}-specific data.'})
    else:
        return jsonify({'error': 'Unauthorized access'}), 401