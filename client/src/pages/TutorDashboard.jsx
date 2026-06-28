import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, MessageSquare } from 'lucide-react';
import api from '../utils/api';
import BookingCard from '../components/BookingCard';
import { useAuth } from '../context/AuthContext';

export default function TutorDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState(null);

  const load = () => {
    api.get('/bookings').then(({ data }) => setBookings(data));
    api.get('/profiles/me').then(({ data }) => setProfile(data));
  };
  useEffect(() => { load(); }, []);

  const pending   = bookings.filter((b) => b.Status === 'Pending');
  const confirmed = bookings.filter((b) => b.Status === 'Confirmed');
  const past      = bookings.filter((b) => ['Completed', 'Cancelled'].includes(b.Status));

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Tutor Dashboard</h1>
          <p className="text-zinc-400 text-sm">{user?.fullName}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/messages" className="flex items-center gap-2 border border-zinc-700 hover:border-primary text-zinc-400 hover:text-primary text-sm font-medium px-4 py-2 rounded-lg transition">
            <MessageSquare size={16} /> Messages
          </Link>
          <Link to="/tutor/profile" className="flex items-center gap-2 border border-zinc-700 hover:border-primary text-zinc-400 hover:text-primary text-sm font-medium px-4 py-2 rounded-lg transition">
            <Settings size={16} /> Edit Profile
          </Link>
        </div>
      </div>

      {profile && (
        <div className={`rounded-xl p-4 text-sm font-medium ${
          profile.VerificationStatus
            ? 'bg-success-light text-success-dark'
            : 'bg-accent-light text-accent-dark'
        }`}>
          {profile.VerificationStatus
            ? 'Your profile is verified. Students can find and book you.'
            : 'Your profile is pending admin verification. Complete your profile and upload credentials to speed up approval.'}
        </div>
      )}

      {[
        { label: 'Pending Requests', items: pending },
        { label: 'Confirmed Sessions', items: confirmed },
        { label: 'Past Sessions', items: past },
      ].map(({ label, items }) => (
        <section key={label}>
          <h2 className="text-lg font-semibold text-navy mb-3">{label}</h2>
          {items.length === 0
            ? <p className="text-zinc-500 text-sm">None.</p>
            : <div className="space-y-3">{items.map((b) => <BookingCard key={b.BookingID} booking={b} role="Tutor" onUpdate={load} />)}</div>
          }
        </section>
      ))}
    </div>
  );
}
