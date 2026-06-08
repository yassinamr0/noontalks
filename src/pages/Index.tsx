import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Countdown from "@/components/Countdown";
import { useState } from 'react';
import TicketPurchaseFlow from "@/components/TicketPurchaseFlow";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MessageCircle, Instagram } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const [showPurchaseFlow, setShowPurchaseFlow] = useState(false);

  // Background design dimensions from Photoshop
  const DESIGN_WIDTH = 1920;
  const DESIGN_HEIGHT = 3361;

  // Function to calculate percentage-based positioning
  const getPos = (x: number, y: number) => ({
    left: `${(x / DESIGN_WIDTH) * 100}%`,
    top: `${(y / DESIGN_HEIGHT) * 100}%`,
    position: 'absolute' as const,
  });

  return (
    <>
      <Navbar />
      <div className="home-gradient min-h-screen w-full">
        {/* The Design Canvas maintains the aspect ratio of your Photoshop design */}
        <div className="design-canvas">
          {/* maingrouppic.png = x: 399px (middle would be better) Y:393px */}
          <img 
            src="/maingrouppic.png" 
            alt="Main Group" 
            className="design-element"
            style={{ 
              ...getPos(399, 393), 
              width: '60%', // Adjust size as needed, or use specific px if known
              left: '50%',
              transform: 'translateX(-50%)'
            }} 
          />

          {/* text.png = X : 216.8px Y:1181.44 */}
          <img 
            src="/text.png" 
            alt="Text" 
            className="design-element"
            style={getPos(216.8, 1181.44)} 
          />

          {/* textunderline.png = X: 749px Y:1433px */}
          <img 
            src="/textunderline.png" 
            alt="Text Underline" 
            className="design-element"
            style={getPos(749, 1433)} 
          />

          {/* boyspicright.png = X :1191 px Y:1809 */}
          <img 
            src="/boyspicright.png" 
            alt="Boys Pic Right" 
            className="design-element"
            style={getPos(1191, 1809)} 
          />

          {/* girlspicmiddle.png = X:695 px Y: 1853 */}
          <img 
            src="/girlspicmiddle.png" 
            alt="Girls Pic Middle" 
            className="design-element"
            style={getPos(695, 1853)} 
          />

          {/* grouppicleft.png = X: 9px Y:1907 */}
          <img 
            src="/grouppicleft.png" 
            alt="Group Pic Left" 
            className="design-element"
            style={getPos(9, 1907)} 
          />

          {/* Original Content Overlays */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="container mx-auto px-4 h-full relative pointer-events-auto">
              {/* Center buttons */}
              <div className="flex flex-col items-center space-y-4 button-container">
                <Button
                  onClick={() => navigate("/login")}
                  className="bg-cyan-400 hover:bg-cyan-500 text-white border-2 border-cyan-400 hover:border-cyan-500 transition-all duration-300 ticket-button font-semibold rounded-full shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 px-8 py-6 text-lg"
                >
                  View Your Ticket
                </Button>
                
                <Button
                  onClick={() => setShowPurchaseFlow(true)}
                  className="animated-border-button bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-2 border-cyan-400 transition-all duration-300 font-semibold rounded-full hover:scale-105 px-8 py-6 text-lg"
                >
                  Buy Ticket
                </Button>
              </div>
              
              {/* Countdown section */}
              <Countdown />

              {/* Contact Us Section */}
              <div className="mt-8 py-12 px-6">
                <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-12 tracking-tight">
                  Get In <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Touch</span>
                </h2>
                <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                  <a
                    href="https://wa.me/+201028449443"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-full transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-green-500/60 shadow-xl text-lg"
                  >
                    <MessageCircle size={28} />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href="https://www.instagram.com/noon.talks/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:via-red-600 hover:to-yellow-600 text-white font-bold rounded-full transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-pink-500/60 shadow-xl text-lg"
                  >
                    <Instagram size={28} />
                    <span>Instagram</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
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
