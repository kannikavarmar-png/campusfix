import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { CampusFixAssistant } from './components/chat/CampusFixAssistant';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { AuthPage } from './pages/AuthPage';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { TrackComplaintPage } from './pages/TrackComplaintPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminComplaintsPage } from './pages/AdminComplaintsPage';

function RequireAuth({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoadingSpinner label="Verifying campus session..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requiredRole === 'admin' && user.role !== 'admin') {
    return <Navigate to="/student" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/report" element={<ReportIssuePage />} />
            <Route path="/track" element={<TrackComplaintPage />} />

            <Route
              path="/student"
              element={
                <RequireAuth>
                  <StudentDashboard />
                </RequireAuth>
              }
            />

            <Route
              path="/admin"
              element={
                <RequireAuth requiredRole="admin">
                  <AdminDashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/complaints"
              element={
                <RequireAuth requiredRole="admin">
                  <AdminComplaintsPage />
                </RequireAuth>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Persistent AI Helpdesk Chatbot */}
          <CampusFixAssistant />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
