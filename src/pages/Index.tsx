import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="home-gradient relative min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-20">
        {/* Position button below the description text, aligned with right swirl */}
        <div className="absolute top-[65%] right-[8%] md:top-[58%] md:right-[12%] lg:top-[55%] lg:right-[15%]">
          <Button
            onClick={() => navigate("/login")}
            className="bg-cyan-400 hover:bg-cyan-500 text-white border-2 border-cyan-400 hover:border-cyan-500 transition-all duration-300 px-6 py-3 md:px-10 md:py-6 text-base md:text-lg font-semibold rounded-full shadow-2xl hover:shadow-cyan-500/50 hover:scale-105"
            size="lg"
          >
            View Your Ticket
          </Button>
        </div>
      </div>
    </div>
  );
}