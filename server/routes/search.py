from flask import Blueprint, request, jsonify
import models.tutor_profile as TutorProfile

bp = Blueprint('search', __name__, url_prefix='/api/search')


@bp.get('/')
def search():
    subject  = (request.args.get('subject') or '').strip() or None
    max_rate = request.args.get('maxRate') or None
    location = (request.args.get('location') or '').strip() or None

    results = TutorProfile.search(subject=subject, max_rate=max_rate, location=location)
    return jsonify(results)
