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

  // Photoshop design dimensions
  const DESIGN_WIDTH = 1920;
  const DESIGN_HEIGHT = 3361;

  // Convert Photoshop pixel coordinates to percentage-based positioning
  const getPercentPos = (x: number, y: number, width?: number, height?: number) => {
    return {
      left: `${(x / DESIGN_WIDTH) * 100}%`,
      top: `${(y / DESIGN_HEIGHT) * 100}%`,
      ...(width && { width: `${(width / DESIGN_WIDTH) * 100}%` }),
      ...(height && { height: `${(height / DESIGN_HEIGHT) * 100}%` }),
    };
  };

  return (
    <>
      <Navbar />
      <div className="home-gradient w-full">
        {/* Design Canvas - Maintains perfect aspect ratio */}
        <div className="design-canvas">
          {/* maingrouppic.png = x: 399px Y:393px - Centered */}
          <img 
            src="/maingrouppic.png" 
            alt="Main Group" 
            className="design-element"
            style={{
              ...getPercentPos(399, 393),
              left: '50%',
              transform: 'translateX(-50%)',
              width: '40%',
              height: 'auto',
              objectFit: 'contain',
            }} 
          />

          {/* text.png = X : 216.8px Y:1181.44 - Centered */}
          <img 
            src="/text.png" 
            alt="Text" 
            className="design-element"
            style={{
              ...getPercentPos(216.8, 1181.44),
              left: '50%',
              transform: 'translateX(-50%)',
              width: '50%',
              height: 'auto',
              objectFit: 'contain',
            }} 
          />

          {/* textunderline.png = X: 749px Y:1433px - Centered, same Y level as text */}
          <img 
            src="/textunderline.png" 
            alt="Text Underline" 
            className="design-element"
            style={{
              ...getPercentPos(749, 1433),
              left: '50%',
              transform: 'translateX(-50%)',
              width: '30%',
              height: 'auto',
              objectFit: 'contain',
            }} 
          />

          {/* boyspicright.png = X :1191 px Y:1809 */}
          <img 
            src="/boyspicright.png" 
            alt="Boys Pic Right" 
            className="design-element"
            style={{
              ...getPercentPos(1191, 1809),
              width: '25%',
              height: 'auto',
              objectFit: 'contain',
            }} 
          />

          {/* girlspicmiddle.png = X:695 px Y: 1853 */}
          <img 
            src="/girlspicmiddle.png" 
            alt="Girls Pic Middle" 
            className="design-element"
            style={{
              ...getPercentPos(695, 1853),
              width: '25%',
              height: 'auto',
              objectFit: 'contain',
            }} 
          />

          {/* grouppicleft.png = X: 9px Y:1907 */}
          <img 
            src="/grouppicleft.png" 
            alt="Group Pic Left" 
            className="design-element"
            style={{
              ...getPercentPos(9, 1907),
              width: '25%',
              height: 'auto',
              objectFit: 'contain',
            }} 
          />

          {/* Buttons Container - Below images */}
          <div 
            className="design-element flex flex-col items-center gap-3 z-10"
            style={{
              ...getPercentPos(960, 2300),
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80%',
              pointerEvents: 'auto',
            }}
          >
            <Button
              onClick={() => navigate("/login")}
              className="w-full bg-cyan-400 hover:bg-cyan-500 text-white border-2 border-cyan-400 hover:border-cyan-500 transition-all duration-300 font-semibold rounded-full shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 px-6 py-4 text-base"
            >
              View Your Ticket
            </Button>
            
            <Button
              onClick={() => setShowPurchaseFlow(true)}
              className="w-full animated-border-button bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-2 border-cyan-400 transition-all duration-300 font-semibold rounded-full hover:scale-105 px-6 py-4 text-base"
            >
              Buy Ticket
            </Button>
          </div>

          {/* Countdown Container - At bottom */}
          <div 
            className="design-element w-full"
            style={{
              ...getPercentPos(0, 2700),
              width: '100%',
              pointerEvents: 'auto',
            }}
          >
            <Countdown />
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
