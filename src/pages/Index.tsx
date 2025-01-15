import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#3a1f49] to-[#542c6a]">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <img 
            src="/logo-removebg-preview.png" 
            alt="Noon Talks Logo" 
            className="mx-auto h-32 w-auto mb-6"
          />
          <h1 className="text-4xl font-bold text-white mb-4 font-['Poppins']">
            Welcome to Noon Talks
          </h1>
          <p className="text-lg text-gray-200 mb-8">
            Register now to get your ticket!
          </p>
        </div>

        <div className="space-x-4">
          <Button
            onClick={() => navigate("/register")}
            className="bg-white text-[#542c6a] hover:bg-gray-100"
          >
            Register
          </Button>
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-[#542c6a]"
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
}