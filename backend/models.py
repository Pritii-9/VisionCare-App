from datetime import datetime
from bson.objectid import ObjectId

# Utility function to convert MongoDB object to Python dictionary
def serialize_doc(doc):
    """Converts a MongoDB document to a JSON serializable dict."""
    if doc:
        doc['_id'] = str(doc['_id'])
        if 'patient_id' in doc and isinstance(doc['patient_id'], ObjectId):
            doc['patient_id'] = str(doc['patient_id'])
    return doc

# --- Patient Schema ---
def patient_schema(data):
    """Initial schema for a new patient."""
    return {
        "neonate_id": data.get("neonateId"),
        "name": data.get("patientName"),
        "birth_date": datetime.strptime(data["birthDate"], '%Y-%m-%d') if data.get("birthDate") else None,
        "gestational_age": data.get("gestationalAge"),
        "weight": data.get("weight"),
        "parent_name": data.get("parentName"),
        "parent_phone": data.get("parentPhone"),
        "parent_email": data.get("parentEmail"),
        "status": "Active", # Default status
        "created_at": datetime.utcnow(),
    }

# --- Appointment Schema ---
def appointment_schema(data, patient_id):
    """Initial schema for a new appointment."""
    return {
        "patient_id": ObjectId(patient_id), # Link to Patient collection
        "datetime": datetime.strptime(data["dateTime"], '%Y-%m-%d %I:%M %p') if data.get("dateTime") else None, # e.g. '2024-09-17 09:00 AM'
        "type": data.get("type", "Initial Screening"),
        "status": "Scheduled", # Scheduled, Confirmed, Completed, Cancelled
        "created_at": datetime.utcnow(),
    }

# --- Image Upload Schema ---
def image_schema(data, patient_id, ai_result=None):
    """Schema for an uploaded fundus image record."""
    record = {
        "patient_id": ObjectId(patient_id),
        "filename": data.get("filename"),
        "file_size": data.get("fileSize"),
        "file_type": data.get("fileType"),
        "upload_time": datetime.utcnow(),
        "status": "Processing", # Processing, Processed, Failed
        "ai_result": ai_result or {},
    }
    
    # If AI results are available immediately (e.g., model is fast)
    if ai_result and ai_result.get("status") == "processed":
        record["status"] = "Processed"
        
    return record