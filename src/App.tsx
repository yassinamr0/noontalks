import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from '@/pages/Register';
import Login from '@/pages/Login';
import Admin from '@/pages/Admin';
import AdminLogin from '@/pages/AdminLogin';
import Ticket from '@/pages/Ticket';
import { Toaster } from 'sonner';
import { TooltipProvider } from "@/components/ui/tooltip";

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
  return isAdmin ? <>{children}</> : <Navigate to="/admin/login" />;
}

function App() {
  return (
    <TooltipProvider>
      <Router>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={<Register />} />
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
    </TooltipProvider>
  );
}

export default App;