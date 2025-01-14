import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useToast } from "@/hooks/use-toast";
import { scanTicket } from "@/lib/api";

interface Props {
  onScanSuccess: (code: string, user: any) => void;
}

export default function QRScanner({ onScanSuccess }: Props) {
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Get available cameras
    Html5QrcodeScanner.getCameras()
      .then((devices) => {
        setCameras(
          devices.map((device) => ({
            id: device.id,
            label: device.label || `Camera ${device.id}`,
          }))
        );
        // Default to the back camera if available
        const backCamera = devices.find((device) =>
          device.label.toLowerCase().includes("back")
        );
        if (backCamera) {
          setSelectedCamera(backCamera.id);
        } else if (devices.length > 0) {
          setSelectedCamera(devices[0].id);
        }
      })
      .catch((err) => {
        console.error("Error getting cameras:", err);
      });
  }, []);

  useEffect(() => {
    if (!selectedCamera) return;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      videoConstraints: {
        deviceId: selectedCamera,
        facingMode: "environment",
      },
    };

    const scanner = new Html5QrcodeScanner(
      "reader",
      config,
      /* verbose= */ false
    );

    let isScanning = true;

    scanner.render(
      async (decodedText) => {
        if (!isScanning) return;
        isScanning = false;

        try {
          const user = await scanTicket(decodedText);
          onScanSuccess(decodedText, user);
        } catch (err: any) {
          console.error("Error processing QR code:", err);
          toast({
            title: "Error",
            description: err.message || "Invalid QR code",
            variant: "destructive",
          });
          isScanning = true;
        }
      },
      (error) => {
        // Ignore errors during scanning
      }
    );

    return () => {
      isScanning = false;
      scanner.clear();
    };
  }, [selectedCamera, onScanSuccess, toast]);

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCamera(e.target.value);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-4">
        <select
          value={selectedCamera}
          onChange={handleCameraChange}
          className="w-full p-2 border rounded"
        >
          {cameras.map((camera) => (
            <option key={camera.id} value={camera.id}>
              {camera.label}
            </option>
          ))}
        </select>
      </div>
      <div id="reader" className="w-full"></div>
    </div>
  );
}
