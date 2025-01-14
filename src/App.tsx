import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Index from '@/pages/Index';
import Register from '@/pages/Register';
import Login from '@/pages/Login';
import Admin from '@/pages/Admin';
import AdminLogin from '@/pages/AdminLogin';
import Ticket from '@/pages/Ticket';
import { Toaster } from 'sonner';

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
  const adminToken = sessionStorage.getItem('adminToken');

  if (!isAdmin || !adminToken) {
    return <Navigate to="/admin/login" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedAdminRoute>
              <Admin />
            </ProtectedAdminRoute>
          } 
        />
        <Route path="/ticket" element={<Ticket />} />
      </Routes>
    </Router>
  );
}

export default App;