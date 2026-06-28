from db.database import get_db
from config import TRUST_RATING_WEIGHT, TRUST_BOOKING_WEIGHT


def find_by_user_id(user_id):
    row = get_db().execute('SELECT * FROM Tutor_Profiles WHERE UserID = ?', (user_id,)).fetchone()
    return dict(row) if row else None


def find_by_profile_id(profile_id):
    row = get_db().execute('''
        SELECT tp.*, u.FullName, u.Email
        FROM Tutor_Profiles tp
        JOIN Users u ON u.UserID = tp.UserID
        WHERE tp.ProfileID = ?
    ''', (profile_id,)).fetchone()
    return dict(row) if row else None


def create(user_id, bio='', subject='', rate=0.0, location=''):
    db = get_db()
    cursor = db.execute(
        'INSERT OR IGNORE INTO Tutor_Profiles (UserID, Bio, SubjectSpecialty, HourlyRate, Location) VALUES (?,?,?,?,?)',
        (user_id, bio, subject, rate, location)
    )
    db.commit()
    return cursor.lastrowid


def update(profile_id, bio, subject, rate, location):
    db = get_db()
    db.execute(
        'UPDATE Tutor_Profiles SET Bio=?, SubjectSpecialty=?, HourlyRate=?, Location=? WHERE ProfileID=?',
        (bio, subject, rate, location, profile_id)
    )
    db.commit()


def set_credential(profile_id, filename):
    db = get_db()
    db.execute('UPDATE Tutor_Profiles SET CredentialFile=? WHERE ProfileID=?', (filename, profile_id))
    db.commit()


def set_verification(user_id, approved):
    db = get_db()
    db.execute('UPDATE Tutor_Profiles SET VerificationStatus=? WHERE UserID=?', (1 if approved else 0, user_id))
    db.commit()


def search(subject=None, max_rate=None, location=None):
    # Three-stage matching algorithm — Section 3.13.1
    sql = '''
        SELECT
            tp.*,
            u.FullName,
            u.Email,
            COALESCE(AVG(r.RatingScore), 0) AS AvgRating,
            COUNT(DISTINCT CASE WHEN b.Status='Completed' THEN b.BookingID END) AS CompletedCount,
            (COALESCE(AVG(r.RatingScore), 0) * ?)
              + (COUNT(DISTINCT CASE WHEN b.Status='Completed' THEN b.BookingID END) * ?) AS TrustScore
        FROM Tutor_Profiles tp
        JOIN Users u ON u.UserID = tp.UserID
        LEFT JOIN Bookings b ON b.TutorID = tp.UserID
        LEFT JOIN Reviews  r ON r.BookingID = b.BookingID AND r.IsModerated = 0
        WHERE tp.VerificationStatus = 1
    '''
    params = [TRUST_RATING_WEIGHT, TRUST_BOOKING_WEIGHT]

    # Stage 1 — exact subject filter
    if subject:
        sql += ' AND LOWER(tp.SubjectSpecialty) = LOWER(?)'
        params.append(subject)

    # Stage 2 — rate and location constraints
    if max_rate is not None:
        sql += ' AND tp.HourlyRate <= ?'
        params.append(float(max_rate))
    if location:
        sql += ' AND LOWER(tp.Location) LIKE LOWER(?)'
        params.append(f'%{location}%')

    sql += ' GROUP BY tp.ProfileID ORDER BY TrustScore DESC, AvgRating DESC'

    rows = get_db().execute(sql, params).fetchall()
    return [dict(r) for r in rows]


def all_pending():
    rows = get_db().execute('''
        SELECT tp.*, u.FullName, u.Email, u.CreatedAt
        FROM Tutor_Profiles tp
        JOIN Users u ON u.UserID = tp.UserID
        WHERE tp.VerificationStatus = 0
    ''').fetchall()
    return [dict(r) for r in rows]
