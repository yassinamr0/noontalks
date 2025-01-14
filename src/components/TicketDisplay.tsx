import { useNavigate } from "react-router-dom";
import QRCode from "./QRCode";

interface TicketDisplayProps {
  ticketId: string;
  qrCodeRef: React.RefObject<SVGSVGElement>;
}

const TicketDisplay = ({ ticketId, qrCodeRef }: TicketDisplayProps) => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      <div className="mb-4">
        <QRCode 
          value={ticketId} 
          ref={qrCodeRef} 
          size={200}
          backgroundImage="/lovable-uploads/eba450ab-1c97-4805-b664-1c14c45eec7d.png"
        />
      </div>
      <div className="relative">
        <p className="text-sm text-gray-600 mb-4">
          Your Ticket ID: {ticketId}
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Check your email for the ticket details!
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-primary text-white px-4 py-2 rounded font-semibold hover:bg-opacity-90 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default TicketDisplay;