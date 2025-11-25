import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';

type TicketType = 'single' | 'group' | null;
type PaymentMethod = 'telda' | 'instapay' | null;

export default function TicketPurchaseFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<'select-ticket' | 'user-info'>('select-ticket');
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
    setStep('user-info');
  };

  const handlePaymentSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
    // Open payment link in new tab
    if (method === 'telda') {
      window.open('https://telda.app/jamelakhazbakk', '_blank');
    } else if (method === 'instapay') {
      window.open('https://ipn.eg/S/raniaabdullah/instapay/7nhZC2', '_blank');
    }
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
    
    if (!formData.name) {
      toast.error('Please enter your name');
      return;
    }
    if (!formData.email) {
      toast.error('Please enter your email');
      return;
    }
    if (!formData.paymentProof) {
      toast.error('Please upload proof of payment');
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit ticket purchase');
      }

      toast.success('Ticket purchase submitted for verification!');
      onComplete();
    } catch (error) {
      console.error('Error submitting ticket purchase:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit ticket purchase. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="bg-gradient-to-br from-purple-900/80 to-purple-800/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 shadow-2xl">
        {step === 'select-ticket' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white text-center">Select Ticket Type</h2>
            <div className="grid grid-cols-2 gap-4">
              <Button
                className="py-8 text-lg font-semibold bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white transition-all duration-300 rounded-lg border border-purple-400/50"
                onClick={() => handleTicketSelect('single')}
              >
                Single Ticket
                <br />
                300 L.E
              </Button>
              <Button
                className="py-8 text-lg font-semibold bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white transition-all duration-300 rounded-lg border border-purple-400/50"
                onClick={() => handleTicketSelect('group')}
              >
                Group Ticket
                <br />
                1000 L.E
              </Button>
            </div>
          </div>
        )}

        {step === 'user-info' && (
          <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              {ticketType === 'single' ? 'Single Ticket (300 L.E)' : 'Group Ticket (1000 L.E)'}
            </h2>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label className="text-white font-semibold">Select Payment Method (Optional)</Label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handlePaymentSelect('telda')}
                className={`flex-1 p-4 rounded-lg transition-all duration-300 border-2 ${
                  paymentMethod === 'telda'
                    ? 'border-purple-400 bg-purple-500/20'
                    : 'border-purple-500/30 hover:border-purple-400'
                }`}
              >
                <img 
                  src="/Telda.jpg" 
                  alt="Telda" 
                  className="h-12 w-full object-contain"
                />
              </button>
              <button
                type="button"
                onClick={() => handlePaymentSelect('instapay')}
                className={`flex-1 p-4 rounded-lg transition-all duration-300 border-2 ${
                  paymentMethod === 'instapay'
                    ? 'border-purple-400 bg-purple-500/20'
                    : 'border-purple-500/30 hover:border-purple-400'
                }`}
              >
                <img 
                  src="/instapay.png" 
                  alt="Instapay" 
                  className="h-12 w-full object-contain"
                />
              </button>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white font-semibold">Full Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-2 bg-purple-950/50 border-purple-500/30 text-white placeholder-purple-300"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-white font-semibold">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="mt-2 bg-purple-950/50 border-purple-500/30 text-white placeholder-purple-300"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-white font-semibold">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-2 bg-purple-950/50 border-purple-500/30 text-white placeholder-purple-300"
                placeholder="Enter your phone number (optional)"
              />
            </div>
          </div>

          {/* Payment Proof Upload */}
          <div>
            <Label htmlFor="paymentProof" className="text-white font-semibold">Proof of Payment *</Label>
            <Input
              id="paymentProof"
              name="paymentProof"
              type="file"
              accept="image/*,.pdf"
              onChange={handleInputChange}
              required
              className="mt-2 bg-purple-950/50 border-purple-500/30 text-white file:bg-purple-600 file:text-white file:font-semibold file:border-0 file:rounded file:cursor-pointer"
            />
            <p className="text-xs text-purple-300 mt-2">
              Please upload a screenshot or photo of your payment confirmation
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              onClick={() => setStep('select-ticket')}
              disabled={isSubmitting}
              className="flex-1 bg-purple-700 hover:bg-purple-600 text-white font-semibold py-2 border border-purple-500/50"
            >
              Back
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold py-2 transition-all duration-300 border border-purple-400/50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      )}
      </div>
    </div>
  );
}
