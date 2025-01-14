import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { scanTicket } from '@/lib/api';
import { toast } from 'sonner';

export default function QRScanner() {
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!scanner) {
      const qrScanner = new Html5QrcodeScanner(
        'qr-reader',
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          aspectRatio: 1
        },
        false
      );
      setScanner(qrScanner);
    }

    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanner]);

  const startScanning = () => {
    if (!scanner) return;

    setIsScanning(true);
    scanner.render(onScanSuccess, onScanError);
  };

  const stopScanning = () => {
    if (!scanner) return;

    setIsScanning(false);
    scanner.clear().then(() => {
      const qrScanner = new Html5QrcodeScanner(
        'qr-reader',
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          aspectRatio: 1
        },
        false
      );
      setScanner(qrScanner);
    });
  };

  const onScanSuccess = async (decodedText: string) => {
    try {
      const result = await scanTicket(decodedText);
      toast.success(`Welcome ${result.name}! Entry #${result.entries}`);
      await stopScanning();
    } catch (error: any) {
      toast.error(error.message || 'Invalid QR code');
      await stopScanning();
    }
  };

  const onScanError = (error: any) => {
    console.warn(error);
  };

  return (
    <div className="mt-4">
      <div id="qr-reader" className="w-full max-w-lg mx-auto"></div>
      <div className="mt-4 flex justify-center gap-4">
        {!isScanning ? (
          <Button onClick={startScanning}>Start Scanning</Button>
        ) : (
          <Button variant="destructive" onClick={stopScanning}>
            Stop Scanning
          </Button>
        )}
      </div>
    </div>
  );
}
