import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'Student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const ROLE_DASH = { Student: '/student', Tutor: '/tutor' };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      navigate(ROLE_DASH[user.role] || '/');
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setError(msgs ? msgs.map((m) => m.msg).join(', ') : err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="flex justify-center items-start pt-16 min-h-screen px-4">
      <div className="bg-zinc-900 rounded-2xl shadow-sm border border-zinc-800 p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-navy mb-6">Create Account</h1>

        {error && <p className="bg-red-900 text-red-400 text-sm p-3 rounded-lg mb-4">{error}</p>}

        <form onSubmit={submit} className="space-y-4">
          {[
            { label: 'Full Name', key: 'fullName', type: 'text' },
            { label: 'Email', key: 'email', type: 'email' },
            { label: 'Password', key: 'password', type: 'password' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-navy mb-1">{label}</label>
              <input
                type={type}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:ring-2 focus:ring-primary outline-none"
                value={form[key]}
                onChange={set(key)}
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-navy mb-1">I am a…</label>
            <select
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:ring-2 focus:ring-primary outline-none"
              value={form.role}
              onChange={set('role')}
            >
              <option value="Student">Student</option>
              <option value="Tutor">Tutor</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-black font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-sm text-zinc-400 text-center">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
