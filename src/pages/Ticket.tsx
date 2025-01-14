import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import QRCode from "@/components/QRCode";

interface UserData {
  name: string;
  email: string;
  phone?: string;
  code: string;
  ticketCode: string;
}

export default function Ticket() {
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      toast({
        title: "Error",
        description: "Please login first",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setUser(JSON.parse(currentUser));
  }, [navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-6">
          <div className="text-center mb-6">
            <img 
              src="/logo-removebg-preview.png" 
              alt="Noon Talks Logo" 
              className="mx-auto h-16 w-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-[#542c6a] mb-2">Your Ticket</h2>
            <p className="text-sm text-gray-600">{user.name}</p>
          </div>

          <div className="mb-6">
            <QRCode value={user.ticketCode} />
          </div>

          <div className="space-y-2 mb-6">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Email:</span> {user.email}
            </p>
            {user.phone && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Phone:</span> {user.phone}
              </p>
            )}
            <p className="text-sm text-gray-600">
              <span className="font-medium">Code:</span> {user.code}
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center font-medium">
              Make sure to screenshot your ticket!
            </p>
            <Button
              onClick={handleLogout}
              className="w-full bg-[#542c6a] hover:bg-opacity-90 text-white"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
