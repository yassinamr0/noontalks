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

  useEffect(() => {
    const qrCode = new Html5Qrcode("reader");
    setHtml5QrCode(qrCode);

    Html5Qrcode.getCameras()
      .then((devices) => {
        const availableCameras = devices.map((device) => ({
          id: device.id,
          label: device.label,
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
      });

    return () => {
      if (html5QrCode?.isScanning) {
        html5QrCode.stop();
      }
    };
  }, []);

  const startScanning = async () => {
    if (!html5QrCode || !selectedCamera) return;

    try {
      await html5QrCode.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          try {
            const result = await scanTicket(decodedText);
            if (result.isValid) {
              toast.success("Valid ticket!");
            } else {
              toast.error("Invalid ticket!");
            }
          } catch (error) {
            toast.error("Error scanning ticket");
          }
        },
        () => {}
      );
      setIsScanning(true);
    } catch (err) {
      console.error("Error starting camera:", err);
      toast.error("Error starting camera");
    }
  };

  const stopScanning = async () => {
    if (html5QrCode?.isScanning) {
      await html5QrCode.stop();
      setIsScanning(false);
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (html5QrCode?.isScanning) {
      stopScanning().then(() => {
        setSelectedCamera(e.target.value);
      });
    } else {
      setSelectedCamera(e.target.value);
    }
  };

  return (
    <div className="space-y-4">
      <div id="reader" className="w-full max-w-[500px] mx-auto"></div>
      
      <div className="flex flex-col gap-4 items-center">
        <Button
          onClick={isScanning ? stopScanning : startScanning}
          className="bg-[#542c6a] hover:bg-opacity-90"
        >
          {isScanning ? "Stop Scanner" : "Start Scanner"}
        </Button>

        <select
          value={selectedCamera}
          onChange={handleCameraChange}
          className="w-full max-w-[300px] p-2 rounded border border-gray-300"
        >
          {cameras.map((camera) => (
            <option key={camera.id} value={camera.id}>
              {camera.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
