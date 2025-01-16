import { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { scanTicket } from "@/lib/api";
import { toast } from "sonner";

export default function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const qrCode = new Html5Qrcode("reader");
    setHtml5QrCode(qrCode);

    Html5Qrcode.getCameras()
      .then((devices) => {
        const availableCameras = devices.map((device) => ({
          id: device.id,
          label: device.label || `Camera ${device.id}`,
        }));
        setCameras(availableCameras);
        // Automatically select back camera if available
        const backCamera = availableCameras.find((camera) =>
          camera.label.toLowerCase().includes("back")
        );
        if (backCamera) {
          setSelectedCamera(backCamera.id);
        } else if (availableCameras.length > 0) {
          setSelectedCamera(availableCameras[0].id);
        }
      })
      .catch((err) => {
        console.error("Error getting cameras:", err);
        toast.error("Failed to access camera");
      });

    return () => {
      if (qrCode) {
        qrCode.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    if (!html5QrCode || !selectedCamera) {
      toast.error("No camera selected");
      return;
    }

    try {
      await html5QrCode.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          if (isProcessing) return; // Prevent multiple simultaneous scans
          setIsProcessing(true);

          try {
            const response = await scanTicket(decodedText);
            if (response.user) {
              toast.success(`Valid ticket for ${response.user.name}! Entries: ${response.user.entries}`);
              // Optionally stop scanning after successful scan
              await stopScanning();
            } else {
              toast.error("Invalid ticket");
            }
          } catch (error) {
            if (error instanceof Error) {
              toast.error(error.message);
            } else {
              toast.error("Invalid ticket or error scanning");
            }
          } finally {
            setIsProcessing(false);
          }
        },
        () => {} // Ignore failures to prevent spam
      );
      setIsScanning(true);
    } catch (err) {
      console.error("Error starting camera:", err);
      toast.error("Could not start camera. Please try again.");
    }
  };

  const stopScanning = async () => {
    if (!html5QrCode?.isScanning) return;

    try {
      await html5QrCode.stop();
      setIsScanning(false);
    } catch (err) {
      console.error("Error stopping camera:", err);
      toast.error("Error stopping camera");
    }
  };

  return (
    <div className="space-y-4">
      <div id="reader" className="w-full max-w-[500px] mx-auto"></div>
      
      {cameras.length === 0 ? (
        <div className="text-center text-gray-600">
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#542c6a] hover:bg-[#3f1f4f] text-white"
          >
            Allow Camera Access
          </Button>
        </div>
      ) : (
        <div className="flex justify-center space-x-2">
          {!isScanning ? (
            <Button
              onClick={startScanning}
              className="bg-[#542c6a] hover:bg-[#3f1f4f] text-white"
            >
              Start Scanning
            </Button>
          ) : (
            <Button
              onClick={stopScanning}
              variant="destructive"
            >
              Stop Scanning
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
