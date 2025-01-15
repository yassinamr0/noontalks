import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketDisplay from '@/components/TicketDisplay';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

interface UserData {
  name: string;
  email: string;
  code: string;
}

export default function Ticket() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if (!user) {
      toast.error('Please register or login first');
      navigate('/register');
      return;
    }
    try {
      setUserData(JSON.parse(user));
    } catch (error) {
      console.error('Error parsing user data:', error);
      toast.error('Invalid user data');
      navigate('/register');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const downloadTicket = async () => {
    const ticketElement = document.getElementById('ticket-container');
    if (!ticketElement || !userData) {
      toast.error('Could not find ticket to download');
      return;
    }

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(ticketElement, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: null
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${userData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-ticket.pdf`);
      toast.success('Ticket downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error downloading ticket. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#542c6a] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your ticket...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4 text-[#542c6a]">Your Ticket</h1>
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
          <Button 
            onClick={downloadTicket}
            disabled={isGenerating}
            className="bg-[#542c6a] hover:bg-opacity-90"
          >
            {isGenerating ? 'Generating PDF...' : 'Download Ticket'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            disabled={isGenerating}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
