from db.database import get_db


def get_thread(current_user_id, other_user_id):
    rows = get_db().execute('''
        SELECT m.*, s.FullName AS SenderName, r.FullName AS ReceiverName
        FROM Messages m
        JOIN Users s ON s.UserID = m.SenderID
        JOIN Users r ON r.UserID = m.ReceiverID
        WHERE (m.SenderID = ? AND m.ReceiverID = ?)
           OR (m.SenderID = ? AND m.ReceiverID = ?)
        ORDER BY m.CreatedAt ASC
    ''', (current_user_id, other_user_id, other_user_id, current_user_id)).fetchall()
    return [dict(r) for r in rows]


def get_conversations(user_id):
    # One row per conversation partner, with last message and unread count
    rows = get_db().execute('''
        SELECT
            u.UserID,
            u.FullName,
            u.UserRole,
            (
                SELECT Body FROM Messages
                WHERE (SenderID = u.UserID AND ReceiverID = ?)
                   OR (SenderID = ? AND ReceiverID = u.UserID)
                ORDER BY CreatedAt DESC LIMIT 1
            ) AS LastMessage,
            (
                SELECT CreatedAt FROM Messages
                WHERE (SenderID = u.UserID AND ReceiverID = ?)
                   OR (SenderID = ? AND ReceiverID = u.UserID)
                ORDER BY CreatedAt DESC LIMIT 1
            ) AS LastMessageAt,
            (
                SELECT COUNT(*) FROM Messages
                WHERE SenderID = u.UserID AND ReceiverID = ? AND IsRead = 0
            ) AS UnreadCount
        FROM Users u
        WHERE u.UserID IN (
            SELECT CASE WHEN SenderID = ? THEN ReceiverID ELSE SenderID END
            FROM Messages
            WHERE SenderID = ? OR ReceiverID = ?
        )
        ORDER BY LastMessageAt DESC
    ''', (user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id)).fetchall()
    return [dict(r) for r in rows]


def send(sender_id, receiver_id, body):
    db = get_db()
    cursor = db.execute(
        'INSERT INTO Messages (SenderID, ReceiverID, Body) VALUES (?,?,?)',
        (sender_id, receiver_id, body)
    )
    db.commit()
    return cursor.lastrowid


def mark_read(sender_id, receiver_id):
    db = get_db()
    db.execute(
        'UPDATE Messages SET IsRead = 1 WHERE SenderID = ? AND ReceiverID = ? AND IsRead = 0',
        (sender_id, receiver_id)
    )
    db.commit()
