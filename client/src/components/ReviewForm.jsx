import React, { useState } from 'react';
import api from '../utils/api';
import StarRating from './StarRating';

export default function ReviewForm({ bookingId, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a star rating'); return; }
    setSubmitting(true);
    try {
      await api.post('/reviews', { bookingId, ratingScore: rating, comment });
      onSubmitted?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="border-t pt-3 space-y-2">
      <StarRating value={rating} onChange={setRating} />
      <textarea
        className="w-full text-sm border border-zinc-700 rounded-lg p-2 resize-none focus:ring-2 focus:ring-primary outline-none"
        rows={3}
        placeholder="Share your experience (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="bg-primary hover:bg-primary-dark text-black text-sm px-4 py-1.5 rounded-lg transition disabled:opacity-50"
      >
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  );
}
