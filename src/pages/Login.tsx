import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { loginUser } from '@/lib/api';
import Navbar from "@/components/Navbar";

export default function Login() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const user = await loginUser(email);
      toast.success("Login successful!");
      navigate(`/ticket?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Login failed');
      }
    }
  };

  return (
    <div className="min-h-screen animated-gradient">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-purple-800/15 backdrop-blur-xl rounded-lg shadow-xl p-6 border border-purple-300/50">
          <div className="text-center mb-6">
            <img 
              src="/logo-removebg-preview.png" 
              alt="Noon Talks Logo" 
              className="mx-auto h-16 w-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-white">Login</h2>
            <p className="text-purple-200 mt-2">Enter your email to view your ticket</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full"
              />
            </div>

            <Button 
              type="submit"
              className="w-full bg-[#542c6a] hover:bg-[#3f1f4f]"
            >
              View Ticket
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
