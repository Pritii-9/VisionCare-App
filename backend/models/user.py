# --- Mock User Database ---
# In a real application, this would connect to a database (e.g., using SQLAlchemy).
USERS = [
    {'id': 'doc01', 'designation': 'Doctor', 'password': 'doc-pass-01'},
    {'id': 'rec01', 'designation': 'Receptionist', 'password': 'rec-pass-01'},
    {'id': 'scan01', 'designation': 'Scanner', 'password': 'scan-pass-01'}
]

def get_user(user_id, password):
    """
    Finds a user by their ID and password.
    Returns the user object if found, otherwise None.
    """
    user = next((u for u in USERS if u['id'] == user_id and u['password'] == password), None)
    return user
