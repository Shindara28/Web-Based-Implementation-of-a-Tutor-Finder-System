import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import api from '../utils/api';

export default function BookingPage() {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [sessionDate, setSessionDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/search').then(({ data }) => {
      const found = data.find((t) => String(t.UserID) === String(tutorId));
      setTutor(found || null);
    });
  }, [tutorId]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/bookings', { tutorId: Number(tutorId), sessionDate });
      navigate('/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex justify-center items-start pt-20 min-h-screen px-4">
      <div className="bg-zinc-900 rounded-2xl shadow-sm border border-zinc-800 p-8 w-full max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Book a Session</h1>
          {tutor && (
            <p className="text-zinc-400 text-sm mt-1">
              with <span className="font-medium text-navy">{tutor.FullName}</span> · {tutor.SubjectSpecialty}
            </p>
          )}
        </div>

        {error && <p className="bg-red-900 text-red-400 text-sm p-3 rounded-lg">{error}</p>}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy mb-1">
              <Calendar size={14} className="inline mr-1" />
              Session Date
            </label>
            <input
              type="date"
              required
              min={today}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:ring-2 focus:ring-primary outline-none"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
            />
          </div>

          {tutor && (
            <p className="text-sm text-zinc-400">Rate: <strong className="text-navy">₦{tutor.HourlyRate}/hr</strong></p>
          )}

          <button
            type="submit"
            disabled={loading || !sessionDate}
            className="w-full bg-primary hover:bg-primary-dark text-black font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Booking…' : 'Request Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
