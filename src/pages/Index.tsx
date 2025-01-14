import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#542c6a] to-[#c701a9]">
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h1 className="text-5xl font-bold mb-6 font-serif">
            Welcome to Noon Talks
          </h1>
          <p className="text-xl mb-8">
            Join us for an inspiring session of public speaking and networking
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-[#542c6a] px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
          >
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}