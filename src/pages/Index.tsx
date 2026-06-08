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
      <div className="home-gradient w-full">
        <div className="w-full px-4 py-8 flex flex-col items-center gap-6">
          
          {/* 1. Main Group Picture - Centered at top with animation */}
          <div className="w-full flex justify-center animate-fade-in-down">
            <img 
              src="/maingrouppic.png" 
              alt="Main Group" 
              className="w-full max-w-3xl h-auto object-contain hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* 2. Text and Underline - Centered with animation */}
          <div className="flex flex-col items-center gap-1 w-full animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <img 
              src="/text.png" 
              alt="Text" 
              className="w-full max-w-2xl h-auto object-contain"
            />
            <img 
              src="/textunderline.png" 
              alt="Text Underline" 
              className="w-full max-w-xl h-auto object-contain"
            />
          </div>

          {/* 3. View Ticket and Buy Ticket Buttons - Smaller sizing */}
          <div className="flex flex-col items-center gap-3 w-full max-w-md z-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Button
              onClick={() => navigate("/login")}
              className="w-full bg-cyan-400 hover:bg-cyan-500 text-white border-2 border-cyan-400 hover:border-cyan-500 transition-all duration-300 font-semibold rounded-full shadow-lg hover:shadow-cyan-500/50 hover:scale-105 px-6 py-3 text-base"
            >
              View Your Ticket
            </Button>
            
            <Button
              onClick={() => setShowPurchaseFlow(true)}
              className="w-full animated-border-button bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-2 border-cyan-400 transition-all duration-300 font-semibold rounded-full hover:scale-105 px-6 py-3 text-base"
            >
              Buy Ticket
            </Button>
          </div>

          {/* 4. Three Pictures Row - Horizontal on all devices */}
          <div className="w-full max-w-6xl animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex gap-4 w-full justify-center items-center flex-nowrap">
              {/* Group Pic Left */}
              <div className="flex-1 flex justify-center min-w-0">
                <img 
                  src="/grouppicleft.png" 
                  alt="Group Pic Left" 
                  className="w-full h-auto object-contain hover:scale-110 transition-transform duration-300 cursor-pointer"
                />
              </div>

              {/* Girls Pic Middle */}
              <div className="flex-1 flex justify-center min-w-0">
                <img 
                  src="/girlspicmiddle.png" 
                  alt="Girls Pic Middle" 
                  className="w-full h-auto object-contain hover:scale-110 transition-transform duration-300 cursor-pointer"
                />
              </div>

              {/* Boys Pic Right */}
              <div className="flex-1 flex justify-center min-w-0">
                <img 
                  src="/boyspicright.png" 
                  alt="Boys Pic Right" 
                  className="w-full h-auto object-contain hover:scale-110 transition-transform duration-300 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 5. Event Countdown - At Bottom */}
          <div className="w-full animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Countdown />
          </div>

          {/* Bottom spacing */}
          <div className="h-2"></div>
        </div>
      </div>

      <Dialog open={showPurchaseFlow} onOpenChange={setShowPurchaseFlow}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-transparent border-0 shadow-none p-0">
          <div className="sr-only">
            <h2>Buy Ticket</h2>
            <p>Purchase your ticket for Noon Talks</p>
          </div>
          <TicketPurchaseFlow onComplete={() => setShowPurchaseFlow(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
