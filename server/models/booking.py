from db.database import get_db


def find_by_id(booking_id):
    row = get_db().execute('SELECT * FROM Bookings WHERE BookingID = ?', (booking_id,)).fetchone()
    return dict(row) if row else None


def for_student(student_id):
    rows = get_db().execute('''
        SELECT b.*, u.FullName AS TutorName, tp.SubjectSpecialty
        FROM Bookings b
        JOIN Users u ON u.UserID = b.TutorID
        LEFT JOIN Tutor_Profiles tp ON tp.UserID = b.TutorID
        WHERE b.StudentID = ?
        ORDER BY b.SessionDate DESC
    ''', (student_id,)).fetchall()
    return [dict(r) for r in rows]


def for_tutor(tutor_id):
    rows = get_db().execute('''
        SELECT b.*, u.FullName AS StudentName
        FROM Bookings b
        JOIN Users u ON u.UserID = b.StudentID
        WHERE b.TutorID = ?
        ORDER BY b.SessionDate DESC
    ''', (tutor_id,)).fetchall()
    return [dict(r) for r in rows]


def has_conflict(tutor_id, session_date, exclude_id=None):
    if exclude_id:
        row = get_db().execute(
            "SELECT 1 FROM Bookings WHERE TutorID=? AND SessionDate=? AND Status IN ('Pending','Confirmed') AND BookingID != ?",
            (tutor_id, session_date, exclude_id)
        ).fetchone()
    else:
        row = get_db().execute(
            "SELECT 1 FROM Bookings WHERE TutorID=? AND SessionDate=? AND Status IN ('Pending','Confirmed')",
            (tutor_id, session_date)
        ).fetchone()
    return row is not None


def create(student_id, tutor_id, session_date):
    db = get_db()
    cursor = db.execute(
        'INSERT INTO Bookings (StudentID, TutorID, SessionDate) VALUES (?,?,?)',
        (student_id, tutor_id, session_date)
    )
    db.commit()
    return cursor.lastrowid


def update_status(booking_id, status):
    db = get_db()
    db.execute('UPDATE Bookings SET Status=? WHERE BookingID=?', (status, booking_id))
    db.commit()


def count_by_status():
    rows = get_db().execute('SELECT Status, COUNT(*) AS Total FROM Bookings GROUP BY Status').fetchall()
    return [dict(r) for r in rows]
