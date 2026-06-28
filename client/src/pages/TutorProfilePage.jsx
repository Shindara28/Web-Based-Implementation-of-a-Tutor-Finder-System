import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, DollarSign, Award, Star, FileText, MessageSquare } from 'lucide-react';
import api from '../utils/api';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';

export default function TutorProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/profiles/${id}`),
      api.get(`/reviews/tutor/${id}`),
    ]).then(([p, r]) => {
      setProfile(p.data);
      setReviews(r.data);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center p-20 text-zinc-500">Loading…</div>;
  if (!profile) return <div className="flex justify-center p-20 text-zinc-500">Profile not found</div>;

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.RatingScore, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Header card */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 shadow-sm space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy">{profile.FullName}</h1>
            <p className="text-primary font-medium">{profile.SubjectSpecialty}</p>
          </div>
          {profile.VerificationStatus ? (
            <span className="flex items-center gap-1 text-success text-sm font-medium bg-success-light px-3 py-1 rounded-full">
              <Award size={14} /> Verified
            </span>
          ) : (
            <span className="text-accent-dark text-sm bg-accent-light px-3 py-1 rounded-full">Pending verification</span>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
          {profile.Location && <span className="flex items-center gap-1"><MapPin size={14} />{profile.Location}</span>}
          <span className="flex items-center gap-1"><DollarSign size={14} />₦{profile.HourlyRate}/hr</span>
          {avgRating && (
            <span className="flex items-center gap-1">
              <Star size={14} className="text-accent fill-accent" />
              {avgRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </span>
          )}
        </div>

        <p className="text-zinc-400 leading-relaxed">{profile.Bio}</p>

        {profile.CredentialFile && (
          <a
            href={`/uploads/${profile.CredentialFile}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary text-sm hover:underline"
          >
            <FileText size={14} /> View Credentials
          </a>
        )}

        {user?.role === 'Student' && (
          <div className="flex gap-3 mt-2 flex-wrap">
            {profile.VerificationStatus ? (
              <Link
                to={`/book/${profile.UserID}`}
                className="inline-block bg-primary hover:bg-primary-dark text-black font-semibold px-6 py-2.5 rounded-xl transition"
              >
                Book a Session
              </Link>
            ) : null}
            <Link
              to={`/messages/${profile.UserID}`}
              className="inline-flex items-center gap-2 border border-primary text-primary hover:bg-primary-light font-semibold px-6 py-2.5 rounded-xl transition"
            >
              <MessageSquare size={16} /> Message
            </Link>
          </div>
        )}
      </div>

      {/* Reviews */}
      <div>
        <h2 className="text-xl font-semibold text-navy mb-4">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-zinc-500 text-sm">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.ReviewID} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-navy text-sm">{r.StudentName}</span>
                  <StarRating value={r.RatingScore} readOnly />
                </div>
                {r.Comment && <p className="text-zinc-400 text-sm">{r.Comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
