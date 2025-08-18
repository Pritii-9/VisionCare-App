from flask import current_app
from bson import ObjectId

class PatientModel:
    @staticmethod
    def get_collection():
        """Helper method to get the patients collection from the app context."""
        db = current_app.config["DATABASE"]
        return db.patients

    @staticmethod
    def get_all():
        """Fetches all patients."""
        collection = PatientModel.get_collection()
        # Convert ObjectId to string for JSON serialization
        patients = []
        for patient in collection.find({}):
            patient['_id'] = str(patient['_id'])
            patients.append(patient)
        return patients

    @staticmethod
    def create(data):
        """Creates a new patient."""
        collection = PatientModel.get_collection()
        
        # Add default fields if they don't exist
        from datetime import datetime
        data['lastVisit'] = datetime.now().strftime("%Y-%m-%d")
        data['status'] = 'Active'

        result = collection.insert_one(data)
        return {"message": "Patient added successfully", "patientId": str(result.inserted_id)}