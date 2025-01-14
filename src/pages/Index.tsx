import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#542c6a] to-[#c701a9]">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <img src="/logo-removebg-preview.png" alt="Noon Talks Logo" className="mx-auto h-32 w-auto mb-8" />
          <h1 className="mb-6">
            <span className="text-4xl md:text-6xl font-bold text-white block mb-2">Welcome to</span>
            <span className="text-5xl md:text-7xl font-bold text-white font-serif italic">Noon Talks</span>
          </h1>
          <p className="text-lg md:text-xl text-white mb-12">
            Join us for an amazing event! Register now to secure your spot.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-[#542c6a] px-8 py-3 rounded-lg font-semibold text-lg hover:bg-opacity-90 transition-colors"
          >
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}