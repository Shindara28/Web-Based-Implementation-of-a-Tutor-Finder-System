from db.database import get_db


def find_by_booking(booking_id):
    row = get_db().execute('SELECT * FROM Reviews WHERE BookingID = ?', (booking_id,)).fetchone()
    return dict(row) if row else None


def for_tutor(tutor_id):
    rows = get_db().execute('''
        SELECT r.*, u.FullName AS StudentName
        FROM Reviews r
        JOIN Bookings b ON b.BookingID = r.BookingID
        JOIN Users u ON u.UserID = r.StudentID
        WHERE b.TutorID = ? AND r.IsModerated = 0
        ORDER BY r.CreatedAt DESC
    ''', (tutor_id,)).fetchall()
    return [dict(r) for r in rows]


def create(booking_id, student_id, rating_score, comment):
    db = get_db()
    cursor = db.execute(
        'INSERT INTO Reviews (BookingID, StudentID, RatingScore, Comment) VALUES (?,?,?,?)',
        (booking_id, student_id, rating_score, comment)
    )
    db.commit()
    return cursor.lastrowid


def delete(review_id):
    db = get_db()
    db.execute('DELETE FROM Reviews WHERE ReviewID = ?', (review_id,))
    db.commit()


def all_reviews():
    rows = get_db().execute('''
        SELECT r.*, u.FullName AS StudentName, tu.FullName AS TutorName
        FROM Reviews r
        JOIN Bookings b ON b.BookingID = r.BookingID
        JOIN Users u  ON u.UserID = r.StudentID
        JOIN Users tu ON tu.UserID = b.TutorID
        ORDER BY r.CreatedAt DESC
    ''').fetchall()
    return [dict(r) for r in rows]
