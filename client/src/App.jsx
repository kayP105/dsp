import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';
import PlannerDashboard from './features/planner/PlannerDashboard';
import TaskInputPage from './features/tasks/TaskInputPage';
import MainLayout from './components/layout/MainLayout';
import LandingPage from './features/landing/LandingPage';
// client/src/App.jsx
import SettingsPage from './features/user/SettingsPage';

// A simple component to protect routes
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected Routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="settings" element={<SettingsPage />} />
        <Route path="dashboard" element={<PlannerDashboard />} />
        <Route path="add-task" element={<TaskInputPage />} />
        {/* Add Progress, Settings pages here later */}
        <Route index element={<Navigate to="dashboard" />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;