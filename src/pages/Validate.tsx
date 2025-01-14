import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

interface RegistrationData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  qrCode: string;
  timestamp: number;
}

const Validate = () => {
  const [scannedTicket, setScannedTicket] = useState<RegistrationData | null>(
    null
  );
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      navigate("/admin");
      return;
    }

    // Configure scanner with mobile-friendly settings
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: {
          width: Math.min(250, window.innerWidth - 50),
          height: Math.min(250, window.innerWidth - 50)
        },
        aspectRatio: 1.0,
        formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ],
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true
      },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(console.error);
    };
  }, []);

  const onScanSuccess = (decodedText: string) => {
    console.log("QR Code scanned:", decodedText);
    const registrations = JSON.parse(localStorage.getItem("registrations") || "[]");
    const ticket = registrations.find((r: RegistrationData) => r.id === decodedText);

    if (ticket) {
      setScannedTicket(ticket);
      toast({
        title: "Valid Ticket",
        description: `Welcome, ${ticket.fullName}!`,
      });
    } else {
      toast({
        title: "Invalid Ticket",
        description: "This ticket was not found in our system.",
        variant: "destructive",
      });
    }
  };

  const onScanFailure = (error: string) => {
    console.log("QR Code scan error:", error);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6">
              Scan QR Code Ticket
            </h2>
            <div id="reader" className="mb-6 w-full"></div>
          </div>

          {scannedTicket && (
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-bold mb-4">Ticket Information</h3>
              <div className="space-y-2">
                <p className="text-sm md:text-base">
                  <span className="font-semibold">Name:</span>{" "}
                  {scannedTicket.fullName}
                </p>
                <p className="text-sm md:text-base">
                  <span className="font-semibold">Email:</span>{" "}
                  {scannedTicket.email}
                </p>
                <p className="text-sm md:text-base">
                  <span className="font-semibold">Ticket ID:</span>{" "}
                  {scannedTicket.id}
                </p>
                <p className="text-sm md:text-base">
                  <span className="font-semibold">Registration Date:</span>{" "}
                  {new Date(scannedTicket.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Validate;