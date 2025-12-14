import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import QRCode from "qrcode.react";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import Navbar from "@/components/Navbar";
import { loginUser } from "@/lib/api";

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

export default function Ticket() {
  const [user, setUser] = useState<User | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!email) {
          toast.error("No email provided");
          window.location.replace("https://www.noon-talks.online");
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
        window.location.replace("https://www.noon-talks.online");
      }
    };

    fetchUser();
  }, [email, navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    window.location.replace("https://www.noon-talks.online");
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

  // Determine which ticket design to use based on ticket type
 const ticketImage = user.ticketType === 'group' ? 'src/public/ticketdesign2.png' : 'src/public/ticketdesign.png';

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
                      size={237}
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
                    Ticket Type: {user.ticketType === 'group' ? 'Group' : 'Single'}
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
