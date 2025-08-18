from flask import jsonify
from models.user import get_user

def login_user(request):
    """
    Controller function to process the login request.
    """
    # Get the JSON data sent from the frontend
    data = request.get_json()

    if not data or not data.get('id') or not data.get('password'):
        # Return an error if the request is missing data
        return jsonify({'error': 'Missing ID or password'}), 400

    user_id = data.get('id')
    password = data.get('password')

    # Use the model function to find the user
    user = get_user(user_id, password)

    if user:
        # If a user is found, return a success response with the user's role
        return jsonify({
            'message': 'Login successful!',
            'role': user['designation']
        }), 200
    else:
        # If no user is found, return an error response
        return jsonify({'error': 'Invalid ID or password'}), 401
