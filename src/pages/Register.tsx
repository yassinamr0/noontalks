import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { registerUser } from "@/lib/api";

interface FormData {
  name: string;
  email: string;
  phone: string;
  code: string;
}

export default function Register() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    code: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login");
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const user = await registerUser(formData);
      
      // Store user in session
      sessionStorage.setItem("currentUser", JSON.stringify(user));
      
      toast({
        title: "Success",
        description: "Registration successful!",
      });

      // Navigate to ticket page
      navigate("/ticket");
    } catch (error: any) {
      console.error("Error during registration:", error);
      toast({
        title: "Error",
        description: error.message || "Registration failed. Please try again.",
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
            <h2 className="text-2xl font-bold text-[#542c6a]">Register</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1"
                required
                autoComplete="name"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium">Phone Number (Optional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1"
                autoComplete="tel"
              />
            </div>

            <div>
              <Label htmlFor="code" className="text-sm font-medium">Registration Code</Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="mt-1"
                required
                autoComplete="off"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#542c6a] hover:bg-opacity-90 text-white mt-6"
            >
              Register
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Already registered?{" "}
                <a href="/login" className="text-[#542c6a] hover:underline">
                  Log in!
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}