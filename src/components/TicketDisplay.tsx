import { QRCodeSVG } from 'qrcode.react';

interface TicketDisplayProps {
  code: string;
  name: string;
}

const TicketDisplay = ({ code, name }: TicketDisplayProps) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-8 rounded-lg shadow-xl">
        <div className="flex justify-between items-center">
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-2">Noon Talks</h2>
            <p className="text-lg opacity-90">Ticket for {name}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <QRCodeSVG
              value={code}
              size={200}
              level="H"
              includeMargin={true}
            />
            <div className="text-center mt-2 text-sm text-gray-600">
              {code}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDisplay;