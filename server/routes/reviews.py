from flask import Blueprint, request, jsonify, g
from middleware.auth import authenticate, authorize
import models.booking as Booking
import models.review as Review

bp = Blueprint('reviews', __name__, url_prefix='/api/reviews')


@bp.post('/')
@authenticate
@authorize('Student')
def submit():
    data         = request.get_json(force=True)
    booking_id   = data.get('bookingId')
    rating_score = data.get('ratingScore')
    comment      = (data.get('comment') or '').strip()

    if not booking_id or not rating_score:
        return jsonify({'message': 'bookingId and ratingScore are required'}), 422
    if not isinstance(rating_score, int) or not (1 <= rating_score <= 5):
        return jsonify({'message': 'ratingScore must be an integer between 1 and 5'}), 422

    booking = Booking.find_by_id(int(booking_id))
    if not booking:
        return jsonify({'message': 'Booking not found'}), 404
    if booking['StudentID'] != g.user['id']:
        return jsonify({'message': 'Forbidden'}), 403
    if booking['Status'] != 'Completed':
        return jsonify({'message': 'Reviews can only be submitted for Completed sessions'}), 400
    if Review.find_by_booking(int(booking_id)):
        return jsonify({'message': 'Review already submitted for this booking'}), 409

    review_id = Review.create(int(booking_id), g.user['id'], rating_score, comment)
    return jsonify({'message': 'Review submitted', 'reviewId': review_id}), 201


@bp.get('/tutor/<int:tutor_id>')
def for_tutor(tutor_id):
    return jsonify(Review.for_tutor(tutor_id))
