import React, { useState, useCallback } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import api from '../utils/api';
import TutorCard from '../components/TutorCard';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science', 'Economics'];

export default function SearchPage() {
  const [filters, setFilters] = useState({ subject: '', maxRate: '', location: '' });
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  const search = useCallback(async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const { data } = await api.get('/search', { params });
      setResults(data);
      setSearched(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-navy mb-8">Find a Tutor</h1>

      <form onSubmit={search} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Subject</label>
            <select
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:ring-2 focus:ring-primary outline-none"
              value={filters.subject}
              onChange={set('subject')}
            >
              <option value="">All subjects</option>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-1">Max Rate (₦/hr)</label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 50"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:ring-2 focus:ring-primary outline-none"
              value={filters.maxRate}
              onChange={set('maxRate')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-1">Location</label>
            <input
              type="text"
              placeholder="e.g. Lagos"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:ring-2 focus:ring-primary outline-none"
              value={filters.location}
              onChange={set('location')}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 flex items-center gap-2 bg-primary hover:bg-primary-dark text-black font-medium px-6 py-2 rounded-lg transition disabled:opacity-50"
        >
          <Search size={16} />
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {searched && (
        results.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <SlidersHorizontal size={40} className="mx-auto mb-3" />
            <p>No tutors match your criteria. Try broadening your filters.</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-zinc-400 mb-4">{results.length} tutor{results.length !== 1 ? 's' : ''} found · ranked by TrustScore</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((t) => <TutorCard key={t.ProfileID} tutor={t} />)}
            </div>
          </div>
        )
      )}
    </div>
  );
}
