import { QRCodeSVG } from "qrcode.react";
import { forwardRef } from "react";

interface QRCodeProps {
  value: string;
}

const QRCode = forwardRef<HTMLDivElement, QRCodeProps>(({ value }, ref) => {
  return (
    <div ref={ref} className="relative w-[400px] mx-auto">
      <img 
        src="/Ticket Design.png" 
        alt="Ticket background" 
        className="w-full h-auto"
      />
      <div 
        className="absolute" 
        style={{ 
          top: '52%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          width: '180px',
          height: '180px',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <QRCodeSVG 
          value={value} 
          size={156}
          level="H"
        />
      </div>
    </div>
  );
});

QRCode.displayName = "QRCode";

export default QRCode;