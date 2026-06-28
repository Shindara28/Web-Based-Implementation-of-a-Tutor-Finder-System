from flask import Blueprint, request, jsonify, g
from middleware.auth import authenticate, authorize
import models.booking as Booking
import models.tutor_profile as TutorProfile

bp = Blueprint('bookings', __name__, url_prefix='/api/bookings')

ALLOWED_TRANSITIONS = {
    'Tutor':   {'Confirmed', 'Cancelled', 'Completed'},
    'Student': {'Cancelled'},
    'Admin':   {'Pending', 'Confirmed', 'Completed', 'Cancelled'},
}


@bp.post('/')
@authenticate
@authorize('Student')
def create():
    data        = request.get_json(force=True)
    tutor_id    = data.get('tutorId')
    session_date = data.get('sessionDate')

    if not tutor_id or not session_date:
        return jsonify({'message': 'tutorId and sessionDate are required'}), 422

    profile = TutorProfile.find_by_user_id(int(tutor_id))
    if not profile or not profile.get('VerificationStatus'):
        return jsonify({'message': 'Tutor not found or not verified'}), 400

    if Booking.has_conflict(int(tutor_id), session_date):
        return jsonify({'message': 'Tutor already has a booking on that date'}), 409

    booking_id = Booking.create(g.user['id'], int(tutor_id), session_date)
    return jsonify({'message': 'Booking created', 'bookingId': booking_id}), 201


@bp.get('/')
@authenticate
@authorize('Student', 'Tutor', 'Admin')
def my_bookings():
    role = g.user['role']
    uid  = g.user['id']
    data = Booking.for_student(uid) if role == 'Student' else Booking.for_tutor(uid)
    return jsonify(data)


@bp.get('/<int:booking_id>')
@authenticate
def get_booking(booking_id):
    booking = Booking.find_by_id(booking_id)
    if not booking:
        return jsonify({'message': 'Booking not found'}), 404

    uid  = g.user['id']
    role = g.user['role']
    if role == 'Student' and booking['StudentID'] != uid:
        return jsonify({'message': 'Forbidden'}), 403
    if role == 'Tutor' and booking['TutorID'] != uid:
        return jsonify({'message': 'Forbidden'}), 403

    return jsonify(booking)


@bp.patch('/<int:booking_id>/status')
@authenticate
def update_status(booking_id):
    booking = Booking.find_by_id(booking_id)
    if not booking:
        return jsonify({'message': 'Booking not found'}), 404

    uid    = g.user['id']
    role   = g.user['role']
    status = (request.get_json(force=True) or {}).get('status')

    if status not in ALLOWED_TRANSITIONS.get(role, set()):
        return jsonify({'message': 'Status transition not permitted for your role'}), 400

    if role == 'Tutor' and booking['TutorID'] != uid:
        return jsonify({'message': 'Forbidden'}), 403
    if role == 'Student' and booking['StudentID'] != uid:
        return jsonify({'message': 'Forbidden'}), 403

    Booking.update_status(booking_id, status)
    return jsonify({'message': 'Status updated', 'status': status})
