from flask import Blueprint
from backend.controllers.auth_controller import signup_controller, signin_controller, protected_data_controller

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup_route():
    return signup_controller()

@auth_bp.route('/signin', methods=['POST'])
def signin_route():
    return signin_controller()

@auth_bp.route('/protected_data', methods=['GET'])
def protected_data_route():
    return protected_data_controller()