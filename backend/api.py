from flask import Flask, request, jsonify, session
from flask_cors import CORS
from pymongo import MongoClient
import os
from routes.patient_routes import patient_bp

# --- Initialize Flask App ---
app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
CORS(app, supports_credentials=True)

# --- Connect to MongoDB ---
client = MongoClient("mongodb://localhost:27017")
app.config["DATABASE"] = client["VisionCare"]

# --- Dummy Users (Replace with DB in production) ---
USERS = [
    {'id': 'doc01', 'designation': 'Doctor', 'password': 'doc-pass-01'},
    {'id': 'rec01', 'designation': 'Receptionist', 'password': 'rec-pass-01'},
    {'id': 'scan01', 'designation': 'Scanner', 'password': 'scan-pass-01'}
]

def get_user(user_id, password):
    return next((u for u in USERS if u['id'] == user_id and u['password'] == password), None)

def login_user(request):
    data = request.get_json()
    if not data or not data.get('id') or not data.get('password'):
        return jsonify({'error': 'Missing ID or password'}), 400

    user = get_user(data['id'], data['password'])
    if user:
        session['role'] = user['designation']
        session['user_id'] = user['id']
        return jsonify({'message': 'Login successful!', 'role': user['designation']}), 200
    else:
        return jsonify({'error': 'Invalid ID or password'}), 401

# --- Routes ---
@app.route('/api/login', methods=['POST'])
def login():
    return login_user(request)

@app.route('/api/logout', methods=['GET', 'POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logout successful'}), 200

@app.route('/api/protected_data')
def protected_data():
    if 'role' in session:
        return jsonify({'message': f'Welcome! You have access to {session["role"]}-specific data.'})
    return jsonify({'error': 'Unauthorized access'}), 401

@app.route('/api/status')
def status():
    return jsonify({"status": "API is running!"})

# --- Register Patient Blueprint ---
from patient_routes import patient_bp
app.register_blueprint(patient_bp, url_prefix="/api/patients")

# --- Run App ---
if __name__ == '__main__':
    app.run(debug=True)
