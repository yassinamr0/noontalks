import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
  value: string;
}

export default function QRCode({ value }: QRCodeProps) {
  const isMobile = window.innerWidth < 768;
  const qrSize = isMobile ? 166 : 195;
  
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