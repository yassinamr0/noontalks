import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
  value: string;
}

export default function QRCode({ value }: QRCodeProps) {
  const getQRSize = () => {
    const width = window.innerWidth;
    if (width < 375) return 140; // Small phones
    if (width < 480) return 155; // Medium phones
    if (width < 768) return 166; // Large phones/small tablets
    return 195; // Tablets and desktop
  };
  
  return (
    <div className="flex justify-center items-center">
      <QRCodeSVG
        value={value}
        size={getQRSize()}
        level="H"
        includeMargin={true}
      />
    </div>
  );
}