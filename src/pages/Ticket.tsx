import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketDisplay from '@/components/TicketDisplay';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface UserData {
  name: string;
  email: string;
  code: string;
}

export default function Ticket() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if (!user) {
      navigate('/register');
      return;
    }
    setUserData(JSON.parse(user));
  }, [navigate]);

  const downloadTicket = async () => {
    const ticketElement = document.getElementById('ticket-container');
    if (!ticketElement || !userData) return;

    try {
      const canvas = await html2canvas(ticketElement);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${userData.name}-ticket.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Your Ticket</h1>
          <p className="text-gray-600">
            Your ticket has been sent to your email. You can also download it below.
          </p>
        </div>

        <div id="ticket-container" className="mb-8">
          <TicketDisplay
            code={userData.code}
            name={userData.name}
          />
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={downloadTicket}>
            Download Ticket
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
