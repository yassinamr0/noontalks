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
    // Request camera permission first
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => {
        // Create scanner after permission is granted
        const qrScanner = new Html5QrcodeScanner(
          "qr-reader",
          { 
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            formatsToSupport: ['QR_CODE'],
            videoConstraints: {
              facingMode: { ideal: "environment" }
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
                description: "Please allow camera access to scan QR codes. You may need to reset permissions in your browser settings.",
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
          description: "Please allow camera access to scan QR codes. You may need to reset permissions in your browser settings.",
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

  return (
    <div className="w-full max-w-md mx-auto">
      <div id="qr-reader" className="rounded-lg overflow-hidden shadow-lg"></div>
      <p className="text-sm text-gray-500 mt-2 text-center">
        If the camera doesn't start, please check your browser permissions and allow camera access.
        You may need to click the camera icon in your browser's address bar.
      </p>
    </div>
  );
}
