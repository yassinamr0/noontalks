import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  ticketType: { type: String, enum: ['single', 'group'], required: true },
  paymentMethod: { type: String, enum: ['telda', 'instapay'], required: true },
  paymentProof: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
