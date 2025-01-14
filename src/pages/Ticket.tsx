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
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="text-center mb-6">
                <img
                  src="/logo-removebg-preview.png"
                  alt="Noon Talks Logo"
                  className="mx-auto h-16 w-auto mb-4"
                />
                <h2 className="text-2xl font-bold text-[#542c6a]">Your Ticket</h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-3 bg-white rounded-lg shadow-md">
                    <QRCode
                      value={user.email}
                      size={200}
                      level="H"
                      includeMargin={true}
                      className="mx-auto"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-center mt-6">
                  <p className="text-lg font-semibold text-[#542c6a]">
                    {user.name || 'Guest'}
                  </p>
                  <p className="text-gray-600">{user.email}</p>
                  {user.phone && (
                    <p className="text-gray-600">{user.phone}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Entries: {user.entries}
                  </p>
                  {user.lastEntry && (
                    <p className="text-sm text-gray-500">
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
                    Logout
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
