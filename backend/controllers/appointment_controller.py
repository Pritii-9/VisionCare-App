from flask import request, jsonify, current_app
from bson import ObjectId
from models.appointment_model import AppointmentModel

def add_appointment():
    try:
        data = request.get_json()
        if not data.get("patientId") or not data.get("appointmentDate") or not data.get("appointmentTime"):
            return jsonify({"error": "Missing required fields: patientId, appointmentDate, appointmentTime"}), 400

        result = AppointmentModel.create(data)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def get_appointments():
    try:
        db = current_app.config["DATABASE"]

        pipeline = [
            {
                "$lookup": {
                    "from": "patients",
                    "localField": "patientId",
                    "foreignField": "_id",
                    "as": "patient"
                }
            },
            {"$unwind": "$patient"},
            {
                "$project": {
                    "_id": {"$toString": "$_id"},
                    "appointmentDate": 1,
                    "appointmentTime": 1,
                    "status": 1,
                    "patientName": "$patient.name",      # ✅ include full name
                    "patientContact": "$patient.contact" # ✅ include contact
                }
            }
        ]

        appointments = list(db.appointments.aggregate(pipeline))
        return jsonify(appointments), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def update_appointment_status(id):
    try:
        data = request.get_json()
        status = data.get("status")
        if not status:
            return jsonify({"error": "Missing status field"}), 400

        result = AppointmentModel.update_status(id, status)
        if result.modified_count == 0:
            return jsonify({"error": "Appointment not found or status unchanged"}), 404

        return jsonify({"message": "Appointment status updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
