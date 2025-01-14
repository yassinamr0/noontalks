import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QRCode } from "@/components/QRCode";
import TicketDisplay from "@/components/TicketDisplay";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import emailjs from '@emailjs/browser';

interface RegistrationData {
  name: string;
  email: string;
  phone: string;
  code: string;
}

export default function Register() {
  const [isRegistering, setIsRegistering] = useState(true);
  const [formData, setFormData] = useState<RegistrationData>({
    name: "",
    email: "",
    phone: "",
    code: "",
  });
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState("");
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendTicketEmail = async (ticketData: RegistrationData) => {
    try {
      const templateParams = {
        to_name: ticketData.name,
        to_email: ticketData.email,
        code: ticketData.code
      };

      const response = await emailjs.send(
        'service_83pqvw9',
        'template_ratkdvb',
        templateParams,
        'xLhzDzuiphtF8mgEj'
      );

      console.log('Email sent successfully:', response);
      toast({
        title: "Registration Complete!",
        description: "Check your email for login details.",
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Email Sending Failed",
        description: "Please save your registration code: " + ticketData.code,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.code) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get existing users and registration codes
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const validCodes = JSON.parse(localStorage.getItem("validCodes") || "[]");
      
      // Check if email already exists
      if (users.some((user: RegistrationData) => user.email === formData.email)) {
        toast({
          title: "Error",
          description: "This email is already registered",
          variant: "destructive",
        });
        return;
      }

      // Check if code exists and is valid
      if (!validCodes.includes(formData.code.toUpperCase())) {
        toast({
          title: "Error",
          description: "Invalid registration code",
          variant: "destructive",
        });
        return;
      }

      // Check if code is already used
      if (users.some((user: any) => user.code === formData.code.toUpperCase())) {
        toast({
          title: "Error",
          description: "This registration code has already been used",
          variant: "destructive",
        });
        return;
      }

      // Generate unique ticket code
      const ticketCode = Math.random().toString(36).substring(2, 15);

      // Create new user with uppercase code
      const newUser = {
        ...formData,
        code: formData.code.toUpperCase(),
        ticketCode,
        entries: 0,
        registeredAt: new Date().toISOString()
      };

      // Save user
      localStorage.setItem("users", JSON.stringify([...users, newUser]));

      // Remove used code
      const updatedCodes = validCodes.filter((c: string) => c !== formData.code.toUpperCase());
      localStorage.setItem("validCodes", JSON.stringify(updatedCodes));

      setQrCode(ticketCode);
      
      // Send email
      await sendTicketEmail(newUser);
      
      toast({
        title: "Success",
        description: "Registration successful!",
      });
    } catch (error) {
      console.error("Error during registration:", error);
      toast({
        title: "Error",
        description: "Registration failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (qrCode) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <TicketDisplay
            ticketId={qrCode}
            userDetails={{
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              code: formData.code,
            }}
          />
        </div>
      </div>
    );
  }

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