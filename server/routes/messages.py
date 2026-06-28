from flask import Blueprint, request, jsonify, g
from middleware.auth import authenticate, authorize
from db.database import get_db
import models.message as Message
import models.user as User

bp = Blueprint('messages', __name__, url_prefix='/api/messages')


@bp.get('/conversations')
@authenticate
@authorize('Student', 'Tutor')
def conversations():
    return jsonify(Message.get_conversations(g.user['id']))


@bp.get('/contacts')
@authenticate
@authorize('Student', 'Tutor')
def contacts():
    db  = get_db()
    uid = g.user['id']

    if g.user['role'] == 'Student':
        # All verified tutors
        rows = db.execute('''
            SELECT u.UserID, u.FullName, u.UserRole, tp.SubjectSpecialty
            FROM Users u
            JOIN Tutor_Profiles tp ON tp.UserID = u.UserID
            WHERE u.UserRole = 'Tutor' AND tp.VerificationStatus = 1
            ORDER BY u.FullName
        ''').fetchall()
    else:
        # Distinct students who have a booking with this tutor
        rows = db.execute('''
            SELECT DISTINCT u.UserID, u.FullName, u.UserRole, NULL AS SubjectSpecialty
            FROM Users u
            JOIN Bookings b ON b.StudentID = u.UserID
            WHERE b.TutorID = ?
            ORDER BY u.FullName
        ''', (uid,)).fetchall()

    return jsonify([dict(r) for r in rows])


@bp.get('/<int:other_user_id>')
@authenticate
@authorize('Student', 'Tutor')
def thread(other_user_id):
    # Verify the other user exists
    other = User.find_by_id(other_user_id)
    if not other:
        return jsonify({'message': 'User not found'}), 404

    # Mark incoming messages from other_user as read
    Message.mark_read(sender_id=other_user_id, receiver_id=g.user['id'])

    messages = Message.get_thread(g.user['id'], other_user_id)
    return jsonify({'messages': messages, 'other': other})


@bp.post('/')
@authenticate
@authorize('Student', 'Tutor')
def send():
    data        = request.get_json(force=True)
    receiver_id = data.get('receiverId')
    body        = (data.get('body') or '').strip()

    if not receiver_id:
        return jsonify({'message': 'receiverId is required'}), 422
    if not body:
        return jsonify({'message': 'Message body cannot be empty'}), 422

    receiver = User.find_by_id(int(receiver_id))
    if not receiver:
        return jsonify({'message': 'Recipient not found'}), 404
    if receiver['UserID'] == g.user['id']:
        return jsonify({'message': 'Cannot message yourself'}), 400

    msg_id = Message.send(g.user['id'], int(receiver_id), body)
    return jsonify({'message': 'Sent', 'messageId': msg_id}), 201
