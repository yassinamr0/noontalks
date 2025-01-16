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
          navigate("/login");
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
        navigate("/login");
      }
    };

    fetchUser();
  }, [email, navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    navigate("/login");
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
          <div className="relative">
            {/* Ticket Design Background */}
            <img
              src="/ticketdesign.png"
              alt="Ticket Design"
              className="w-full h-auto"
            />
            
            {/* QR Code Overlay - positioned absolutely */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <QRCode
                value={user.email}
                size={200}
                level="H"
                includeMargin={false}
                className="mx-auto"
              />
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button
              onClick={handleLogout}
              className="bg-[#542c6a] hover:bg-[#3f1f4f] text-white"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
