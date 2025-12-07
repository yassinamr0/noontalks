import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const [showTeldaQR, setShowTeldaQR] = useState(false);

  const handleTicketSelect = (type: TicketType) => {
    setTicketType(type);
    setStep('user-info');
  };

  const handlePaymentSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
    
    if (method === 'telda') {
      setShowTeldaQR(true);
    } else if (method === 'instapay') {
      const isAndroid = /Android/i.test(navigator.userAgent);
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      
      if (isAndroid) {
        window.location.href = 'intent://ipn.eg/S/raniaabdullah/instapay/7nhZC2#Intent;scheme=https;S.browser_fallback_url=https://ipn.eg/S/raniaabdullah/instapay/7nhZC2;end';
      } else if (isIOS) {
        window.location.href = 'https://ipn.eg/S/raniaabdullah/instapay/7nhZC2';
      } else {
        window.open('https://ipn.eg/S/raniaabdullah/instapay/7nhZC2', '_blank');
      }
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

  const handleSubmit = async () => {
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
      {showTeldaQR && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowTeldaQR(false)}>
          <div className="bg-gradient-to-br from-purple-900/95 to-purple-800/95 backdrop-blur-xl border-2 border-purple-400/60 rounded-3xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center space-y-6">
<h3 className="text-3xl font-bold text-white">Scan to Pay with Telda</h3>
              <div className="bg-white p-4 rounded-2xl">
                <img 
                  src="/teldacode.jpg" 
                  alt="Telda QR Code" 
                  className="w-full h-auto"
                />
              </div>
              <div className="space-y-2">
                <p className="text-purple-200 text-sm">Send payment to:</p>
                <p className="text-2xl font-bold text-white">@jamelakhazbakk</p>
              </div>
              <Button
                onClick={() => setShowTeldaQR(false)}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold py-3 transition-all duration-300 border-2 border-purple-400/60 rounded-lg shadow-lg hover:shadow-purple-500/50"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-gradient-to-br from-purple-900/90 to-purple-800/90 backdrop-blur-xl border border-purple-400/40 rounded-3xl p-8 shadow-2xl">
        {step === 'select-ticket' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-2">Select Your Ticket</h2>
              <p className="text-purple-200 text-sm">Choose the ticket type that suits you best</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                className="py-10 text-lg font-bold bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 hover:from-purple-500 hover:via-purple-600 hover:to-purple-700 text-white transition-all duration-300 rounded-xl border-2 border-purple-400/60 hover:border-purple-300 shadow-lg hover:shadow-purple-500/50 hover:scale-105"
                onClick={() => handleTicketSelect('single')}
              >
                <div className="flex flex-col items-center">
                  <span>Single Ticket</span>
                  <span className="text-2xl font-bold mt-1">300 L.E</span>
                </div>
              </Button>
              <Button
                className="py-10 text-lg font-bold bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 hover:from-purple-500 hover:via-purple-600 hover:to-purple-700 text-white transition-all duration-300 rounded-xl border-2 border-purple-400/60 hover:border-purple-300 shadow-lg hover:shadow-purple-500/50 hover:scale-105"
                onClick={() => handleTicketSelect('group')}
              >
                <div className="flex flex-col items-center">
                  <span>Group Ticket</span>
                  <span className="text-2xl font-bold mt-1">1000 L.E</span>
                </div>
              </Button>
            </div>
          </div>
        )}

        {step === 'user-info' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">
                {ticketType === 'single' ? 'Single Ticket' : 'Group Ticket'}
              </h2>
              <p className="text-purple-300 text-lg font-semibold">
                {ticketType === 'single' ? '300 L.E' : '1000 L.E'}
              </p>
            </div>

            <div className="space-y-4">
              <Label className="text-white font-bold text-base">Select Payment Method</Label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => handlePaymentSelect('telda')}
                  className={`flex-1 p-5 rounded-xl transition-all duration-300 border-2 backdrop-blur-sm ${
                    paymentMethod === 'telda'
                      ? 'border-purple-300 bg-purple-500/30 shadow-lg shadow-purple-500/30'
                      : 'border-purple-500/40 hover:border-purple-400 hover:bg-purple-500/10'
                  }`}
                >
                  <img 
                    src="/Telda.jpg" 
                    alt="Telda" 
                    className="h-14 w-full object-contain"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => handlePaymentSelect('instapay')}
                  className={`flex-1 p-5 rounded-xl transition-all duration-300 border-2 backdrop-blur-sm ${
                    paymentMethod === 'instapay'
                      ? 'border-purple-300 bg-purple-500/30 shadow-lg shadow-purple-500/30'
                      : 'border-purple-500/40 hover:border-purple-400 hover:bg-purple-500/10'
                  }`}
                >
                  <img 
                    src="/instapay.png" 
                    alt="Instapay" 
                    className="h-14 w-full object-contain"
                  />
                </button>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <Label htmlFor="name" className="text-white font-bold text-sm block mb-2">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-purple-950/60 border-2 border-purple-500/40 text-white placeholder-purple-400 rounded-lg focus:border-purple-400 focus:bg-purple-950/80 transition-all py-3 px-4"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-white font-bold text-sm block mb-2">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-purple-950/60 border-2 border-purple-500/40 text-white placeholder-purple-400 rounded-lg focus:border-purple-400 focus:bg-purple-950/80 transition-all py-3 px-4"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-white font-bold text-sm block mb-2">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-purple-950/60 border-2 border-purple-500/40 text-white placeholder-purple-400 rounded-lg focus:border-purple-400 focus:bg-purple-950/80 transition-all py-3 px-4"
                  placeholder="Enter your phone number (optional)"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="paymentProof" className="text-white font-bold text-sm block mb-2">Proof of Payment *</Label>
              <Input
                id="paymentProof"
                name="paymentProof"
                type="file"
                accept="image/*,.pdf"
                onChange={handleInputChange}
                required
                className="w-full bg-purple-950/60 border-2 border-purple-500/40 text-white rounded-lg file:bg-purple-600 file:text-white file:font-semibold file:border-0 file:rounded file:cursor-pointer file:px-4 file:py-2 hover:file:bg-purple-700 transition-all py-3 px-4"
              />
              <p className="text-xs text-purple-300 mt-3">
                📸 Please upload a screenshot or photo of your payment confirmation
              </p>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                onClick={() => setStep('select-ticket')}
                disabled={isSubmitting}
                className="flex-1 bg-purple-700/60 hover:bg-purple-600 text-white font-bold py-3 border-2 border-purple-500/50 rounded-lg transition-all duration-300 hover:shadow-lg"
              >
                Back
              </Button>
              <Button 
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold py-3 transition-all duration-300 border-2 border-purple-400/60 rounded-lg shadow-lg hover:shadow-purple-500/50 hover:scale-105 disabled:opacity-50"
              >
                {isSubmitting ? '⏳ Submitting...' : '✓ Submit'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
