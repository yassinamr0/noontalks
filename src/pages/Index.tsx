import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Countdown from "@/components/Countdown";
import { useState } from 'react';
import TicketPurchaseFlow from "@/components/TicketPurchaseFlow";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function Index() {
  const navigate = useNavigate();
  const [showPurchaseFlow, setShowPurchaseFlow] = useState(false);

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
            >
              View Your Ticket
            </Button>
            
            <Button
              onClick={() => setShowPurchaseFlow(true)}
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-2 border-cyan-400 transition-all duration-300 font-semibold rounded-full shadow-2xl hover:shadow-cyan-500/30 hover:scale-105 px-8 py-6 text-lg"
            >
              Buy Ticket
            </Button>
          </div>
          
          {/* Countdown section */}
          <Countdown />
        </div>
      </div>

      <Dialog open={showPurchaseFlow} onOpenChange={setShowPurchaseFlow}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-transparent border-0 shadow-none p-0">
          <TicketPurchaseFlow onComplete={() => setShowPurchaseFlow(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}