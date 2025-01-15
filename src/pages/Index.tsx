import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen home-gradient">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl text-white mb-6">
            Welcome to <span className="font-bold font-dancing">Noon Talks</span>
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Your gateway to exclusive events and meaningful conversations
          </p>
          <div className="space-x-4">
            <Button
              onClick={() => navigate("/login")}
              className="bg-white/10 backdrop-blur-md text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300 px-10 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105"
              size="lg"
            >
              View Your Ticket
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}