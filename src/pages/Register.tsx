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
    setError("");
    setQrCode(""); // Reset QR code

    if (isRegistering) {
      // Registration logic
      if (!formData.name || !formData.email || !formData.code) {
        setError("Please fill in all required fields");
        return;
      }

      try {
        // Get existing users
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        
        // Check if email already exists
        if (users.some((user: RegistrationData) => user.email === formData.email)) {
          setError("This email is already registered");
          return;
        }

        // Check if code is valid
        const validCodes = JSON.parse(localStorage.getItem("validCodes") || "[]");
        if (!validCodes.includes(formData.code)) {
          setError("Invalid registration code");
          return;
        }

        // Generate QR code
        const newQrCode = `NOON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setQrCode(newQrCode);

        // Save user
        const newUser = {
          ...formData,
          registeredAt: new Date().toISOString(),
          qrCode: newQrCode,
        };

        localStorage.setItem("users", JSON.stringify([...users, newUser]));

        // Send email with ticket
        await sendTicketEmail(formData);

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
    } else {
      // Login logic
      if (!formData.email || !formData.code) {
        setError("Please enter your email and code");
        return;
      }

      try {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const user = users.find((u: RegistrationData & { qrCode: string }) => 
          u.email === formData.email && u.code === formData.code
        );

        if (!user) {
          setError("Invalid email or code");
          return;
        }

        setQrCode(user.qrCode);
        toast({
          title: "Success",
          description: "Login successful!",
        });
      } catch (error) {
        console.error("Error during login:", error);
        toast({
          title: "Error",
          description: "Login failed. Please try again.",
          variant: "destructive",
        });
      }
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
              {isRegistering ? "Register for Event" : "Login"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegistering && (
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
            )}

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

            {isRegistering && (
              <div>
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
            )}

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
              {isRegistering ? "Register" : "Login"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full mt-4"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  code: "",
                });
                setError("");
                setQrCode("");
              }}
            >
              {isRegistering ? "Already registered? Login" : "Need to register?"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}