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
        u.code.toLowerCase() === formData.code.toLowerCase()
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

      // Navigate to ticket display
      navigate("/ticket");
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
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <img src="/logo-removebg-preview.png" alt="Noon Talks Logo" className="mx-auto h-24 w-auto mb-4" />
            <h2 className="text-3xl font-bold text-[#542c6a]">Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="code">Registration Code</Label>
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
              className="w-full bg-[#542c6a] hover:bg-opacity-90 text-white"
            >
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
