import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';

type TicketType = 'single' | 'group' | null;
type PaymentMethod = 'telda' | 'instapay' | null;

export default function TicketPurchaseFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<'select-ticket' | 'select-payment' | 'user-info'>('select-ticket');
  const [ticketType, setTicketType] = useState<TicketType>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    paymentProof: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTicketSelect = (type: TicketType) => {
    setTicketType(type);
    setStep('select-payment');
  };

  const handlePaymentSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
    // Open payment link in new tab
    if (method === 'telda') {
      window.open('https://telda.app/jamelakhazbakk', '_blank');
    } else if (method === 'instapay') {
      window.open('https://ipn.eg/S/raniaabdullah/instapay/7nhZC2', '_blank');
    }
    setStep('user-info');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === 'paymentProof' && files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.paymentProof) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('ticketType', ticketType || '');
      formDataToSend.append('paymentMethod', paymentMethod || '');
      if (formData.paymentProof) {
        formDataToSend.append('paymentProof', formData.paymentProof);
      }

      const response = await fetch('/api/tickets/purchase', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to submit ticket purchase');
      }

      toast.success('Ticket purchase submitted for verification!');
      onComplete();
    } catch (error) {
      console.error('Error submitting ticket purchase:', error);
      toast.error('Failed to submit ticket purchase. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-center">
            {step === 'select-ticket' && 'Select Ticket Type'}
            {step === 'select-payment' && 'Select Payment Method'}
            {step === 'user-info' && 'Enter Your Information'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 'select-ticket' && (
            <div className="space-y-4">
              <Button
className="w-full py-6 text-lg bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => handleTicketSelect('single')}
              >
                Single Ticket - 300 L.E
              </Button>
              <Button
className="w-full py-6 text-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleTicketSelect('group')}
              >
                Group Ticket - 1000 L.E
              </Button>
            </div>
          )}

          {step === 'select-payment' && (
            <div className="space-y-4">
              <p className="text-center mb-4">
                {ticketType === 'single' 
                  ? 'Single Ticket (300 L.E)' 
                  : 'Group Ticket (1000 L.E)'}
              </p>
              <Button
className="w-full py-6 text-lg flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => handlePaymentSelect('telda')}
              >
                <img 
                  src="/telda.jpg" 
                  alt="Telda" 
                  className="h-6 w-6 object-contain" 
                />
                Pay with Telda
              </Button>
              <Button
className="w-full py-6 text-lg flex items-center justify-center gap-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                onClick={() => handlePaymentSelect('instapay')}
              >
                <img 
                  src="/instapay.png" 
                  alt="Instapay" 
                  className="h-6 w-6 object-contain" 
                />
                Pay with Instapay
              </Button>
              <Button
                className="w-full mt-2 bg-transparent hover:bg-accent text-accent-foreground"
                onClick={() => setStep('select-ticket')}
                disabled={isSubmitting}
              >
                Back
              </Button>
            </div>
          )}

          {step === 'user-info' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="paymentProof">Proof of Payment *</Label>
                <Input
                  id="paymentProof"
                  name="paymentProof"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Please upload a screenshot or photo of your payment confirmation
                </p>
              </div>
              <div className="flex justify-between pt-2">
                <Button
                  type="button"
className="border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setStep('select-payment')}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
