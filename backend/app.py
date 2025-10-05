from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timedelta
from dateutil import parser
import os
import uuid # For creating unique filenames

# --- Configuration ---
app = Flask(__name__)
CORS(app) # Enable CORS for all routes
# MongoDB Connection
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client['rop_scan_db']
patients_collection = db['patients']
appointments_collection = db['appointments']
images_collection = db['images']

# Configure upload folder (where mock/real images would be stored)
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Helper function to find patient details
def get_patient_details(neonate_id):
    """Fetches patient name and ID from the collection."""
    patient = patients_collection.find_one({"neonate_id": neonate_id.upper()})
    if patient:
        return {
            "patientName": patient.get("name"),
            "patientId": patient.get("neonate_id"),
            "_id": str(patient.get("_id"))
        }
    return None

# --- API Routes ---

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Provides key metrics for all dashboards."""
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    appointments_today = appointments_collection.count_documents({
        "datetime": {"$gte": today}
    })
    
    total_patients = patients_collection.count_documents({})
    
    # Mocking pending review based on AI result status
    pending_review = images_collection.count_documents({
        "ai_result.status": "Pending Review",
        "ai_result.prediction": {"$in": ["High-Risk ROP Stage 3", "Urgent Referral"]}
    })
    
    # Doctor Specific Stat (e.g., total reviewed)
    total_reviewed = images_collection.count_documents({
        "status": "Reviewed"
    })

    # Scanner Specific Stats
    images_today = images_collection.count_documents({
        "upload_time": {"$gte": today}
    })
    total_uploads = images_collection.count_documents({})
    pending_processing = images_collection.count_documents({
        "status": "Uploaded",
        "ai_result.status": "Processing"
    })
    
    return jsonify({
        "totalPatients": total_patients,
        "appointmentsToday": appointments_today,
        "pendingReview": pending_review,
        "totalReviewed": total_reviewed, # Doctor
        "imagesUploadedToday": images_today, # Scanner
        "totalUploads": total_uploads, # Scanner
        "pendingProcessing": pending_processing, # Scanner
        "averageUploadTime": 45 # Mock value
    })

# --- Receptionist Endpoints ---

@app.route('/api/patients', methods=['POST'])
def add_patient():
    """Adds a new patient record."""
    data = request.get_json()
    required_fields = ['name', 'neonate_id', 'birth_date', 'parent_name']
    if not all(field in data and data[field] for field in required_fields):
        return jsonify({"message": "Missing required patient fields."}), 400

    # Ensure unique neonate_id
    if patients_collection.find_one({"neonate_id": data['neonate_id'].upper()}):
        return jsonify({"message": f"Patient ID {data['neonate_id']} already exists."}), 409

    try:
        new_patient = {
            "neonate_id": data['neonate_id'].upper(),
            "name": data['name'],
            "birth_date": parser.parse(data['birth_date']).isoformat(),
            "gestational_age": data.get('gestational_age'),
            "weight": float(data.get('weight', 0)) if data.get('weight') else None,
            "parent_name": data['parent_name'],
            "parent_phone": data.get('parent_phone'),
            "parent_email": data.get('parent_email'),
            "status": "Active",
            "created_at": datetime.now().isoformat()
        }
    except ValueError:
        return jsonify({"message": "Invalid date or number format provided."}), 400

    result = patients_collection.insert_one(new_patient)
    return jsonify({
        "message": "Patient record created successfully.",
        "id": str(result.inserted_id)
    }), 201

@app.route('/api/patients', methods=['GET'])
def get_all_patients():
    """Retrieves all patients (or a list for the dashboard)."""
    patients_list = []
    for patient in patients_collection.find().sort("created_at", -1): # Sort by recent
        patient['_id'] = str(patient['_id'])
        patients_list.append(patient)
    return jsonify(patients_list)

@app.route('/api/appointments', methods=['POST'])
def schedule_appointment():
    """Schedules a new ROP scan appointment."""
    data = request.get_json()
    required_fields = ['patientId', 'datetime', 'type']
    if not all(field in data and data[field] for field in required_fields):
        return jsonify({"message": "Missing required appointment fields (patientId, datetime, type)."}), 400
    
    patient_details = get_patient_details(data['patientId'])
    if not patient_details:
        return jsonify({"message": f"Patient ID {data['patientId']} not found."}), 404

    try:
        # Robustly parse datetime string (e.g., 'YYYY-MM-DDTTHH:MM:SS')
        appointment_datetime = parser.parse(data['datetime'])
    except:
        return jsonify({"message": "Invalid datetime format."}), 400

    new_appointment = {
        "patientId": patient_details['patientId'],
        "patientName": patient_details['patientName'],
        "datetime": appointment_datetime.isoformat(),
        "type": data['type'],
        "status": "Scheduled",
        "created_at": datetime.now().isoformat()
    }
    
    result = appointments_collection.insert_one(new_appointment)
    return jsonify({
        "message": "Appointment scheduled successfully.",
        "id": str(result.inserted_id)
    }), 201

@app.route('/api/appointments/today', methods=['GET'])
def get_appointments_today():
    """Retrieves appointments scheduled for today (useful for all roles)."""
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today + timedelta(days=1)
    
    appointments_list = []
    # Filter for appointments between the start of today and the start of tomorrow
    query = {
        "datetime": {
            "$gte": today.isoformat(),
            "$lt": tomorrow.isoformat()
        }
    }
    
    for appointment in appointments_collection.find(query).sort("datetime", 1):
        appointment['_id'] = str(appointment['_id'])
        appointments_list.append(appointment)
        
    return jsonify(appointments_list)

# --- Scanner Endpoints ---

@app.route('/api/images/upload', methods=['POST'])
def upload_image():
    """Handles file upload for ROP images."""
    if 'file' not in request.files:
        return jsonify({"message": "No file part in the request."}), 400
    if 'patientId' not in request.form:
        return jsonify({"message": "Patient ID is required in the form data."}), 400

    file = request.files['file']
    patient_id = request.form['patientId'].upper()
    
    if file.filename == '':
        return jsonify({"message": "No selected file."}), 400

    patient_details = get_patient_details(patient_id)
    if not patient_details:
        return jsonify({"message": f"Patient ID {patient_id} not found."}), 404
    
    # Generate unique filename to avoid conflicts
    extension = os.path.splitext(file.filename)[1]
    filename = f"{patient_id}_{uuid.uuid4().hex}{extension}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    # Save the file
    file.save(filepath)

    # Mock AI processing result (will be 'Processing' initially)
    ai_status = "Processing"
    
    new_image_record = {
        "patientId": patient_id,
        "patientName": patient_details['patientName'],
        "filename": filename,
        "filepath": filepath,
        "upload_time": datetime.now().isoformat(),
        "file_size": f"{os.path.getsize(filepath) / (1024 * 1024):.2f} MB", # Convert to MB
        "status": "Uploaded",
        "ai_result": {
            "status": ai_status,
            "prediction": "Unknown",
            "probability": 0
        }
    }
    
    result = images_collection.insert_one(new_image_record)
    
    # MOCK: Immediately 'process' for dashboard testing simplicity (remove in real async system)
    images_collection.update_one(
        {"_id": result.inserted_id},
        {"$set": {
            "status": "Processed",
            "ai_result.status": "Pending Review",
            "ai_result.prediction": "Low-Risk ROP Stage 1", # Default to Low-Risk
            "ai_result.probability": 0.95
        }}
    )

    return jsonify({
        "message": "Image uploaded successfully and sent for AI processing.",
        "imageId": str(result.inserted_id),
        "aiResult": {
            "status": "Processing"
        }
    }), 201

@app.route('/api/images/history', methods=['GET'])
def get_upload_history():
    """Retrieves recent image upload history for the Scanner."""
    history_list = []
    # Fetch the 10 most recent uploads
    for record in images_collection.find().sort("upload_time", -1).limit(10):
        record['_id'] = str(record['_id'])
        history_list.append(record)
    return jsonify(history_list)

@app.route('/api/image/<filename>', methods=['GET'])
def get_image_file(filename):
    """Serves an uploaded image file by filename."""
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if os.path.exists(filepath):
        return send_file(filepath)
    return jsonify({"message": "Image not found."}), 404

# --- Doctor Endpoints ---

@app.route('/api/images/review', methods=['GET'])
def get_images_for_review():
    """Retrieves images flagged as high-risk by AI, awaiting doctor review."""
    review_list = []
    # Filter for images with high-risk prediction that are not yet manually reviewed/diagnosed
    query = {
        "ai_result.status": "Pending Review",
        "ai_result.prediction": {"$in": ["High-Risk ROP Stage 3", "Urgent Referral", "Severe ROP"]}, # Expanded high-risk tags
        "status": {"$ne": "Reviewed"}
    }
    
    # MOCKING DATA IN CASE MONGODB IS EMPTY:
    if images_collection.count_documents(query) == 0:
        return jsonify([
            {
                "_id": "mock_review_1",
                "patientId": "N012",
                "patientName": "Baby Smith",
                "filename": "mock_file_1.jpg",
                "upload_time": datetime.now().isoformat(),
                "ai_result": {"prediction": "High-Risk ROP Stage 3", "probability": 0.98},
                "status": "Processed"
            }
        ])

    for record in images_collection.find(query).sort("upload_time", -1):
        record['_id'] = str(record['_id'])
        review_list.append(record)
        
    return jsonify(review_list)

# --- Run App ---
if __name__ == '__main__':
        # Change 'debug=True' to 'debug=False' to disable the reloader
    app.run(debug=False, port=5000)
    # Ensure a basic patient is available for testing if DB is empty
    if patients_collection.count_documents({}) == 0:
        print("Database is empty. Inserting mock patient for testing.")
        patients_collection.insert_one({
            "neonate_id": "N001",
            "name": "Baby Doe",
            "birth_date": (datetime.now() - timedelta(days=20)).isoformat(),
            "gestational_age": "30",
            "weight": 1.5,
            "parent_name": "John Doe",
            "parent_phone": "123-456-7890",
            "parent_email": "john@example.com",
            "status": "Active",
            "created_at": datetime.now().isoformat()
        })
    
    app.run(debug=True, port=5000)