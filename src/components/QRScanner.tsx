import { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useToast } from '@/hooks/use-toast';

interface QRScannerProps {
  onScanSuccess: (ticketCode: string) => void;
}

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const { toast } = useToast();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    setScanner(html5QrCode);

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    if (!scanner) return;

    try {
      await scanner.start(
        { facingMode: isMobile ? "environment" : "user" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScanSuccess(decodedText);
          toast({
            title: "Success",
            description: "QR Code scanned successfully",
          });
        },
        (error) => {
          console.log(error);
        }
      );
    } catch (err) {
      console.error("Scanner error:", err);
      toast({
        title: "Camera Error",
        description: "Please make sure camera permissions are granted and try again",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    startScanning();
    
    return () => {
      if (scanner?.isScanning) {
        scanner.stop().catch(console.error);
      }
    };
  }, [scanner]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        id="qr-reader" 
        className="rounded-lg overflow-hidden shadow-lg"
        style={{
          maxWidth: '100%',
          height: isMobile ? '300px' : '250px'
        }}
      />
      <p className="text-sm text-gray-500 mt-2 text-center">
        {isMobile 
          ? "Make sure you're using your device's back camera"
          : "Position the QR code in the center of the camera view"
        }
      </p>
    </div>
  );
}
