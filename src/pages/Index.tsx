import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#542c6a] to-[#c701a9]">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <img 
            src="/logo-removebg-preview.png" 
            alt="Noon Talks Logo" 
            className="mx-auto h-40 w-auto mb-8"
          />
          <div className="space-y-2">
            <h1 className="text-4xl text-white">
              Welcome to <span className="font-bold font-['Montserrat']">Noon Talks</span>
            </h1>
            <p className="text-lg text-gray-200">
              Register now to get your ticket!
            </p>
          </div>
        </div>

        <div className="space-x-6">
          <Button
            onClick={() => navigate("/register")}
            className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 px-8 py-6 text-lg rounded-xl shadow-lg"
          >
            Register
          </Button>
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            className="bg-transparent border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 px-8 py-6 text-lg rounded-xl shadow-lg"
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
}