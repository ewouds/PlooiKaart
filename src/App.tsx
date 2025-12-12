import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuditTrail from "./pages/AuditTrail";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import MeetingForm from "./pages/MeetingForm";
import PasswordResetConfirm from "./pages/PasswordResetConfirm";
import PasswordResetRequest from "./pages/PasswordResetRequest";
import Reglement from "./pages/Reglement";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to='/login' />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/forgot-password' element={<PasswordResetRequest />} />
      <Route path='/reset-password' element={<PasswordResetConfirm />} />

      <Route
        path='/'
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path='/meetings/new'
        element={
          <ProtectedRoute>
            <MeetingForm />
          </ProtectedRoute>
        }
      />
      <Route
        path='/audit'
        element={
          <ProtectedRoute>
            <AuditTrail />
          </ProtectedRoute>
        }
      />
      <Route
        path='/reglement'
        element={
          <ProtectedRoute>
            <Reglement />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
