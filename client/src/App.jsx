import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TutorDashboard from './pages/TutorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SearchPage from './pages/SearchPage';
import TutorProfilePage from './pages/TutorProfilePage';
import EditProfile from './pages/EditProfile';
import BookingPage from './pages/BookingPage';
import MessagesPage from './pages/MessagesPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="min-h-screen bg-app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/tutors/:id" element={<TutorProfilePage />} />

            <Route element={<ProtectedRoute roles={['Student']} />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/book/:tutorId" element={<BookingPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={['Tutor']} />}>
              <Route path="/tutor" element={<TutorDashboard />} />
              <Route path="/tutor/profile" element={<EditProfile />} />
            </Route>

            <Route element={<ProtectedRoute roles={['Student', 'Tutor']} />}>
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/messages/:userId" element={<MessagesPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={['Admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
