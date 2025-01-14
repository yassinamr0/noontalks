import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QRScannerProps {
  onScanSuccess: (decodedText: string, userData?: any) => void;
}

interface Camera {
  id: string;
  label: string;
}

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        setCameras(devices.map(device => ({
          id: device.id,
          label: device.label || `Camera ${device.id}`
        })));
        
        // Try to select back camera by default
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        );
        if (backCamera) {
          setSelectedCamera(backCamera.id);
        } else if (devices.length > 0) {
          setSelectedCamera(devices[0].id);
        }
      } catch (err) {
        console.error("Error getting cameras:", err);
      }
    };

    getCameras();
  }, []);

  useEffect(() => {
    if (!selectedCamera) return;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1,
    };

    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    const startScanning = async () => {
      try {
        await html5QrCode.start(
          selectedCamera,
          config,
          async (decodedText) => {
            try {
              // Parse QR code data
              const qrData = JSON.parse(decodedText);
              
              // Get user data from storage
              const users = JSON.parse(localStorage.getItem("users") || "[]");
              const user = users.find((u: any) => u.ticketCode === qrData.ticketCode);
              
              if (user) {
                onScanSuccess(qrData.ticketCode, user);
                toast({
                  title: "Success",
                  description: `Welcome ${qrData.name}!`,
                });
              } else {
                toast({
                  title: "Error",
                  description: "Invalid ticket code",
                  variant: "destructive",
                });
              }
            } catch (err) {
              console.error("Error processing QR code:", err);
              toast({
                title: "Error",
                description: "Invalid QR code format",
                variant: "destructive",
              });
            }
          },
          () => {} // Ignore failures
        );
      } catch (err) {
        console.error("Error starting scanner:", err);
        toast({
          title: "Camera Error",
          description: "Please make sure camera permissions are granted and try again",
          variant: "destructive",
        });
      }
    };

    startScanning();

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(err => console.error("Error stopping scanner:", err));
      }
    };
  }, [selectedCamera, onScanSuccess, toast]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-4">
        <Select value={selectedCamera} onValueChange={setSelectedCamera}>
          <SelectTrigger>
            <SelectValue placeholder="Select a camera" />
          </SelectTrigger>
          <SelectContent>
            {cameras.map((camera) => (
              <SelectItem key={camera.id} value={camera.id}>
                {camera.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div id="reader" className="rounded-lg overflow-hidden shadow-lg w-full" style={{
        maxWidth: '100%',
        height: '300px'
      }} />
      <p className="text-sm text-gray-500 mt-2 text-center">
        Position the QR code in the center of the camera view
      </p>
    </div>
  );
}
