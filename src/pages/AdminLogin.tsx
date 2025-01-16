import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { adminLogin } from '@/lib/api';

export default function AdminLogin() {
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt with password:', password);
    
    try {
      console.log('Calling adminLogin...');
      const data = await adminLogin(password);
      console.log('Login response:', data);
      
      sessionStorage.setItem("adminToken", data.token);
      sessionStorage.setItem("isAdmin", "true");
      
      console.log('Session storage set, showing toast...');
      toast.success("Login successful!", {
        duration: 2000,
        position: "top-center",
      });
      
      // Force a small delay to ensure storage is set and toast is shown
      setTimeout(() => {
        console.log('Navigating to /admin');
        window.location.href = "/admin";
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        toast.error(error.message, {
          duration: 3000,
          position: "top-center",
        });
      } else {
        toast.error('Login failed', {
          duration: 3000,
          position: "top-center",
        });
      }
    }
  };

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#542c6a]">Admin Login</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full"
            />
          </div>
          
          <Button 
            type="submit"
            className="w-full bg-[#542c6a] hover:bg-[#3f1f4f]"
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}
