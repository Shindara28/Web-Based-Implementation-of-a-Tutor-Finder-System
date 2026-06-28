from db.database import get_db


def find_by_email(email):
    row = get_db().execute('SELECT * FROM Users WHERE Email = ?', (email,)).fetchone()
    return dict(row) if row else None


def find_by_id(user_id):
    row = get_db().execute(
        'SELECT UserID, FullName, Email, UserRole, CreatedAt FROM Users WHERE UserID = ?',
        (user_id,)
    ).fetchone()
    return dict(row) if row else None


def create(full_name, email, password_hash, role):
    db = get_db()
    cursor = db.execute(
        'INSERT INTO Users (FullName, Email, PasswordHash, UserRole) VALUES (?,?,?,?)',
        (full_name, email, password_hash, role)
    )
    db.commit()
    return cursor.lastrowid
