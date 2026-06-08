import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import QRCode from "qrcode.react";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import Navbar from "@/components/Navbar";
import { loginUser } from "@/lib/api";

const getResponsiveQRSize = () => {
  const width = window.innerWidth;
  // Drastically scaled down for mobile, normal size for desktop
  if (width < 360) return 25; // Very small phones
  if (width < 430) return 28; // Small phones
  if (width < 480) return 32; // Medium phones
  if (width < 768) return 38; // Large phones/small tablets
  return 97; // Tablets and desktop
};

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  ticketType?: string;
  entries: number;
  createdAt: string;
  lastEntry?: string;
}

const TICKET_LABELS: Record<string, string> = {
  adult: 'Adult',
  kids: '8-12 Year Old',
  noon_students: 'Noon Students',
  // legacy support
  single: 'Single',
  group: 'Group',
};

const getTicketImage = (ticketType?: string) => {
  if (ticketType === 'noon_students') return '/ticketdesign3.png';
  if (ticketType === 'kids') return '/ticketdesign2.png';
  // adult, single (legacy), or default
  return '/ticketdesign.png';
};

export default function Ticket() {
  const [user, setUser] = useState<User | null>(null);
  const [qrSize, setQrSize] = useState(getResponsiveQRSize());
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email");

  useEffect(() => {
    const handleResize = () => {
      setQrSize(getResponsiveQRSize());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!email) {
          toast.error("No email provided");
          window.location.href = "/";
          return;
        }

        const userData = await loginUser(email);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to fetch ticket");
        }
        window.location.href = "/";
      }
    };

    fetchUser();
  }, [email, navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    window.location.href = "/";
  };

  if (!user) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#542c6a] mx-auto"></div>
          <p className="mt-4 text-[#542c6a]">Loading ticket...</p>
        </div>
      </div>
    );
  }

  const ticketImage = getTicketImage(user.ticketType);
  const ticketLabel = TICKET_LABELS[user.ticketType || ''] || user.ticketType || 'Standard';

  return (
    <div className="min-h-screen animated-gradient">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-purple-800/15 backdrop-blur-xl rounded-lg shadow-xl overflow-hidden border border-purple-300/50">
            <div className="p-6">
              <div className="text-center mb-6">
                <img
                  src="/logo-removebg-preview.png"
                  alt="Noon Talks Logo"
                  className="mx-auto h-16 w-auto mb-4"
                />
                <h2 className="text-2xl font-bold text-white">Your Ticket</h2>
              </div>

              <div className="space-y-4">
                {/* Ticket with QR Code */}
                <div className="relative">
                  <img
                    src={ticketImage}
                    alt="Ticket Design"
                    className="w-full h-auto"
                  />
                  <div 
                    className="absolute left-1/2 transform -translate-x-1/2" 
                    style={{ 
                      top: 'calc(50% - -3mm)',
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <QRCode
                      value={user.email}
                      size={qrSize}
                      level="H"
                      includeMargin={false}
                      className="mx-auto"
                      fgColor="#000000"
                      bgColor="transparent"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-center mt-6">
                  <p className="text-lg font-semibold text-white">
                    {user.name || 'Guest'}
                  </p>
                  <p className="text-purple-200">{user.email}</p>
                  {user.phone && (
                    <p className="text-purple-200">{user.phone}</p>
                  )}
                  <p className="text-sm text-purple-300 mt-2">
                    Ticket Type: {ticketLabel}
                  </p>
                  <p className="text-sm text-purple-300">
                    Entries: {user.entries}
                  </p>
                  {user.lastEntry && (
                    <p className="text-sm text-purple-300">
                      Last Entry: {new Date(user.lastEntry).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full"
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
