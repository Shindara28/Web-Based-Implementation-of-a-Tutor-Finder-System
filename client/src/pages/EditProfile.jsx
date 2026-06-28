import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import api from '../utils/api';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science', 'Economics'];

export default function EditProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ bio: '', subjectSpecialty: '', hourlyRate: '', location: '' });
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/profiles/me').then(({ data }) => {
      setForm({
        bio: data.Bio || '',
        subjectSpecialty: data.SubjectSpecialty || '',
        hourlyRate: data.HourlyRate || '',
        location: data.Location || '',
      });
    });
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    setSaving(true);
    try {
      await api.put('/profiles', form);
      if (file) {
        const fd = new FormData();
        fd.append('credential', file);
        await api.post('/profiles/credentials', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setMsg('Profile saved successfully.');
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setError(msgs ? msgs.map((m) => m.msg).join(', ') : err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-navy mb-6">Edit Profile</h1>

      {msg   && <p className="bg-success-light text-success-dark text-sm p-3 rounded-lg mb-4">{msg}</p>}
      {error && <p className="bg-red-900 text-red-400 text-sm p-3 rounded-lg mb-4">{error}</p>}

      <form onSubmit={save} className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-5 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-navy mb-1">Subject Specialty</label>
          <select
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:ring-2 focus:ring-primary outline-none"
            value={form.subjectSpecialty}
            onChange={set('subjectSpecialty')}
          >
            <option value="">Select subject…</option>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-1">Bio</label>
          <textarea
            rows={4}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:ring-2 focus:ring-primary outline-none resize-none"
            value={form.bio}
            onChange={set('bio')}
            placeholder="Tell students about your experience…"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Hourly Rate (₦)</label>
            <input
              type="number"
              min="0"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:ring-2 focus:ring-primary outline-none"
              value={form.hourlyRate}
              onChange={set('hourlyRate')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Location</label>
            <input
              type="text"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:ring-2 focus:ring-primary outline-none"
              value={form.location}
              onChange={set('location')}
              placeholder="e.g. Lagos"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-1">
            <Upload size={14} className="inline mr-1" />
            Upload Credentials (PDF or JPEG, max 5 MB)
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg"
            className="block w-full text-sm text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-primary-light file:text-primary hover:file:bg-primary-light/70"
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary-dark text-black font-semibold px-6 py-2 rounded-lg transition disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
          <button type="button" onClick={() => navigate('/tutor')} className="text-zinc-400 hover:text-navy px-4 py-2 text-sm transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
