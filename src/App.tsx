import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import CallbackPage from './components/auth/CallbackPage';
import RequireAuth from './components/auth/RequireAuth';
import Sidebar from './components/ui/sidebar';
import ReviewSimulator from './components/ReviewSimulator';
import DashboardPage from './pages/DashboardPage';
import ReviewsPage from './pages/ReviewsPage';

const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RequireAuth>
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <main className="min-h-screen p-6 lg:ml-64">{children}</main>
    </div>
  </RequireAuth>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Cognito callback (no sidebar) */}
        <Route path="/callback" element={<CallbackPage />} />

        <Route
          path="/dashboard"
          element={
            <AuthenticatedLayout>
              <DashboardPage />
            </AuthenticatedLayout>
          }
        />

        <Route
          path="/"
          element={
            <AuthenticatedLayout>
              <ReviewSimulator />
            </AuthenticatedLayout>
          }
        />

        <Route
          path="/reviews"
          element={
            <AuthenticatedLayout>
              <ReviewsPage />
            </AuthenticatedLayout>
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
