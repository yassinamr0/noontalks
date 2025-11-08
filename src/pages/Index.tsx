import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Countdown from "@/components/Countdown";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="home-gradient" style={{ minHeight: '200vh' }}>
      <Navbar />
      <div className="container mx-auto px-4">
        {/* Center button with responsive positioning */}
        <div className="flex justify-center items-center button-container">
          <Button
            onClick={() => navigate("/login")}
            className="bg-cyan-400 hover:bg-cyan-500 text-white border-2 border-cyan-400 hover:border-cyan-500 transition-all duration-300 ticket-button font-semibold rounded-full shadow-2xl hover:shadow-cyan-500/50 hover:scale-105"
            size="lg"
          >
            View Your Ticket
          </Button>
        </div>
        
        {/* Countdown section */}
        <Countdown />
      </div>
    </div>
  );
}