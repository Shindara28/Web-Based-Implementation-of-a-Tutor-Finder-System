from functools import wraps
import jwt
from flask import request, jsonify, g
from config import JWT_SECRET, JWT_ALGORITHM


def authenticate(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get('token')
        if not token:
            return jsonify({'message': 'Not authenticated'}), 401
        try:
            g.user = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid or expired token'}), 401
        return f(*args, **kwargs)
    return decorated


def authorize(*roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not g.get('user') or g.user.get('role') not in roles:
                return jsonify({'message': 'Forbidden: insufficient role'}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator
