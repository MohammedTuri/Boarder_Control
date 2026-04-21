import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';

// Admin Command Center Components
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Processing from './pages/Processing';
import History from './pages/History';
import Settings from './pages/Settings';
import Login from './pages/Login';
import UserManagement from './pages/UserManagement';
import TravelerSearch from './pages/TravelerSearch';
import Profile from './pages/Profile';
import Watchlist from './pages/Watchlist';
import AuditLogs from './pages/AuditLogs';
import ApplicationReview from './pages/ApplicationReview';
import TravelerProfile from './pages/TravelerProfile';
import VisaDocument from './pages/VisaDocument';

// Public Portal Components
import PublicLayout from './components/PublicLayout';
import Home from './pages/public/Home';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Information from './pages/public/Information';
import Apply from './pages/public/Apply';
import Status from './pages/public/Status';

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="apply" element={<Apply />} />
              <Route path="status" element={<Status />} />
              <Route path="verify/:reference" element={<VisaDocument />} />
              <Route path="contact" element={<Contact />} />
            </Route>

            {/* Auth Gateway */}
            <Route path="/login" element={<Login />} />

            {/* Admin Command Center Routes - All Protected */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="processing" element={<Processing />} />
              <Route 
                path="applications" 
                element={
                  <RoleProtectedRoute allowedRoles={['Administrator', 'Supervisor']}>
                    <ApplicationReview />
                  </RoleProtectedRoute>
                } 
              />
              <Route path="search" element={<TravelerSearch />} />
              <Route path="profile/:passport" element={<TravelerProfile />} />
              <Route path="visa/:reference" element={<VisaDocument />} />
              <Route path="profile" element={<Profile />} />
              <Route 
                path="history" 
                element={
                  <RoleProtectedRoute allowedRoles={['Administrator', 'Supervisor']}>
                    <History />
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path="watchlist" 
                element={
                  <RoleProtectedRoute allowedRoles={['Administrator', 'Supervisor']}>
                    <Watchlist />
                  </RoleProtectedRoute>
                } 
              />
              
              {/* Superceded Role Protected Routes */}
              <Route 
                path="users" 
                element={
                  <RoleProtectedRoute allowedRoles={['Administrator']}>
                    <UserManagement />
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path="settings" 
                element={
                  <RoleProtectedRoute allowedRoles={['Administrator', 'Supervisor']}>
                    <Settings />
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path="audit" 
                element={
                  <RoleProtectedRoute allowedRoles={['Administrator']}>
                    <AuditLogs />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
