import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageTeachers from './pages/admin/ManageTeachers';
import ManageStudents from './pages/admin/ManageStudents';
import ManageSubjects from './pages/admin/ManageSubjects';
import ViewReports from './pages/admin/ViewReports';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import MarkAttendance from './pages/teacher/MarkAttendance';
import TodayAttendance from './pages/teacher/TodayAttendance';
import TeacherReports from './pages/teacher/TeacherReports';
import SearchStudent from './pages/teacher/SearchStudent';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';

// Layout Wrapper for Authenticated Users
const Layout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth > 992 : true
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`app-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main portal layout */}
      <div className="portal-layout">
        <Navbar onMenuClick={toggleSidebar} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      {/* Backdrop for mobile menu */}
      <div className="sidebar-backdrop" onClick={toggleSidebar}></div>

      <style>{`
        .portal-layout {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .main-content {
          margin-top: 70px; /* Space for fixed navbar */
          padding: 30px;
          min-height: calc(100vh - 70px);
        }

        .sidebar-backdrop {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          z-index: 95;
        }

        @media (max-width: 992px) {
          .app-container.sidebar-open .sidebar-backdrop {
            display: block;
          }
        }
      `}</style>
    </div>
  );
};

// Root Router Redirect Helper
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher" replace />;
    if (user.role === 'student') return <Navigate to="/student" replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="teachers" element={<ManageTeachers />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="subjects" element={<ManageSubjects />} />
            <Route path="reports" element={<ViewReports />} />
          </Route>

          {/* Teacher Protected Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TeacherDashboard />} />
            <Route path="mark" element={<MarkAttendance />} />
            <Route path="today" element={<TodayAttendance />} />
            <Route path="reports" element={<TeacherReports />} />
            <Route path="search" element={<SearchStudent />} />
          </Route>

          {/* Student Protected Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
