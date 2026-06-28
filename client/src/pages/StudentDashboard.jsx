import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MessageSquare } from 'lucide-react';
import api from '../utils/api';
import BookingCard from '../components/BookingCard';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);

  const load = () => api.get('/bookings').then(({ data }) => setBookings(data));
  useEffect(() => { load(); }, []);

  const active = bookings.filter((b) => ['Pending', 'Confirmed'].includes(b.Status));
  const past   = bookings.filter((b) => ['Completed', 'Cancelled'].includes(b.Status));

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Welcome, {user?.fullName}</h1>
          <p className="text-zinc-400 text-sm">Manage your sessions below.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/messages" className="flex items-center gap-2 border border-zinc-700 hover:border-primary text-zinc-400 hover:text-primary text-sm font-medium px-4 py-2 rounded-lg transition">
            <MessageSquare size={16} /> Messages
          </Link>
          <Link to="/search" className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-black text-sm font-medium px-4 py-2 rounded-lg transition">
            <Search size={16} /> Find Tutor
          </Link>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-navy mb-3">Active Bookings</h2>
        {active.length === 0
          ? <p className="text-zinc-500 text-sm">No active bookings.</p>
          : <div className="space-y-3">{active.map((b) => <BookingCard key={b.BookingID} booking={b} role="Student" onUpdate={load} />)}</div>
        }
      </section>

      <section>
        <h2 className="text-lg font-semibold text-navy mb-3">Past Sessions</h2>
        {past.length === 0
          ? <p className="text-zinc-500 text-sm">No past sessions.</p>
          : <div className="space-y-3">{past.map((b) => <BookingCard key={b.BookingID} booking={b} role="Student" onUpdate={load} />)}</div>
        }
      </section>
    </div>
  );
}
