import os
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)

# --- CORS ---
CORS(
    app,
    resources={r"/api/*": {"origins": ["http://localhost:5173", "[http://127.0.0.1:5173](http://127.0.0.1:5173)"]}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# Avoid redirect between /path and /path/
app.url_map.strict_slashes = False

# --- MongoDB ---
try:
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/visioncare_db")
    client = MongoClient(mongo_uri)
    db = client.get_default_database()
    app.config["DATABASE"] = db
    print("✅ MongoDB connection successful.")
except Exception as e:
    print(f"🔥 MongoDB connection failed: {e}")
    app.config["DATABASE"] = None

# --- Blueprints ---
from routes.patient_routes import patient_bp
from routes.appointment_routes import appointment_bp
from routes.report_routes import report_bp  # 🟢 New: Import the report blueprint

app.register_blueprint(patient_bp, url_prefix="/api/patients")
app.register_blueprint(appointment_bp, url_prefix="/api/appointments")
app.register_blueprint(report_bp, url_prefix="/api/reports") # 🟢 New: Register the report blueprint

# --- Simple demo auth (same as yours) ---
USERS = [
    {'id': 'doc01', 'designation': 'Doctor', 'password': 'doc-pass-01'},
    {'id': 'rec01', 'designation': 'Receptionist', 'password': 'rec-pass-01'},
    {'id': 'scan01', 'designation': 'Scanner', 'password': 'scan-pass-01'}
]

def get_user(user_id, password):
    return next((u for u in USERS if u['id'] == user_id and u['password'] == password), None)

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("id") or not data.get("password"):
        return jsonify({"error": "Missing ID or password"}), 400

    user = get_user(data["id"], data["password"])
    if user:
        session["role"] = user["designation"]
        session["user_id"] = user["id"]
        return jsonify({"message": "Login successful!", "role": user["designation"]}), 200
    return jsonify({"error": "Invalid ID or password"}), 401

@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logout successful"}), 200

@app.route("/api/protected_data")
def protected_data():
    if "role" in session:
        return jsonify({"message": f'Welcome! You have access to {session["role"]}-specific data.'})
    return jsonify({"error": "Unauthorized access"}), 401

# --- Root route ---
@app.route("/")
def index():
    return "Welcome to the VisionCare API!", 200

# 🟢 New API endpoint for fetching patient list
@app.route("/api/patients", methods=["GET"])
def get_all_patients():
    db = app.config["DATABASE"]
    patients_collection = db.patients

    # Find all patients, but only retrieve the _id and name fields to optimize the response
    patients = list(patients_collection.find({}, {"_id": 1, "name": 1}))

    # Convert ObjectId to string for JSON serialization
    for patient in patients:
        patient["_id"] = str(patient["_id"])

    return jsonify(patients), 200

# --- Run App ---
if __name__ == "__main__":
    print("🚀 Flask app starting...")
    app.run(debug=True, port=5000)
