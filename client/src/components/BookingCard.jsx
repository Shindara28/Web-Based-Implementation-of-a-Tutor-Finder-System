import React, { useState } from 'react';
import { Calendar, User } from 'lucide-react';
import api from '../utils/api';
import ReviewForm from './ReviewForm';

const STATUS_COLORS = {
  Pending:   'bg-accent-light text-accent-dark',
  Confirmed: 'bg-primary-light text-white',
  Completed: 'bg-success-light text-success',
  Cancelled: 'bg-red-900 text-red-300',
};

export default function BookingCard({ booking, role, onUpdate }) {
  const [error, setError] = useState('');
  const [showReview, setShowReview] = useState(false);

  const changeStatus = async (status) => {
    try {
      await api.patch(`/bookings/${booking.BookingID}/status`, { status });
      onUpdate?.();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-navy">
          <Calendar size={16} />
          <span className="font-medium">{booking.SessionDate}</span>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[booking.Status]}`}>
          {booking.Status}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <User size={14} />
        {role === 'Student' ? booking.TutorName : booking.StudentName}
        {booking.SubjectSpecialty && <span className="text-primary">· {booking.SubjectSpecialty}</span>}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-2 flex-wrap">
        {role === 'Tutor' && booking.Status === 'Pending' && (
          <>
            <button onClick={() => changeStatus('Confirmed')} className="text-xs bg-primary hover:bg-primary-dark text-black px-3 py-1 rounded-lg transition">Confirm</button>
            <button onClick={() => changeStatus('Cancelled')} className="text-xs bg-red-900 text-red-300 px-3 py-1 rounded-lg hover:bg-red-800 transition">Cancel</button>
          </>
        )}
        {role === 'Tutor' && booking.Status === 'Confirmed' && (
          <button onClick={() => changeStatus('Completed')} className="text-xs bg-success hover:bg-success-dark text-black px-3 py-1 rounded-lg transition">Mark Completed</button>
        )}
        {role === 'Student' && booking.Status === 'Pending' && (
          <button onClick={() => changeStatus('Cancelled')} className="text-xs bg-red-900 text-red-300 px-3 py-1 rounded-lg hover:bg-red-800 transition">Cancel</button>
        )}
        {role === 'Student' && booking.Status === 'Completed' && (
          <button onClick={() => setShowReview(!showReview)} className="text-xs bg-accent-light text-accent-dark px-3 py-1 rounded-lg hover:bg-accent/20 transition">
            {showReview ? 'Hide' : 'Leave Review'}
          </button>
        )}
      </div>

      {showReview && (
        <ReviewForm bookingId={booking.BookingID} onSubmitted={() => { setShowReview(false); onUpdate?.(); }} />
      )}
    </div>
  );
}
