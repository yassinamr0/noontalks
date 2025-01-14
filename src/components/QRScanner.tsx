import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useToast } from '@/hooks/use-toast';

interface QRScannerProps {
  onScanSuccess: (ticketCode: string) => void;
}

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Create scanner instance
    const qrScanner = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        formatsToSupport: [ 'QR_CODE' ],
        rememberLastUsedCamera: true,
        supportedScanTypes: [ 'camera' ],
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2
      },
      /* verbose= */ false
    );

    const handleScanSuccess = (decodedText: string) => {
      onScanSuccess(decodedText);
      toast({
        title: "Success",
        description: "QR Code scanned successfully",
      });
    };

    const handleScanError = (error: any) => {
      console.error("QR Code scanning error:", error);
      if (error.name === "NotAllowedError") {
        toast({
          title: "Camera Access Required",
          description: "Please allow camera access to scan QR codes",
          variant: "destructive",
        });
      }
    };

    // Render the scanner
    qrScanner.render(handleScanSuccess, handleScanError);
    setScanner(qrScanner);

    // Cleanup function
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, []); // Empty dependency array since we only want to create the scanner once

  return (
    <div className="w-full max-w-md mx-auto">
      <div id="qr-reader" className="rounded-lg overflow-hidden shadow-lg"></div>
      <p className="text-sm text-gray-500 mt-2 text-center">
        If the camera doesn't start, please check your browser permissions and allow camera access
      </p>
    </div>
  );
}
