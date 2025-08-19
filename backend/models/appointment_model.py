from flask import current_app
from bson import ObjectId

class AppointmentModel:
    @staticmethod
    def create(data):
        db = current_app.config["DATABASE"]

        # Convert patientId into ObjectId
        try:
            data["patientId"] = ObjectId(data["patientId"])
        except Exception:
            raise ValueError("Invalid patientId")

        appointment = {
            "patientId": data["patientId"],
            "appointmentDate": data["appointmentDate"],
            "appointmentTime": data["appointmentTime"],
            "status": data.get("status", "Pending")
        }

        result = db.appointments.insert_one(appointment)  # ✅ creates collection if missing
        return {"_id": str(result.inserted_id), **appointment}

    @staticmethod
    def update_status(id, status):
        db = current_app.config["DATABASE"]
        return db.appointments.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"status": status}}
        )
