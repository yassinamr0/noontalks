import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";
import Ticket from "@/pages/Ticket";
import AdminLogin from "@/pages/AdminLogin";

function App() {
  const isAdmin = sessionStorage.getItem("isAdmin") === "true";

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin" 
          element={isAdmin ? <Admin /> : <Navigate to="/admin/login" replace />} 
        />
        <Route path="/ticket" element={<Ticket />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;