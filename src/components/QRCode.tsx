import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
  value: string;
}

export default function QRCode({ value }: QRCodeProps) {
  return (
    <div className="flex justify-center items-center">
      <QRCodeSVG
        value={value}
        size={200}
        level="H"
        includeMargin={true}
      />
    </div>
  );
}