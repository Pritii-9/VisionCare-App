from flask import Blueprint, request, jsonify, current_app
from bson import ObjectId
from datetime import datetime, date

patient_bp = Blueprint("patients", __name__)

def serialize_patient(p):
    return {
        "_id": str(p["_id"]),
        "name": p.get("name"),
        "dob": p.get("dob"),
        "age": p.get("age"),
        "gender": p.get("gender"),
        "gestationalAge": p.get("gestationalAge"),
        "birthWeight": p.get("birthWeight"),
        "guardianName": p.get("guardianName"),
        "contact": p.get("contact"),
        "address": p.get("address"),
        "medicalHistory": p.get("medicalHistory"),
        "appointmentDate": p.get("appointmentDate"),
        "appointmentTime": p.get("appointmentTime"),
        "appointmentStatus": p.get("appointmentStatus", "Pending"),
        "createdAt": p.get("createdAt").isoformat() if p.get("createdAt") else None,
    }

def calculate_age(dob_str):
    try:
        d = datetime.strptime(dob_str, "%Y-%m-%d").date()
        t = date.today()
        return t.year - d.year - ((t.month, t.day) < (d.month, d.day))
    except Exception:
        return None

@patient_bp.route("", methods=["GET", "POST", "OPTIONS"], strict_slashes=False)
def patients_collection():
    if request.method == "OPTIONS":
        return ("", 204)

    db = current_app.config["DATABASE"]

    if request.method == "GET":
        docs = list(db.patients.find())
        return jsonify([serialize_patient(p) for p in docs]), 200

    data = request.get_json(silent=True) or {}
    required = ["fullName", "dob", "gender", "contactNumber"]
    for f in required:
        if not data.get(f):
            return jsonify({"error": f"Missing required field: {f}"}), 400

    age = calculate_age(data["dob"])
    patient = {
        "name": data.get("fullName"),
        "dob": data.get("dob"),
        "age": age,
        "gender": data.get("gender"),
        "gestationalAge": data.get("gestationalAge"),
        "birthWeight": data.get("birthWeight"),
        "guardianName": data.get("guardianName"),
        "contact": data.get("contactNumber"),
        "address": data.get("address"),
        "medicalHistory": data.get("medicalHistory"),
        "appointmentDate": data.get("appointmentDate"),
        "appointmentTime": data.get("appointmentTime"),
        "appointmentStatus": "Pending",
        "createdAt": datetime.utcnow(),
    }

    result = db.patients.insert_one(patient)
    patient["_id"] = result.inserted_id
    return jsonify(serialize_patient(patient)), 201

@patient_bp.route("/<id>", methods=["GET", "DELETE"], strict_slashes=False)
def patient_item(id):
    db = current_app.config["DATABASE"]

    if request.method == "GET":
        doc = db.patients.find_one({"_id": ObjectId(id)})
        if not doc:
            return jsonify({"error": "Patient not found"}), 404
        return jsonify(serialize_patient(doc)), 200

    res = db.patients.delete_one({"_id": ObjectId(id)})
    if res.deleted_count == 0:
        return jsonify({"error": "Patient not found"}), 404
    return jsonify({"message": "Patient deleted successfully"}), 200

@patient_bp.route("/<id>/status", methods=["PUT"])
def update_status(id):
    db = current_app.config["DATABASE"]
    data = request.get_json() or {}
    new_status = data.get("appointmentStatus")

    if new_status not in ["Pending", "Done"]:
        return jsonify({"error": "Invalid status"}), 400

    result = db.patients.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"appointmentStatus": new_status}}
    )
    if result.matched_count == 0:
        return jsonify({"error": "Patient not found"}), 404

    return jsonify({"message": "Status updated"}), 200