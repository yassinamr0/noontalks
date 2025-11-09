import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';

interface QRCodeProps {
  value: string;
}

export default function QRCode({ value }: QRCodeProps) {
  const getQRSize = () => {
    const width = window.innerWidth;
    if (width < 375) return 120; // Small phones
    if (width < 480) return 140; // Medium phones
    if (width < 768) return 155; // Large phones/small tablets
    return 195; // Tablets and desktop
  };

  const [qrSize, setQrSize] = useState(getQRSize());

  useEffect(() => {
    const handleResize = () => {
      setQrSize(getQRSize());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="flex justify-center items-center">
      <QRCodeSVG
        value={value}
        size={qrSize}
        level="H"
        includeMargin={true}
      />
    </div>
  );
}