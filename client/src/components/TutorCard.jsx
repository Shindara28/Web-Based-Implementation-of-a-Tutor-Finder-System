import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Star, Award } from 'lucide-react';

export default function TutorCard({ tutor }) {
  const avgRating = Number(tutor.AvgRating || 0).toFixed(1);

  return (
    <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-5 flex flex-col gap-3 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-navy text-lg">{tutor.FullName}</h3>
          <span className="text-primary text-sm font-medium">{tutor.SubjectSpecialty}</span>
        </div>
        {tutor.VerificationStatus ? (
          <span className="flex items-center gap-1 text-success text-xs font-medium bg-success-light px-2 py-1 rounded-full">
            <Award size={12} /> Verified
          </span>
        ) : null}
      </div>

      <p className="text-zinc-400 text-sm line-clamp-2">{tutor.Bio}</p>

      <div className="flex flex-wrap gap-3 text-sm text-zinc-400">
        {tutor.Location && (
          <span className="flex items-center gap-1"><MapPin size={14} />{tutor.Location}</span>
        )}
        <span className="flex items-center gap-1"><DollarSign size={14} />₦{tutor.HourlyRate}/hr</span>
        <span className="flex items-center gap-1">
          <Star size={14} className="text-accent fill-accent" />
          {avgRating} ({tutor.CompletedCount} sessions)
        </span>
      </div>

      <Link
        to={`/tutors/${tutor.ProfileID}`}
        className="mt-1 text-center bg-primary hover:bg-primary-dark text-black text-sm font-medium py-2 rounded-lg transition"
      >
        View Profile
      </Link>
    </div>
  );
}
