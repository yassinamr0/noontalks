import { QRCodeSVG } from 'qrcode.react';
import ticketDesign from '../assets/ticketdesign.png';

interface TicketDisplayProps {
  code: string;
  name: string;
}

const TicketDisplay = ({ code, name }: TicketDisplayProps) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <img 
        src={ticketDesign} 
        alt="Ticket Background" 
        className="w-full h-auto"
      />
      
      <div className="absolute top-1/2 right-[15%] transform -translate-y-1/2">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <QRCodeSVG
            value={code}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>
        <div className="text-center mt-2 text-lg font-semibold">
          {name}
        </div>
      </div>
    </div>
  );
};

export default TicketDisplay;