import { useEffect, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScannerState } from 'html5-qrcode';
import { useToast } from '@/hooks/use-toast';

interface QRScannerProps {
  onScanSuccess: (ticketCode: string) => void;
}

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if we're on a mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Request camera permission first
    navigator.mediaDevices.getUserMedia({ 
      video: {
        facingMode: isMobile ? "environment" : "user",
        width: { ideal: isMobile ? 1280 : 640 },
        height: { ideal: isMobile ? 720 : 480 }
      }
    })
    .then(() => {
      // Create scanner after permission is granted
      const qrScanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10,
          qrbox: isMobile ? { width: 250, height: 250 } : { width: 200, height: 200 },
          aspectRatio: isMobile ? 16/9 : 4/3,
          showTorchButtonIfSupported: true,
          formatsToSupport: ['QR_CODE'],
          videoConstraints: {
            facingMode: isMobile ? "environment" : "user",
            width: { ideal: isMobile ? 1280 : 640 },
            height: { ideal: isMobile ? 720 : 480 }
          }
        },
        /* verbose= */ false
      );

      qrScanner.render(
        (decodedText: string) => {
          onScanSuccess(decodedText);
          toast({
            title: "Success",
            description: "QR Code scanned successfully",
          });
        },
        (error: any) => {
          console.error("QR Code scanning error:", error);
          if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
            toast({
              title: "Camera Access Required",
              description: isMobile 
                ? "Please allow camera access in your device settings to scan QR codes"
                : "Please allow camera access in your browser settings to scan QR codes",
              variant: "destructive",
            });
          }
        }
      );

      setScanner(qrScanner);
    })
    .catch((error) => {
      console.error("Camera permission error:", error);
      toast({
        title: "Camera Access Required",
        description: isMobile 
          ? "Please allow camera access in your device settings to scan QR codes"
          : "Please allow camera access in your browser settings to scan QR codes",
        variant: "destructive",
      });
    });

    return () => {
      if (scanner) {
        try {
          if (scanner.getState() !== Html5QrcodeScannerState.NOT_STARTED) {
            scanner.clear();
          }
        } catch (error) {
          console.error("Error cleaning up scanner:", error);
        }
      }
    };
  }, [onScanSuccess, toast]);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <div className="w-full max-w-md mx-auto">
      <div id="qr-reader" className="rounded-lg overflow-hidden shadow-lg" style={{
        maxWidth: '100%',
        height: isMobile ? '300px' : '250px'
      }}></div>
      <p className="text-sm text-gray-500 mt-2 text-center">
        {isMobile ? (
          "Please allow camera access when prompted. Make sure you're using your device's back camera."
        ) : (
          "If the camera doesn't start, please check your browser permissions and allow camera access."
        )}
      </p>
    </div>
  );
}
