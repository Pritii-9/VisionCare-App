from flask import request, jsonify
from models.patient_model import PatientModel

def add_patient():
    try:
        data = request.get_json()

        # --- CORRECTED VALIDATION ---
        # Create a list of all fields that are absolutely required from the form
        required_fields = [
            'fullName', 'dob', 'gender', 'gestationalAge', 
            'birthWeight', 'guardianName', 'contactNumber'
        ]
        
        # Check if any required field is missing from the incoming data
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": "Missing one or more required fields"}), 400

        # If validation passes, store the patient
        result = PatientModel.create(data)
        return jsonify(result), 201

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


def get_patients():
    try:
        patients = PatientModel.get_all()
        return jsonify(patients), 200
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500