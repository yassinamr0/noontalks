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

  return (
    <>
      <Navbar />
      <div className="home-gradient" style={{ minHeight: '100vh' }}>
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
