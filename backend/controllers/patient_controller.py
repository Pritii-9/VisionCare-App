from flask import request, jsonify
from models.patient_model import PatientModel

def get_patients():
    try:
        patients = PatientModel.get_all()
        return jsonify(patients), 200
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

def add_patient():
    try:
        data = request.get_json()
        if not data or not data.get('name') or not data.get('age'):
            return jsonify({"error": "Missing required fields: name and age"}), 400
        result = PatientModel.create(data)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500