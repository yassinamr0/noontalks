import { QRCodeCanvas } from 'qrcode.react';
import { Button } from './ui/button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '/logo.png';

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
  const downloadQRCode = async () => {
    const qrCodeElement = document.getElementById('qr-code-container');
    if (!qrCodeElement) return;

    try {
      const canvas = await html2canvas(qrCodeElement);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Add logo
      const logoImg = new Image();
      logoImg.src = logo;
      pdf.addImage(logo, 'PNG', 75, 20, 60, 60);

      // Add title
      pdf.setFontSize(24);
      pdf.setTextColor(128, 0, 128); // Purple color
      pdf.text('Noon Talks Event Ticket', 105, 100, { align: 'center' });

      // Add user details
      if (userDetails) {
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Name: ${userDetails.name}`, 50, 120);
        pdf.text(`Email: ${userDetails.email}`, 50, 130);
        if (userDetails.phone) {
          pdf.text(`Phone: ${userDetails.phone}`, 50, 140);
        }
        pdf.text(`Code: ${userDetails.code}`, 50, 150);
      }

      // Add QR code
      pdf.addImage(imgData, 'PNG', 65, 160, 80, 80);

      // Add footer
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text('Please keep this ticket safe and present it at the event.', 105, 270, { align: 'center' });

      pdf.save('noon-talks-ticket.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div id="qr-code-container" className="bg-white p-4 rounded-lg shadow-lg">
        <QRCodeCanvas
          value={value}
          size={200}
          level="H"
          includeMargin={true}
        />
      </div>
      <Button 
        onClick={downloadQRCode}
        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
      >
        Download Ticket PDF
      </Button>
    </div>
  );
}