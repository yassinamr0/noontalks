import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "@/pages/Index";
import Register from "@/pages/Register";
import Admin from "@/pages/Admin";
import Login from "@/pages/Login";
import Ticket from "@/pages/Ticket";

function App() {
  return (
    <TooltipProvider>
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
    </TooltipProvider>
  );
}

export default App;