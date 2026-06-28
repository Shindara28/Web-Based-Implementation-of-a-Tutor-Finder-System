import sqlite3
import bcrypt
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from db.database import DB_PATH, init_db

def seed():
    init_db()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")

    def h(pw): return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

    users = [
        ('Admin User',   'admin@tutor.com',  h('admin123'),   'Admin'),
        ('Alice Johnson','alice@student.com', h('student123'), 'Student'),
        ('Bob Smith',    'bob@student.com',   h('student123'), 'Student'),
        ('Dr. Carol White','carol@tutor.com', h('tutor123'),  'Tutor'),
        ('Mark Davis',   'mark@tutor.com',    h('tutor123'),  'Tutor'),
        ('Sarah Lee',    'sarah@tutor.com',   h('tutor123'),  'Tutor'),
    ]

    for name, email, pw, role in users:
        conn.execute(
            'INSERT OR IGNORE INTO Users (FullName, Email, PasswordHash, UserRole) VALUES (?,?,?,?)',
            (name, email, pw, role)
        )

    conn.commit()

    profiles = [
        ('carol@tutor.com', 'PhD in Mathematics with 10 years teaching experience.', 'Mathematics', 45.0, 'Lagos', 1),
        ('mark@tutor.com',  'Physics tutor specialising in A-Level and undergraduate.', 'Physics', 35.0, 'Abuja', 1),
        ('sarah@tutor.com', 'English Literature graduate, passionate about creative writing.', 'English', 30.0, 'Lagos', 0),
    ]

    for email, bio, subject, rate, location, verified in profiles:
        row = conn.execute('SELECT UserID FROM Users WHERE Email = ?', (email,)).fetchone()
        if row:
            conn.execute(
                '''INSERT OR IGNORE INTO Tutor_Profiles
                   (UserID, Bio, SubjectSpecialty, HourlyRate, Location, VerificationStatus)
                   VALUES (?,?,?,?,?,?)''',
                (row['UserID'], bio, subject, rate, location, verified)
            )

    conn.commit()
    conn.close()

    print("Seed complete.")
    print("  Admin   -> admin@tutor.com   / admin123")
    print("  Student -> alice@student.com / student123")
    print("  Tutor   -> carol@tutor.com   / tutor123")

if __name__ == '__main__':
    seed()
