import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useToast } from '@/hooks/use-toast';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1,
      formatsToSupport: [Html5Qrcode.FORMATS.QR_CODE],
    };

    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    const startScanning = async () => {
      try {
        // Get available cameras
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          // Try to use the back camera first (usually better for QR scanning)
          const backCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear') ||
            device.label.includes('1')  // Often main camera has 1 in name
          );
          
          const cameraId = backCamera ? backCamera.id : devices[0].id;

          await html5QrCode.start(
            cameraId,
            config,
            (decodedText) => {
              onScanSuccess(decodedText);
              toast({
                title: "Success",
                description: "QR Code scanned successfully",
              });
            },
            () => {} // Ignore failures
          );
        }
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
  }, [onScanSuccess]);

  return (
    <div className="w-full max-w-md mx-auto">
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
