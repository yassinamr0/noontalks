import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { sendWelcomeEmail } from '@/lib/email';

interface Ticket {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  ticketType: 'single' | 'group';
  paymentMethod: 'telda' | 'instapay';
  paymentProof: string;
  createdAt: string;
}

export default function TicketsTab() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingProof, setViewingProof] = useState<{ url: string; name: string } | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/admin/tickets', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (ticketId: string) => {
    setVerifyingId(ticketId);
    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to verify ticket');
      }

      const data = await response.json();
      
      // Send welcome email
      try {
        await sendWelcomeEmail({
          to_email: data.user.email,
          to_name: data.user.name,
        });
        toast.success('Ticket verified and welcome email sent!');
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        toast.success('Ticket verified but failed to send email');
      }

      // Remove the verified ticket from the list
      setTickets(tickets.filter(ticket => ticket._id !== ticketId));
    } catch (error) {
      console.error('Error verifying ticket:', error);
      toast.error('Failed to verify ticket');
    } finally {
      setVerifyingId(null);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading tickets...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Unverified Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No unverified tickets found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-left py-2 px-2">Email</th>
                    <th className="text-left py-2 px-2">Phone</th>
                    <th className="text-left py-2 px-2">Ticket Type</th>
                    <th className="text-left py-2 px-2">Payment Method</th>
                    <th className="text-left py-2 px-2">Date</th>
                    <th className="text-left py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket._id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-2">{ticket.name}</td>
                      <td className="py-2 px-2">{ticket.email}</td>
                      <td className="py-2 px-2">{ticket.phone || '-'}</td>
                      <td className="py-2 px-2 capitalize">{ticket.ticketType}</td>
                      <td className="py-2 px-2 capitalize">{ticket.paymentMethod}</td>
                      <td className="py-2 px-2 text-xs">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-2 space-x-2 flex">
                        <Button
                          className="bg-transparent hover:bg-accent text-accent-foreground text-xs"
                          onClick={() => setViewingProof({ 
                            url: ticket.paymentProof, 
                            name: `${ticket.name}'s Payment Proof` 
                          })}
                        >
                          View Proof
                        </Button>
                        <Button
                          className="text-xs"
                          onClick={() => handleVerify(ticket._id)}
                          disabled={verifyingId === ticket._id}
                        >
                          {verifyingId === ticket._id ? 'Verifying...' : 'Verify'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Preview Modal */}
      {viewingProof && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-medium">{viewingProof.name}</h3>
              <button 
                onClick={() => setViewingProof(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              {viewingProof.url.endsWith('.pdf') ? (
                <iframe 
                  src={viewingProof.url} 
                  className="w-full h-[70vh] border"
                  title="Payment Proof"
                />
              ) : (
                <img 
                  src={viewingProof.url} 
                  alt="Payment Proof" 
                  className="max-w-full h-auto max-h-[70vh] mx-auto"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
