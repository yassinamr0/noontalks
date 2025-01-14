import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Register from "@/pages/Register";
import Admin from "@/pages/Admin";
import Login from "@/pages/Login";
import Ticket from "@/pages/Ticket";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/ticket" element={<Ticket />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;