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
        <div className="w-full px-4 py-8 flex flex-col gap-12">
          {/* Decorative Images Section - Responsive Grid */}
          <div className="w-full max-w-6xl mx-auto">
            {/* Main Group Picture - Centered at top */}
            <div className="flex justify-center mb-8">
              <img 
                src="/maingrouppic.png" 
                alt="Main Group" 
                className="w-full max-w-md h-auto object-contain"
              />
            </div>

            {/* Text and Underline - Centered */}
            <div className="flex flex-col items-center gap-2 mb-12">
              <img 
                src="/text.png" 
                alt="Text" 
                className="w-full max-w-xs h-auto object-contain"
              />
              <img 
                src="/textunderline.png" 
                alt="Text Underline" 
                className="w-full max-w-xs h-auto object-contain"
              />
            </div>

            {/* Three Pictures Row - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
              {/* Group Pic Left */}
              <div className="flex justify-center">
                <img 
                  src="/grouppicleft.png" 
                  alt="Group Pic Left" 
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Girls Pic Middle */}
              <div className="flex justify-center">
                <img 
                  src="/girlspicmiddle.png" 
                  alt="Girls Pic Middle" 
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Boys Pic Right */}
              <div className="flex justify-center">
                <img 
                  src="/boyspicright.png" 
                  alt="Boys Pic Right" 
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>

          {/* Buttons Section - Centered */}
          <div className="w-full flex flex-col items-center gap-4 z-10 relative">
            <Button
              onClick={() => navigate("/login")}
              className="bg-cyan-400 hover:bg-cyan-500 text-white border-2 border-cyan-400 hover:border-cyan-500 transition-all duration-300 font-semibold rounded-full shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 px-8 py-6 text-lg w-full max-w-xs"
            >
              View Your Ticket
            </Button>
            
            <Button
              onClick={() => setShowPurchaseFlow(true)}
              className="animated-border-button bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-2 border-cyan-400 transition-all duration-300 font-semibold rounded-full hover:scale-105 px-8 py-6 text-lg w-full max-w-xs"
            >
              Buy Ticket
            </Button>
          </div>

          {/* Countdown Section - At Bottom */}
          <div className="w-full">
            <Countdown />
          </div>

          {/* Bottom Spacing */}
          <div className="h-8"></div>
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
