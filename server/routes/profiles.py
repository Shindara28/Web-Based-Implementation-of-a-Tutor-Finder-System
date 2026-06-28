import os
import uuid
from flask import Blueprint, request, jsonify, g, send_from_directory
from werkzeug.utils import secure_filename
from middleware.auth import authenticate, authorize
from config import UPLOAD_FOLDER, ALLOWED_EXTENSIONS, MAX_FILE_SIZE_MB
import models.tutor_profile as TutorProfile

bp = Blueprint('profiles', __name__, url_prefix='/api/profiles')


def _allowed(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@bp.get('/me')
@authenticate
@authorize('Tutor')
def get_my_profile():
    profile = TutorProfile.find_by_user_id(g.user['id'])
    if not profile:
        return jsonify({'message': 'Profile not found'}), 404
    return jsonify(profile)


@bp.get('/<int:profile_id>')
def get_profile(profile_id):
    profile = TutorProfile.find_by_profile_id(profile_id)
    if not profile:
        return jsonify({'message': 'Profile not found'}), 404
    return jsonify(profile)


@bp.put('/')
@authenticate
@authorize('Tutor')
def update_profile():
    data    = request.get_json(force=True)
    profile = TutorProfile.find_by_user_id(g.user['id'])
    if not profile:
        return jsonify({'message': 'Profile not found'}), 404

    bio     = (data.get('bio') or '').strip()
    subject = (data.get('subjectSpecialty') or '').strip()
    rate    = data.get('hourlyRate', 0)
    loc     = (data.get('location') or '').strip()

    try:
        rate = float(rate)
    except (TypeError, ValueError):
        return jsonify({'message': 'hourlyRate must be a number'}), 422

    TutorProfile.update(profile['ProfileID'], bio, subject, rate, loc)
    return jsonify({'message': 'Profile updated'})


@bp.post('/credentials')
@authenticate
@authorize('Tutor')
def upload_credential():
    if 'credential' not in request.files:
        return jsonify({'message': 'No file uploaded'}), 400
    file = request.files['credential']
    if not file.filename or not _allowed(file.filename):
        return jsonify({'message': 'Only PDF and JPEG files are allowed'}), 400

    file.seek(0, os.SEEK_END)
    size_mb = file.tell() / (1024 * 1024)
    file.seek(0)
    if size_mb > MAX_FILE_SIZE_MB:
        return jsonify({'message': f'File exceeds {MAX_FILE_SIZE_MB} MB limit'}), 413

    ext      = os.path.splitext(secure_filename(file.filename))[1]
    filename = f'cred-{uuid.uuid4().hex}{ext}'
    file.save(os.path.join(UPLOAD_FOLDER, filename))

    profile = TutorProfile.find_by_user_id(g.user['id'])
    TutorProfile.set_credential(profile['ProfileID'], filename)
    return jsonify({'message': 'Credential uploaded', 'filename': filename})
