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

  return (
    <div className="min-h-screen animated-gradient">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-white rounded-lg shadow-xl overflow-hidden">
            {/* Ticket Design Background */}
            <img
              src="/ticketdesign.png"
              alt="Ticket Design"
              className="w-full h-auto"
              style={{ maxHeight: '600px', objectFit: 'contain' }}
            />
            
            {/* QR Code Overlay */}
            <div className="absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <div className="bg-white p-4 rounded-lg">
                <QRCode
                  value={user.email}
                  size={180}
                  level="H"
                  includeMargin={false}
                  className="mx-auto"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button
              onClick={handleLogout}
              className="bg-[#542c6a] hover:bg-[#3f1f4f] text-white"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
