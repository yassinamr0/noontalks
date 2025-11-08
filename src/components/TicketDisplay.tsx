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

  const isMobile = window.innerWidth < 768;
  const qrSize = isMobile ? 166 : 195;

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-8 rounded-lg shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-white text-center md:text-left">
            <h2 className="text-3xl font-bold mb-2">Noon Talks</h2>
            <p className="text-lg opacity-90 mb-2">Ticket for:</p>
            <p className="text-xl font-semibold">{name}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <QRCodeSVG
              value={code}
              size={qrSize}
              level="H"
              includeMargin={true}
              className="mx-auto"
            />
            <div className="text-center mt-2 font-mono text-sm text-gray-600">
              {code}
            </div>
          </div>
        </div>

        <div className="mt-6 text-white text-center text-sm opacity-75">
          <p>Please show this QR code at the entrance</p>
          <p>Valid for one-time entry</p>
        </div>
      </div>
    </div>
  );
};

export default TicketDisplay;