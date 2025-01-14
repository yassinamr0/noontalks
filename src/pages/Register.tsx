import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QRCode } from "@/components/QRCode";
import { TicketDisplay } from "@/components/TicketDisplay"; // Import TicketDisplay component
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import emailjs from '@emailjs/browser';
import logo from '/logo.png';

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
        ticket_id: qrCode,
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
        title: "Ticket Sent!",
        description: "Check your email for the ticket details.",
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Email Sending Failed",
        description: "Please save your QR code from this page.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
          qrCode: newQrCode
        };
        localStorage.setItem("users", JSON.stringify([...users, newUser]));

        // Send email
        await sendTicketEmail(formData);

      } catch (err) {
        setError(err instanceof Error ? err.message : "Registration failed");
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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Login failed");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        {qrCode ? (
          <TicketDisplay 
            ticketId={qrCode} 
            userDetails={{
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              code: formData.code
            }}
          />
        ) : (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <img src={logo} alt="Noon Talks Logo" className="mx-auto h-24 w-auto mb-4" />
              <h2 className="text-3xl font-bold text-purple-600">
                {isRegistering ? "Register for Event" : "Login"}
              </h2>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {isRegistering && (
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1"
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-1"
                  required
                />
              </div>

              {isRegistering && (
                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="mt-1"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
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
        )}
      </div>
    </div>
  );
}