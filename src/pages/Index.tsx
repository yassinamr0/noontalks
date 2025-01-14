import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <img 
          src="/logo-removebg-preview.png" 
          alt="Noon Talks Logo" 
          className="mx-auto h-32 w-auto mb-6"
        />
        <h1 className="text-4xl font-bold text-[#542c6a] mb-4">
          Welcome to Noon Talks
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Register now to get your ticket!
        </p>
      </div>

      <div className="space-x-4">
        <Button
          onClick={() => navigate("/register")}
          className="bg-[#542c6a] hover:bg-opacity-90"
        >
          Register
        </Button>
        <Button
          onClick={() => navigate("/login")}
          variant="outline"
          className="border-[#542c6a] text-[#542c6a] hover:bg-[#542c6a] hover:text-white"
        >
          Login
        </Button>
      </div>
    </div>
  );
}