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
    const qrScanner = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
      },
      false
    );

    qrScanner.render(
      (decodedText) => {
        onScanSuccess(decodedText);
        toast({
          title: "Success",
          description: "QR Code scanned successfully",
        });
      },
      (error) => {
        console.error("QR Code scanning error:", error);
      }
    );

    setScanner(qrScanner);

    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div id="qr-reader" className="rounded-lg overflow-hidden shadow-lg"></div>
    </div>
  );
}
