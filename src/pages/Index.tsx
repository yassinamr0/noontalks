import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#542c6a] to-[#c701a9]">
      <Navbar />
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <div className="space-y-3">
            <h1 className="text-5xl text-white">
              Welcome to <span className="font-bold font-dancing">Noon Talks</span>
            </h1>
            <p className="text-xl text-gray-200">
              Register now to get your ticket!
            </p>
          </div>
        </div>

        <div className="space-x-6">
          <Button
            onClick={() => navigate("/register")}
            className="bg-white/5 backdrop-blur-md text-white border-2 border-white/30 hover:bg-white/15 hover:border-white/50 transition-all duration-300 px-10 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Register
          </Button>
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            className="bg-transparent border-2 border-white/30 text-white hover:bg-white/5 hover:border-white/50 transition-all duration-300 px-10 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
}