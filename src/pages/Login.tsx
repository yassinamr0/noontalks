import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

interface LoginData {
  code: string;
}

export default function Login() {
  const [formData, setFormData] = useState<LoginData>({
    code: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code) {
      toast({
        title: "Error",
        description: "Please enter your registration code",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get existing users
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      
      // Find user with matching code (case insensitive)
      const user = users.find((u: any) => 
        u.code.toUpperCase() === formData.code.toUpperCase()
      );

      if (!user) {
        toast({
          title: "Error",
          description: "Invalid registration code",
          variant: "destructive",
        });
        return;
      }

      // Store user info in localStorage for session
      localStorage.setItem("currentUser", JSON.stringify(user));
      
      toast({
        title: "Success",
        description: "Login successful!",
      });

      // Wait for toast to show before navigating
      setTimeout(() => {
        navigate("/ticket");
      }, 1000);
    } catch (error) {
      console.error("Error during login:", error);
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-6">
          <div className="text-center mb-6">
            <img 
              src="/logo-removebg-preview.png" 
              alt="Noon Talks Logo" 
              className="mx-auto h-16 w-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-[#542c6a]">Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="code" className="text-sm font-medium">Registration Code</Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="mt-1"
                required
                autoComplete="off"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#542c6a] hover:bg-opacity-90 text-white mt-6"
            >
              Login
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Don't have a code?{" "}
                <a href="/register" className="text-[#542c6a] hover:underline">
                  Register here
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
