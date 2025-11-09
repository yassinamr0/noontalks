import { QRCodeSVG } from 'qrcode.react';

interface TicketDisplayProps {
  code: string;
  name: string;
}

const TicketDisplay = ({ code, name }: TicketDisplayProps) => {
  if (!code || !name) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-500">
        Invalid ticket data
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto px-4">
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4 sm:p-8 rounded-lg shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
          <div className="text-white text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Noon Talks</h2>
            <p className="text-base sm:text-lg opacity-90 mb-2">Ticket for:</p>
            <p className="text-lg sm:text-xl font-semibold">{name}</p>
          </div>
          
          <div className="bg-white p-2 sm:p-4 rounded-lg shadow-lg max-w-[140px] sm:max-w-[180px] md:max-w-[220px]">
            <QRCodeSVG
              value={code}
              size={140}
              level="H"
              includeMargin={true}
              className="w-full h-auto"
            />
            <div className="text-center mt-1 sm:mt-2 font-mono text-[10px] sm:text-xs text-gray-600 break-all">
              {code}
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 text-white text-center text-xs sm:text-sm opacity-75">
          <p>Please show this QR code at the entrance</p>
          <p>Valid for one-time entry</p>
        </div>
      </div>
    </div>
  );
};

export default TicketDisplay;
