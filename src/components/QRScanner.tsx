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
        console.error("Error getting cameras", err);
        toast.error("Could not access cameras. Please check camera permissions.");
      });

    return () => {
      if (html5QrCode?.isScanning) {
        html5QrCode.stop().catch(console.error);
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
            const user = await scanTicket(decodedText);
            toast.success(`Valid ticket for ${user.name}! Entries: ${user.entries}`);
            // Optionally stop scanning after successful scan
            await stopScanning();
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

  const handleCameraChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCamera = e.target.value;
    if (html5QrCode?.isScanning) {
      try {
        await stopScanning();
        setSelectedCamera(newCamera);
        if (isScanning) {
          await startScanning();
        }
      } catch (err) {
        console.error("Error switching camera:", err);
        toast.error("Error switching camera");
      }
    } else {
      setSelectedCamera(newCamera);
    }
  };

  return (
    <div className="space-y-4">
      <div id="reader" className="w-full max-w-[500px] mx-auto"></div>
      
      <div className="flex flex-col gap-4 items-center">
        {cameras.length === 0 ? (
          <div className="text-red-500">No cameras found</div>
        ) : (
          <>
            <Button
              onClick={isScanning ? stopScanning : startScanning}
              className="bg-[#542c6a] hover:bg-opacity-90"
              disabled={isProcessing || !selectedCamera}
            >
              {isProcessing ? "Processing..." : isScanning ? "Stop Scanner" : "Start Scanner"}
            </Button>

            <select
              value={selectedCamera}
              onChange={handleCameraChange}
              className="w-full max-w-[300px] p-2 rounded border border-gray-300"
              disabled={isProcessing}
            >
              <option value="">Select a camera</option>
              {cameras.map((camera) => (
                <option key={camera.id} value={camera.id}>
                  {camera.label}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
    </div>
  );
}
