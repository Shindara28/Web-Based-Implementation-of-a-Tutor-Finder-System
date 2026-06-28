from flask import Blueprint, request, jsonify, g
from db.database import get_db
from middleware.auth import authenticate, authorize
import models.tutor_profile as TutorProfile
import models.booking as Booking
import models.review as Review

bp = Blueprint('admin', __name__, url_prefix='/api/admin')


@bp.before_request
@authenticate
@authorize('Admin')
def guard():
    pass


@bp.get('/pending-tutors')
def pending_tutors():
    return jsonify(TutorProfile.all_pending())


@bp.patch('/tutors/<int:user_id>/verify')
def verify_tutor(user_id):
    data     = request.get_json(force=True)
    approved = bool(data.get('approved'))

    profile = TutorProfile.find_by_user_id(user_id)
    if not profile:
        return jsonify({'message': 'Tutor profile not found'}), 404

    TutorProfile.set_verification(user_id, approved)
    return jsonify({'message': 'Tutor approved' if approved else 'Tutor rejected'})


@bp.get('/reviews')
def all_reviews():
    return jsonify(Review.all_reviews())


@bp.delete('/reviews/<int:review_id>')
def remove_review(review_id):
    row = get_db().execute('SELECT * FROM Reviews WHERE ReviewID = ?', (review_id,)).fetchone()
    if not row:
        return jsonify({'message': 'Review not found'}), 404
    Review.delete(review_id)
    return jsonify({'message': 'Review removed'})


@bp.get('/metrics')
def metrics():
    db = get_db()
    user_counts = [dict(r) for r in db.execute('SELECT UserRole, COUNT(*) AS Total FROM Users GROUP BY UserRole').fetchall()]
    pending     = db.execute('SELECT COUNT(*) AS Total FROM Tutor_Profiles WHERE VerificationStatus = 0').fetchone()
    return jsonify({
        'userCounts':           user_counts,
        'bookingCounts':        Booking.count_by_status(),
        'pendingVerifications': dict(pending)['Total'],
    })
