from flask import Blueprint, request, jsonify, make_response, g
import bcrypt
import jwt
import datetime
from config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRY_DAYS
from middleware.auth import authenticate
import models.user as User
import models.tutor_profile as TutorProfile

bp = Blueprint('auth', __name__, url_prefix='/api/auth')


def _issue_token(user):
    payload = {
        'id': user['UserID'],
        'role': user['UserRole'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=JWT_EXPIRY_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _set_token_cookie(response, token):
    response.set_cookie(
        'token', token,
        httponly=True,
        samesite='Lax',
        max_age=JWT_EXPIRY_DAYS * 24 * 3600,
        secure=False,  # set True in production (HTTPS)
    )


@bp.post('/register')
def register():
    data = request.get_json(force=True)
    full_name = (data.get('fullName') or '').strip()
    email     = (data.get('email') or '').strip().lower()
    password  = data.get('password') or ''
    role      = data.get('role') or ''

    if not full_name:
        return jsonify({'message': 'Full name is required'}), 422
    if '@' not in email:
        return jsonify({'message': 'Valid email required'}), 422
    if len(password) < 6:
        return jsonify({'message': 'Password must be at least 6 characters'}), 422
    if role not in ('Student', 'Tutor'):
        return jsonify({'message': 'Role must be Student or Tutor'}), 422

    if User.find_by_email(email):
        return jsonify({'message': 'Email already registered'}), 409

    pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user_id = User.create(full_name, email, pw_hash, role)

    if role == 'Tutor':
        TutorProfile.create(user_id)

    user  = User.find_by_id(user_id)
    token = _issue_token(user)
    resp  = make_response(jsonify({
        'user': {'id': user['UserID'], 'fullName': user['FullName'], 'email': user['Email'], 'role': user['UserRole']}
    }), 201)
    _set_token_cookie(resp, token)
    return resp


@bp.post('/login')
def login():
    data     = request.get_json(force=True)
    email    = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    user = User.find_by_email(email)
    if not user or not bcrypt.checkpw(password.encode(), user['PasswordHash'].encode()):
        return jsonify({'message': 'Invalid email or password'}), 401

    token = _issue_token(user)
    resp  = make_response(jsonify({
        'user': {'id': user['UserID'], 'fullName': user['FullName'], 'email': user['Email'], 'role': user['UserRole']}
    }))
    _set_token_cookie(resp, token)
    return resp


@bp.post('/logout')
def logout():
    resp = make_response(jsonify({'message': 'Logged out'}))
    resp.delete_cookie('token')
    return resp


@bp.get('/me')
@authenticate
def me():
    user = User.find_by_id(g.user['id'])
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify({'user': {'id': user['UserID'], 'fullName': user['FullName'], 'email': user['Email'], 'role': user['UserRole']}})
