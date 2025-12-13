import { Box, CircularProgress } from "@mui/material";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { useAuth } from "./context/AuthContext";
import AuditTrail from "./pages/AuditTrail";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import MeetingForm from "./pages/MeetingForm";
import PasswordResetConfirm from "./pages/PasswordResetConfirm";
import PasswordResetRequest from "./pages/PasswordResetRequest";
import Reglement from "./pages/Reglement";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }
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
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path='/' element={<Dashboard />} />
        <Route path='/meetings/new' element={<MeetingForm />} />
        <Route path='/audit' element={<AuditTrail />} />
        <Route path='/reglement' element={<Reglement />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
