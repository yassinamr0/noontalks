import { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { scanTicket } from "@/lib/api";
import { toast } from 'sonner';

export default function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);

  useEffect(() => {
    let qrCode: Html5Qrcode | null = null;
    
    // Wait for the element to be available
    const initializeScanner = () => {
      try {
        qrCode = new Html5Qrcode("reader");
        setHtml5QrCode(qrCode);
        checkCamera();
      } catch (err) {
        console.error("Error initializing scanner:", err);
      }
    };

    // Check for camera access
    const checkCamera = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        setHasCamera(devices.length > 0);
      } catch (err) {
        console.error("Error getting cameras:", err);
        setHasCamera(false);
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(initializeScanner, 100);

    return () => {
      if (qrCode?.isScanning) {
        qrCode.stop().catch(console.error);
      }
    };
  }, []); // Run once on mount

  const requestCameraPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      const devices = await Html5Qrcode.getCameras();
      setHasCamera(devices.length > 0);
    } catch (err) {
      console.error("Error requesting camera permission:", err);
      toast.error("Failed to access camera. Please check your camera permissions.");
    }
  };

  const startScanning = async () => {
    if (!html5QrCode) {
      toast.error("Scanner not initialized");
      return;
    }

    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices.length === 0) {
        toast.error("No cameras found");
        return;
      }

      // Prefer back camera
      const cameraId = devices.find(camera => 
        camera.label.toLowerCase().includes('back'))?.id || devices[0].id;

      await html5QrCode.start(
        cameraId,
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

  if (hasCamera === null) {
    return (
      <div className="text-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#542c6a] mx-auto"></div>
        <p className="mt-2">Checking camera access...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div id="reader" className="w-full max-w-[500px] mx-auto"></div>
      
      <div className="flex justify-center space-x-2">
        {!hasCamera ? (
          <Button
            onClick={requestCameraPermission}
            className="bg-[#542c6a] hover:bg-[#3f1f4f] text-white"
          >
            Allow Camera Access
          </Button>
        ) : !isScanning ? (
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
    </div>
  );
}
