import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Common & Protected
import { ProtectedRoute } from '../components/common/ProtectedRoute';

// Public Pages
import { Home } from '../pages/Home';
import { About } from '../pages/About';
import { Conditions } from '../pages/Conditions';
import { ConditionDetail } from '../pages/ConditionDetail';
import { CognitiveEnhancement } from '../pages/CognitiveEnhancement';
import { Contact } from '../pages/Contact';

// Auth Pages
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { ForgotPassword } from '../pages/ForgotPassword';
import { ResetPassword } from '../pages/ResetPassword';
import { VerifyEmail } from '../pages/VerifyEmail';

// Dashboards & Exercises
import { SelfUserDashboard } from '../pages/SelfUserDashboard';
import { ClinicianDashboard } from '../pages/ClinicianDashboard';
import { AdminDashboard } from '../pages/AdminDashboard';
import { ExercisePage } from '../pages/ExercisePage';
import { NotFound } from '../pages/NotFound';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Main Layout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="conditions" element={<Conditions />} />
        <Route path="conditions/:slug" element={<ConditionDetail />} />
        <Route path="cognitive-enhancement" element={<CognitiveEnhancement />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      {/* Auth Layout */}
      <Route path="/" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route path="verify-email" element={<VerifyEmail />} />
      </Route>

      {/* Protected Dashboards & Exercises */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="self"
          element={
            <ProtectedRoute allowedRoles={['self_user']}>
              <SelfUserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="clinician"
          element={
            <ProtectedRoute allowedRoles={['clinician']}>
              <ClinicianDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin Route */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
      </Route>

      {/* Reusable Exercise Route */}
      <Route
        path="/exercises/:exerciseId"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ExercisePage />} />
      </Route>

      {/* Fallback 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
