import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import QRCode from "@/components/QRCode";
import emailjs from '@emailjs/browser';
import html2canvas from 'html2canvas';

interface RegistrationData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  qrCode: string;
  timestamp: number;
}

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [showQR, setShowQR] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const sendTicketEmail = async (ticketData: RegistrationData) => {
    try {
      if (!qrCodeRef.current) {
        throw new Error('Ticket element not found');
      }

      // Wait for images to load
      const img = qrCodeRef.current.querySelector('img');
      if (img) {
        await new Promise((resolve) => {
          if (img.complete) {
            resolve(true);
          } else {
            img.onload = () => resolve(true);
          }
        });
      }

      // Capture the ticket as an image
      const canvas = await html2canvas(qrCodeRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: true,
        scale: 2 // Higher quality
      });
      
      const ticketImage = canvas.toDataURL('image/png', 1.0);

      const templateParams = {
        to_name: ticketData.fullName,
        to_email: ticketData.email,
        ticket_id: ticketData.id,
        ticket_image: ticketImage,
      };

      await emailjs.send(
        'service_83pqvw9',
        'template_ratkdvb',
        templateParams,
        'xLhzDzuiphtF8mgEj'
      );

      toast({
        title: "Success!",
        description: "Ticket has been sent to your email.",
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send ticket email. Please try again.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTicketId = `NOON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const registrationData: RegistrationData = {
      id: newTicketId,
      ...formData,
      qrCode: newTicketId,
      timestamp: Date.now(),
    };

    const existingRegistrations = JSON.parse(localStorage.getItem("registrations") || "[]");
    localStorage.setItem(
      "registrations",
      JSON.stringify([...existingRegistrations, registrationData])
    );

    setTicketId(newTicketId);
    setShowQR(true);
    
    // Wait longer for images to load
    setTimeout(() => {
      sendTicketEmail(registrationData);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Register</h1>
          {!showQR ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                  Phone Number (optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 rounded-md font-semibold hover:bg-opacity-90 transition-colors"
              >
                Register
              </button>
            </form>
          ) : (
            <div className="text-center">
              {showQR && (
                <div className="mt-8">
                  <QRCode ref={qrCodeRef} value={ticketId} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;