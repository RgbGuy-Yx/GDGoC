import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminCandidates } from './pages/admin/AdminCandidates';
import { DomainCandidates } from './pages/admin/DomainCandidates';
import { TeamLeadsPage } from './pages/admin/TeamLeadsPage';
import { EvaluationsPage } from './pages/admin/EvaluationsPage';
import { TransfersPage } from './pages/admin/TransfersPage';
import { FinalResultsPage } from './pages/admin/FinalResultsPage';
import { ImportCandidates } from './pages/admin/ImportCandidates';

import { LeadOverview } from './pages/lead/LeadOverview';
import { LeadCandidates } from './pages/lead/LeadCandidates';
import { LeadShortlisted } from './pages/lead/LeadShortlisted';
import { LeadNotShortlisted } from './pages/lead/LeadNotShortlisted';
import { TransferredToMe } from './pages/lead/TransferredToMe';
import { TransferredByMe } from './pages/lead/TransferredByMe';

import { CandidateProfilePage } from './pages/CandidateProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

// Helper component to redirect root "/" based on auth role
const RootRedirect = () => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === 'admin' ? '/admin' : '/lead'} replace />;
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Admin Dashboard Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="candidates" element={<AdminCandidates />} />
            <Route path="candidates/:id" element={<CandidateProfilePage />} />
            <Route path="domains" element={<DomainCandidates />} />
            <Route path="leads" element={<TeamLeadsPage />} />
            <Route path="evaluations" element={<EvaluationsPage />} />
            <Route path="transfers" element={<TransfersPage />} />
            <Route path="final-results" element={<FinalResultsPage />} />
            <Route path="import" element={<ImportCandidates />} />
          </Route>

          {/* Team Lead Dashboard Routes */}
          <Route
            path="/lead"
            element={
              <ProtectedRoute allowedRoles={['lead', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<LeadOverview />} />
            <Route path="candidates" element={<LeadCandidates />} />
            <Route path="candidates/:id" element={<CandidateProfilePage />} />
            <Route path="shortlisted" element={<LeadShortlisted />} />
            <Route path="not-shortlisted" element={<LeadNotShortlisted />} />
            <Route path="transferred-to-me" element={<TransferredToMe />} />
            <Route path="transferred-by-me" element={<TransferredByMe />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
