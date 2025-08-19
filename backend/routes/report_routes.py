# backend/routes/report_routes.py
from flask import Blueprint, jsonify, current_app
from bson import ObjectId

# Create a new Blueprint for report-related routes
report_bp = Blueprint("reports", __name__)

# --- Report Serialization Utility ---
def serialize_report(doc):
    """
    Serializes a full patient report document for a JSON response.
    This function includes all fields expected by the frontend's PatientReport component.
    """
    return {
        "_id": str(doc["_id"]),
        "name": doc.get("name"),
        "dateOfBirth": doc.get("dateOfBirth"),  # Field expected by frontend
        "gender": doc.get("gender"),
        "examinationDate": doc.get("examinationDate"), # Field expected by frontend
        "visualAcuity": doc.get("visualAcuity"), # Field expected by frontend
        "intraocularPressure": doc.get("intraocularPressure"), # Field expected by frontend
        "diseaseSeverity": doc.get("diseaseSeverity"), # Field expected by frontend
        "diagnosticResults": doc.get("diagnosticResults"), # Field expected by frontend
        "recommendations": doc.get("recommendations"), # Field expected by frontend
        "createdAt": doc.get("createdAt").isoformat() if doc.get("createdAt") else None,
    }

# --- GET one patient report ---
@report_bp.route("/<id>", methods=["GET"])
def get_report(id):
    """
    Route to get a detailed report for a specific patient.
    Endpoint: /api/reports/<patient_id>
    """
    db = current_app.config["DATABASE"]
    print(f"📥 GET /api/reports/{id} hit")

    try:
        # Fetch the patient document by ID
        doc = db.patients.find_one({"_id": ObjectId(id)})
        
        if not doc:
            print("❌ Patient not found.")
            return jsonify({"error": "Patient not found"}), 404

        # Return the serialized report data
        print("✅ Report found and sent.")
        return jsonify(serialize_report(doc)), 200

    except Exception as e:
        print(f"🔥 Error fetching report: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500