import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Countdown from "@/components/Countdown";

export default function Index() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="home-gradient" style={{ minHeight: '200vh' }}>
        <div className="container mx-auto px-4">
          {/* Center buttons with responsive positioning */}
          <div className="flex flex-col items-center space-y-4 button-container py-8">
            <Button
              onClick={() => navigate("/login")}
              className="bg-cyan-400 hover:bg-cyan-500 text-white border-2 border-cyan-400 hover:border-cyan-500 transition-all duration-300 ticket-button font-semibold rounded-full shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 px-8 py-6 text-lg"
              size="lg"
            >
              View Your Ticket
            </Button>
            
            <Button
              onClick={() => window.open('https://noon-talks.myshopify.com/products/noon-talks-ticket?variant=51632924590359', '_blank')}
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-2 border-cyan-400 transition-all duration-300 font-semibold rounded-full shadow-2xl hover:shadow-cyan-500/30 hover:scale-105 px-8 py-6 text-lg"
              size="lg"
              variant="outline"
            >
              Buy Ticket
            </Button>
          </div>
          
          {/* Countdown section */}
          <Countdown />
        </div>
      </div>
    </>
  );
}