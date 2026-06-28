import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [pending, setPending] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [tab, setTab] = useState('metrics');

  const load = () => {
    api.get('/admin/metrics').then(({ data }) => setMetrics(data));
    api.get('/admin/pending-tutors').then(({ data }) => setPending(data));
    api.get('/admin/reviews').then(({ data }) => setReviews(data));
  };
  useEffect(() => { load(); }, []);

  const verify = async (userId, approved) => {
    await api.patch(`/admin/tutors/${userId}/verify`, { approved });
    load();
  };

  const removeReview = async (id) => {
    await api.delete(`/admin/reviews/${id}`);
    load();
  };

  const TAB = [
    { id: 'metrics', label: 'Overview' },
    { id: 'tutors',  label: `Pending Tutors (${pending.length})` },
    { id: 'reviews', label: `Reviews (${reviews.length})` },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <h1 className="text-2xl font-bold text-navy">Admin Dashboard</h1>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-zinc-800">
        {TAB.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition ${
              tab === t.id
                ? 'border-primary text-primary'
                : 'border-transparent text-zinc-400 hover:text-navy'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'metrics' && metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {metrics.userCounts.map((u) => (
            <div key={u.UserRole} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 text-center shadow-sm">
              <p className="text-3xl font-bold text-primary">{u.Total}</p>
              <p className="text-zinc-400 text-sm mt-1">{u.UserRole}s</p>
            </div>
          ))}
          <div className="bg-zinc-900 rounded-xl border border-accent/30 p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-accent-dark">{metrics.pendingVerifications}</p>
            <p className="text-zinc-400 text-sm mt-1">Pending verifications</p>
          </div>
          {metrics.bookingCounts.map((b) => (
            <div key={b.Status} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 text-center shadow-sm">
              <p className="text-3xl font-bold text-navy">{b.Total}</p>
              <p className="text-zinc-400 text-sm mt-1">{b.Status}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pending tutors */}
      {tab === 'tutors' && (
        <div className="space-y-4">
          {pending.length === 0 && <p className="text-zinc-500 text-sm">No pending verifications.</p>}
          {pending.map((t) => (
            <div key={t.ProfileID} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-1">
                <p className="font-semibold text-navy">{t.FullName}</p>
                <p className="text-sm text-zinc-400">{t.Email}</p>
                <p className="text-sm text-primary">{t.SubjectSpecialty || 'No subject set'}</p>
                {t.Bio && <p className="text-sm text-zinc-400 line-clamp-2">{t.Bio}</p>}
                {t.CredentialFile && (
                  <a href={`/uploads/${t.CredentialFile}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                    View credentials
                  </a>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => verify(t.UserID, true)} className="bg-success hover:bg-success-dark text-black text-sm px-4 py-2 rounded-lg transition">Approve</button>
                <button onClick={() => verify(t.UserID, false)} className="bg-red-900 hover:bg-red-800 text-red-300 text-sm px-4 py-2 rounded-lg transition">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviews */}
      {tab === 'reviews' && (
        <div className="space-y-4">
          {reviews.length === 0 && <p className="text-zinc-500 text-sm">No reviews.</p>}
          {reviews.map((r) => (
            <div key={r.ReviewID} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-navy text-sm">{r.StudentName}</span>
                  <span className="text-zinc-500 text-xs">→</span>
                  <span className="text-primary text-sm">{r.TutorName}</span>
                  <span className="text-accent text-sm">{'★'.repeat(r.RatingScore)}</span>
                </div>
                {r.Comment && <p className="text-zinc-400 text-sm">{r.Comment}</p>}
              </div>
              <button onClick={() => removeReview(r.ReviewID)} className="shrink-0 text-xs bg-red-900 hover:bg-red-800 text-red-400 px-3 py-1.5 rounded-lg transition">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
