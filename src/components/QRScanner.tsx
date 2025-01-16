import { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { scanTicket } from "@/lib/api";
import { toast } from 'sonner';

interface Camera {
  id: string;
  label: string;
}

export default function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState("");

  useEffect(() => {
    const qrCode = new Html5Qrcode("reader");
    setHtml5QrCode(qrCode);

    return () => {
      if (qrCode.isScanning) {
        qrCode.stop().catch(console.error);
      }
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      // First request camera permission
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Then get available cameras
      const devices = await Html5Qrcode.getCameras();
      const availableCameras = devices.map(device => ({
        id: device.id,
        label: device.label || `Camera ${device.id}`
      }));
      
      setCameras(availableCameras);
      
      // Select the first camera by default
      if (availableCameras.length > 0) {
        setSelectedCamera(availableCameras[0].id);
      }
    } catch (err) {
      console.error("Error requesting camera permission:", err);
      toast.error("Failed to access camera. Please check your camera permissions.");
    }
  };

  const startScanning = async () => {
    if (!html5QrCode || !selectedCamera) {
      toast.error("Please select a camera first");
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
          try {
            const response = await scanTicket(decodedText);
            if (response.user) {
              toast.success(`Valid ticket for ${response.user.name}! Entries: ${response.user.entries}`);
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
      
      <div className="flex flex-col items-center space-y-4">
        {cameras.length === 0 ? (
          <Button
            onClick={requestCameraPermission}
            className="bg-[#542c6a] hover:bg-[#3f1f4f] text-white"
          >
            Allow Camera Access
          </Button>
        ) : (
          <>
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              className="w-full max-w-[300px] p-2 rounded border border-gray-300"
              disabled={isScanning}
            >
              {cameras.map((camera) => (
                <option key={camera.id} value={camera.id}>
                  {camera.label}
                </option>
              ))}
            </select>

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
          </>
        )}
      </div>
    </div>
  );
}
