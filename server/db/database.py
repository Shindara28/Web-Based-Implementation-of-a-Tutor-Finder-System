import sqlite3
import os
from flask import g

DB_PATH = os.path.join(os.path.dirname(__file__), 'tutor_finder.sqlite')

# Additions vs Chapter 3, Section 3.11 MySQL schema (flagged):
#   Tutor_Profiles.Location TEXT      — required for Stage 2 location filter (3.13.1)
#   Tutor_Profiles.CredentialFile TEXT — required for FR #2 credential upload
#   Reviews.StudentID INTEGER          — needed to identify review author for moderation
#   Reviews.IsModerated INTEGER        — needed for FR #6 admin review moderation
#   Bookings/Reviews.CreatedAt         — audit trail
#   Messages table (new)              — direct student-tutor messaging feature
SCHEMA = """
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS Users (
    UserID       INTEGER PRIMARY KEY AUTOINCREMENT,
    FullName     TEXT NOT NULL,
    Email        TEXT NOT NULL UNIQUE,
    PasswordHash TEXT NOT NULL,
    UserRole     TEXT NOT NULL CHECK(UserRole IN ('Student','Tutor','Admin')),
    CreatedAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Tutor_Profiles (
    ProfileID          INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID             INTEGER NOT NULL UNIQUE,
    Bio                TEXT,
    SubjectSpecialty   TEXT,
    HourlyRate         REAL,
    Location           TEXT,
    CredentialFile     TEXT,
    VerificationStatus INTEGER DEFAULT 0,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Bookings (
    BookingID   INTEGER PRIMARY KEY AUTOINCREMENT,
    StudentID   INTEGER NOT NULL,
    TutorID     INTEGER NOT NULL,
    SessionDate TEXT NOT NULL,
    Status      TEXT DEFAULT 'Pending'
                     CHECK(Status IN ('Pending','Confirmed','Completed','Cancelled')),
    CreatedAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (StudentID) REFERENCES Users(UserID),
    FOREIGN KEY (TutorID)   REFERENCES Users(UserID)
);

CREATE TABLE IF NOT EXISTS Reviews (
    ReviewID    INTEGER PRIMARY KEY AUTOINCREMENT,
    BookingID   INTEGER NOT NULL UNIQUE,
    StudentID   INTEGER NOT NULL,
    RatingScore INTEGER CHECK(RatingScore BETWEEN 1 AND 5),
    Comment     TEXT,
    IsModerated INTEGER DEFAULT 0,
    CreatedAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (BookingID) REFERENCES Bookings(BookingID),
    FOREIGN KEY (StudentID) REFERENCES Users(UserID)
);

CREATE TABLE IF NOT EXISTS Messages (
    MessageID  INTEGER PRIMARY KEY AUTOINCREMENT,
    SenderID   INTEGER NOT NULL,
    ReceiverID INTEGER NOT NULL,
    Body       TEXT NOT NULL,
    IsRead     INTEGER DEFAULT 0,
    CreatedAt  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (SenderID)   REFERENCES Users(UserID),
    FOREIGN KEY (ReceiverID) REFERENCES Users(UserID)
);

CREATE INDEX IF NOT EXISTS idx_profiles_subject  ON Tutor_Profiles(SubjectSpecialty);
CREATE INDEX IF NOT EXISTS idx_profiles_rate     ON Tutor_Profiles(HourlyRate);
CREATE INDEX IF NOT EXISTS idx_bookings_status   ON Bookings(Status);
CREATE INDEX IF NOT EXISTS idx_bookings_tutor    ON Bookings(TutorID);
CREATE INDEX IF NOT EXISTS idx_bookings_student  ON Bookings(StudentID);
CREATE INDEX IF NOT EXISTS idx_messages_sender   ON Messages(SenderID);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON Messages(ReceiverID);
"""


def get_db():
    if 'db' not in g:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        conn.execute("PRAGMA journal_mode = WAL")
        g.db = conn
    return g.db


def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.executescript(SCHEMA)
    conn.commit()
    conn.close()
