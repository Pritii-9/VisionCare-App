from flask import jsonify, request
from backend.__init__ import db, bcrypt
from backend.models.user import User

def signup_controller():
    data = request.get_json()
    userId = data.get('userId')
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    # Automatically set the username and role
    username = email  # Use email as the username
    role = 'scanner'   # Hardcode the role to 'scanner'
    
    if not all([userId, name, email, password]):
        return jsonify({'message': 'All fields are required'}), 400

    existing_user = User.query.filter((User.userId == userId) | (User.username == username) | (User.email == email)).first()
    if existing_user:
        return jsonify({'message': 'User with this User ID, username, or email already exists'}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    new_user = User(
        userId=userId,
        name=name,
        username=username,
        email=email,
        password_hash=hashed_password,
        role=role
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

def signin_controller():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({'message': 'Login successful', 'role': user.role}), 200
    
    return jsonify({'message': 'Invalid username or password'}), 401

def protected_data_controller():
    return jsonify({'message': 'This is protected data'}), 200