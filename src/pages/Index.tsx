import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="home-gradient min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        {/* Center button horizontally and position it lower on the page */}
        <div className="flex justify-center items-center" style={{ marginTop: '150vh' }}>
          <Button
            onClick={() => navigate("/login")}
            className="bg-cyan-400 hover:bg-cyan-500 text-white border-2 border-cyan-400 hover:border-cyan-500 transition-all duration-300 px-10 py-6 text-lg font-semibold rounded-full shadow-2xl hover:shadow-cyan-500/50 hover:scale-105"
            size="lg"
          >
            View Your Ticket
          </Button>
        </div>
      </div>
    </div>
  );
}