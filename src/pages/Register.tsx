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
  phone?: string;
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
    
    if (!formData.code || !formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const storedUsers = localStorage.getItem("users") || "[]";
      const users = JSON.parse(storedUsers);

      // Check if code is valid
      const registrationCodes = JSON.parse(localStorage.getItem("registrationCodes") || "[]");
      if (!registrationCodes.includes(formData.code)) {
        toast({
          title: "Error",
          description: "Invalid registration code",
          variant: "destructive",
        });
        return;
      }

      // Check if code is already used
      if (users.some((user: any) => user.code === formData.code)) {
        toast({
          title: "Error",
          description: "This registration code has already been used",
          variant: "destructive",
        });
        return;
      }

      // Generate unique ticket code
      const ticketCode = Math.random().toString(36).substring(2, 15);

      const newUser = {
        name: formData.name,
        email: formData.email,
        code: formData.code,
        ticketCode,
        entries: 0,
        registeredAt: new Date().toISOString()
      };

      localStorage.setItem("users", JSON.stringify([...users, newUser]));

      // Remove used code
      const updatedCodes = registrationCodes.filter((c: string) => c !== formData.code);
      localStorage.setItem("registrationCodes", JSON.stringify(updatedCodes));

      setQrCode(ticketCode);
      toast({
        title: "Success",
        description: "Registration successful!",
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: "Failed to register. Please try again.",
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
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <img src="/logo-removebg-preview.png" alt="Noon Talks Logo" className="mx-auto h-24 w-auto mb-4" />
            <h2 className="text-3xl font-bold text-[#542c6a]">
              Register for Event
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="code">Registration Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="mt-1"
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#542c6a] hover:bg-opacity-90 text-white"
            >
              Register
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}