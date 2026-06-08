import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';

interface QRCodeProps {
  value: string;
}

const getQRSize = () => {
  const width = window.innerWidth;
  // Scaled down by 50% from original
  if (width < 360) return 35; // Very small phones
  if (width < 430) return 40; // Small phones
  if (width < 480) return 45; // Medium phones
  if (width < 768) return 52; // Large phones/small tablets
  return 97; // Tablets and desktop
};

export default function QRCode({ value }: QRCodeProps) {
  const [qrSize, setQrSize] = useState(getQRSize());

  useEffect(() => {
    // Update size on mount to ensure correct initial size
    setQrSize(getQRSize());
    
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