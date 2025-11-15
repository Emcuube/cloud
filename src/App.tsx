import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import ReviewSimulator from './components/ReviewSimulator';
import CallbackPage from './components/auth/CallbackPage';
import RequireAuth from './components/auth/RequireAuth';
import Sidebar from './components/ui/sidebar';

// New dashboard page
import DashboardPage from './pages/DashboardPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Cognito callback (no sidebar) */}
        <Route path="/callback" element={<CallbackPage />} />

        {/* Authenticated layout with sidebar */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <div className="min-h-screen bg-gray-100 flex">
                <Sidebar />
                <main className="flex-1 p-6">
                  <DashboardPage />
                </main>
              </div>
            </RequireAuth>
          }
        />

        <Route
          path="/"
          element={
            <RequireAuth>
              <div className="min-h-screen bg-gray-100 flex">
                <Sidebar />
                <main className="flex-1 p-6">
                  <ReviewSimulator />
                </main>
              </div>
            </RequireAuth>
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
