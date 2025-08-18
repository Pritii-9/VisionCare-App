# app.py
import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient

# --- 1. Load Environment Variables ---
load_dotenv()

# --- 2. Initialize Flask App ---
app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)

# --- 3. Enable CORS ---
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

# --- 4. Connect to MongoDB ---
try:
    client = MongoClient(os.getenv("MONGO_URI"))
    db = client.get_default_database()
    print("✅ MongoDB connection successful.")
except Exception as e:
    print(f"🔥 MongoDB connection failed: {e}")
    db = None

# Store DB in app config for access in other modules
app.config["DATABASE"] = db

# --- 5. Register Blueprints ---
from routes.patient_routes import patient_bp  # ✅ FIXED

app.register_blueprint(patient_bp, url_prefix='/api/patients')
# ❌ auth_bp removed for now — you can re-add later when it's created

# --- 6. Root Route ---
@app.route('/')
def index():
    return "Welcome to the VisionCare API!", 200

# --- 7. Run the App ---
if __name__ == '__main__':
    print("🚀 Flask app starting...")
    app.run(debug=True)
