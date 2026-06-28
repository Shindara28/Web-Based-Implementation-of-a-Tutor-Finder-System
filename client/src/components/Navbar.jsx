import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, User, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const dashboardPath = user?.role === 'Admin' ? '/admin' : user?.role === 'Tutor' ? '/tutor' : '/student';

  return (
    <nav className="bg-zinc-900 shadow-sm border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center  gap-2 text-primary font-bold text-xl">
          <BookOpen size={24} />
          konnectEd
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/search" className="text-zinc-400 hover:text-primary text-sm font-medium transition">
            Find a Tutor
          </Link>

          {user ? (
            <>
              {(user.role === 'Student' || user.role === 'Tutor') && (
                <Link to="/messages" className="flex items-center gap-1 text-zinc-400 hover:text-primary text-sm transition">
                  <MessageSquare size={16} /> Messages
                </Link>
              )}
              <Link to={dashboardPath} className="flex items-center gap-1 text-zinc-400 hover:text-primary text-sm transition">
                <User size={16} /> {user.fullName}
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1 text-zinc-400 hover:text-red-400 text-sm transition">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-zinc-400 hover:text-primary text-sm font-medium transition">Login</Link>
              <Link to="/register" className="bg-primary hover:bg-primary-dark text-black text-sm font-medium px-4 py-2 rounded-lg transition">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
