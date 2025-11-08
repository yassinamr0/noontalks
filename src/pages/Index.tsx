import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="home-gradient relative">
      <Navbar />
      <div className="container mx-auto px-4">
        {/* Position button where the right swirl arrow points - lower right area */}
        <div className="absolute bottom-[25%] right-[10%] md:bottom-[30%] md:right-[15%] lg:bottom-[35%] lg:right-[20%]">
          <Button
            onClick={() => navigate("/login")}
            className="bg-cyan-400 hover:bg-cyan-500 text-white border-2 border-cyan-400 hover:border-cyan-500 transition-all duration-300 px-8 py-5 md:px-12 md:py-7 text-lg md:text-xl font-semibold rounded-full shadow-2xl hover:shadow-cyan-500/50 hover:scale-105"
            size="lg"
          >
            View Your Ticket
          </Button>
        </div>
      </div>
    </div>
  );
}