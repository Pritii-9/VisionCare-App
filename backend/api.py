from flask import Flask, request, jsonify, session
from flask_cors import CORS
import os # Used to generate a secret key

# --- Initialize the Flask Application ---
app = Flask(__name__)
# A secret key is required for session management
app.config['SECRET_KEY'] = os.urandom(24)
CORS(app, supports_credentials=True) # Enable CORS and allow credentials

# --- Models (Data Handling) ---
# In a real application, this would connect to a database.
USERS = [
    {'id': 'doc01', 'designation': 'Doctor', 'password': 'doc-pass-01'},
    {'id': 'rec01', 'designation': 'Receptionist', 'password': 'rec-pass-01'},
    {'id': 'scan01', 'designation': 'Scanner', 'password': 'scan-pass-01'}
]

def get_user(user_id, password):
    """Finds a user by their ID and password."""
    user = next((u for u in USERS if u['id'] == user_id and u['password'] == password), None)
    return user

# --- Controllers (Business Logic) ---
def login_user(request):
    """Processes the login request and sets a session."""
    data = request.get_json()
    if not data or not data.get('id') or not data.get('password'):
        return jsonify({'error': 'Missing ID or password'}), 400

    user_id = data.get('id')
    password = data.get('password')
    user = get_user(user_id, password)

    if user:
        # Store user's role in the session
        session['role'] = user['designation']
        session['user_id'] = user['id']
        return jsonify({
            'message': 'Login successful!',
            'role': user['designation']
        }), 200
    else:
        return jsonify({'error': 'Invalid ID or password'}), 401

# --- Routes (API Endpoints) ---
@app.route('/api/login', methods=['POST'])
def login():
    """Route to handle user login."""
    return login_user(request)

@app.route('/api/logout', methods=['GET', 'POST'])
def logout():
    """Clears the user session."""
    session.clear()
    return jsonify({'message': 'Logout successful'}), 200

@app.route('/api/protected_data')
def protected_data():
    """An example of a protected route that requires a session."""
    if 'role' in session:
        role = session['role']
        # Return data specific to the user's role
        return jsonify({'message': f'Welcome! You have access to {role}-specific data.'})
    else:
        # If no user is in the session, return an unauthorized error
        return jsonify({'error': 'Unauthorized access'}), 401

@app.route('/api/status')
def status():
    """A simple route to check if the API is running."""
    return jsonify({"status": "API is running!"})

# --- Run the Application ---
if __name__ == '__main__':
    # This allows the script to be run directly with `python api.py`
    app.run(debug=True)
