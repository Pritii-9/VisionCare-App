from flask import Blueprint, request
from controllers.appointment_controller import (
    add_appointment,
    get_appointments,
    update_appointment_status,
)

appointment_bp = Blueprint("appointments", __name__)

# 📌 GET all appointments + POST new appointment
@appointment_bp.route("", methods=["GET", "POST"])
def appointments_collection():
    if request.method == "GET":
        return get_appointments()
    if request.method == "POST":
        return add_appointment()

# 📌 Update appointment status
@appointment_bp.route("/<id>/status", methods=["PUT"])
def appointment_status(id):
    return update_appointment_status(id)
