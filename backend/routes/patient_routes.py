# routes/patient_routes.py
# Created by [Your Name] with ChatGPT's help 🧠🤝

from flask import Blueprint
from controllers.patient_controller import get_patients, add_patient

patient_bp = Blueprint('patient_bp', __name__)
print("📌 patient_bp loaded")  # Debug print

# Matches both /api/patients and /api/patients/
@patient_bp.route('', methods=['GET', 'POST'])
@patient_bp.route('/', methods=['GET', 'POST'])
def patient_handler():
    from flask import request
    if request.method == 'GET':
        print("📥 GET /api/patients hit")  # Debug print
        return get_patients()
    elif request.method == 'POST':
        print("📥 POST /api/patients hit")  # Debug print
        return add_patient()
