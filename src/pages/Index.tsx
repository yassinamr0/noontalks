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
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Welcome to Noon Talks
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Your gateway to exclusive events and meaningful conversations
          </p>
          <div className="space-x-4">
            <Button
              onClick={() => navigate("/login")}
              className="bg-white text-[#542c6a] hover:bg-white/90"
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