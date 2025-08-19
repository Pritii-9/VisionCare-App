from datetime import datetime
from flask import current_app


class PatientModel:
    @staticmethod
    def create(data):
        db = current_app.config["DATABASE"]
        patient = {
            "name": data.get("fullName"),              # ✅ match patients.py
            "dob": data.get("dob"),
            "gender": data.get("gender"),
            "gestationalAge": data.get("gestationalAge"),
            "birthWeight": data.get("birthWeight"),
            "guardianName": data.get("guardianName"),
            "contact": data.get("contactNumber"),      # ✅ match patients.py
            "address": data.get("address"),
            "medicalHistory": data.get("medicalHistory"),
            "appointmentDate": data.get("appointmentDate"),
            "appointmentTime": data.get("appointmentTime"),
            "appointmentStatus": "Pending",
            "createdAt": datetime.utcnow()
        }
        result = db.patients.insert_one(patient)
        patient["_id"] = str(result.inserted_id)
        return patient

    @staticmethod
    def get_all():
        db = current_app.config["DATABASE"]
        patients = list(db.patients.find())
        for p in patients:
            p["_id"] = str(p["_id"])
        return patients
