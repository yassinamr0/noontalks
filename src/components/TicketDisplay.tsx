import { useNavigate } from "react-router-dom";
import { QRCode } from "./QRCode";
import logo from '/logo.png';

interface TicketDisplayProps {
  ticketId: string;
  userDetails?: {
    name: string;
    email: string;
    phone?: string;
    code: string;
  };
}

const TicketDisplay = ({ ticketId, userDetails }: TicketDisplayProps) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8">
      <div className="text-center mb-8">
        <img src={logo} alt="Noon Talks Logo" className="mx-auto h-24 w-auto mb-4" />
        <h2 className="text-3xl font-bold text-purple-600">Your Event Ticket</h2>
      </div>

      <div className="flex flex-col items-center gap-6">
        {userDetails && (
          <div className="w-full text-left space-y-2">
            <p className="text-gray-700"><span className="font-semibold">Name:</span> {userDetails.name}</p>
            <p className="text-gray-700"><span className="font-semibold">Email:</span> {userDetails.email}</p>
            {userDetails.phone && (
              <p className="text-gray-700"><span className="font-semibold">Phone:</span> {userDetails.phone}</p>
            )}
            <p className="text-gray-700"><span className="font-semibold">Code:</span> {userDetails.code}</p>
          </div>
        )}

        <QRCode 
          value={ticketId}
          userDetails={userDetails}
        />

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 mb-4">
            Your ticket has been sent to your email!
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDisplay;