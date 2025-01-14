import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeProps {
  value: string;
  userDetails?: {
    name: string;
    email: string;
    phone?: string;
    code: string;
  };
}

export function QRCode({ value, userDetails }: QRCodeProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div id="qr-code-container" className="relative w-[1200px] h-[600px]">
        <img 
          src="/ticketdesign.png" 
          alt="Ticket Background" 
          className="absolute inset-0 w-full h-full object-contain"
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-[0.02cm]">
          <QRCodeCanvas
            value={value}
            size={124}
            level="H"
            includeMargin={false}
          />
        </div>
      </div>
    </div>
  );
}