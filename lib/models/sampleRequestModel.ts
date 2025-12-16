// lib/models/sampleRequestModel.ts
import mongoose, { Document, Schema } from 'mongoose';

export type PaymentStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'failed' | 'refunded';

interface PaymentError {
    code?: string;
    message?: string;
}

export type SampleRequestItemType = 'raw-leather' | 'finished-products' | 'both';
export type Urgency = 'standard' | 'express' | 'rush';
export type BusinessType = 'wholesaler' | 'retailer' | 'manufacturer' | 'distributor' | 'designer' | 'other';
export type IntendedUse = 'production' | 'resale' | 'testing' | 'development' | 'other';
export type ExpectedVolume = 'small' | 'medium' | 'large' | 'ongoing' | 'unsure';

export interface ISampleRequest extends Document {
  _id: string;
  // FIX: Add a human-readable request number
  requestNumber: string; // New field
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  country: string;
  urgency: Urgency;
  address: string;
  sampleType: SampleRequestItemType;
  quantitySamples?: string;
  materialPreference?: string;
  finishType?: string;
  colorPreferences?: string;
  specificRequests?: string;
  businessType?: BusinessType;
  intendedUse?: IntendedUse;
  futureVolume?: ExpectedVolume;
  productId?: mongoose.Types.ObjectId;
  productName?: string;
  productTypeCategory?: 'finished-product' | 'raw-leather';
  shippingFee: number;
  paymentStatus: PaymentStatus;
  wiseTransferId?: string;
  paymentError?: PaymentError;
  shippedAt?: Date;
  shippingTrackingLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

const sampleRequestSchema: Schema<ISampleRequest> = new Schema<ISampleRequest>({
  // FIX: Add requestNumber to schema
  requestNumber: { type: String, unique: true, required: true },
  companyName: { type: String, required: true, trim: true },
  contactPerson: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  phone: { type: String, trim: true },
  country: { type: String, required: true, trim: true },
  urgency: { type: String, enum: ['standard', 'express', 'rush'], default: 'standard' },
  address: { type: String, required: true, trim: true },
  sampleType: { type: String, enum: ['raw-leather', 'finished-products', 'both'], required: true },
  quantitySamples: { type: String, trim: true },
  materialPreference: { type: String, trim: true },
  finishType: { type: String, trim: true },
  colorPreferences: { type: String, trim: true },
  specificRequests: { type: String, trim: true },
  businessType: { type: String, enum: ['wholesaler', 'retailer', 'manufacturer', 'distributor', 'designer', 'other'], default: 'other' },
  intendedUse: { type: String, enum: ['production', 'resale', 'testing', 'development', 'other'], default: 'other' },
  futureVolume: { type: String, enum: ['small', 'medium', 'large', 'ongoing', 'unsure'], default: 'unsure' },
  productId: { type: Schema.Types.ObjectId, refPath: 'productTypeCategory' },
  productName: { type: String, trim: true },
  productTypeCategory: { type: String, enum: ['finished-product', 'raw-leather'] },
  shippingFee: { type: Number, required: true, min: 0 },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'failed', 'refunded'],
    default: 'pending'
  },
  wiseTransferId: { type: String },
  paymentError: {
    code: { type: String },
    message: { type: String },
  },
  shippedAt: { type: Date },
  shippingTrackingLink: { type: String, trim: true },
}, { timestamps: true });

sampleRequestSchema.index({ wiseTransferId: 1 }, { unique: true, sparse: true });
// FIX: Add index for requestNumber
sampleRequestSchema.index({ requestNumber: 1 }, { unique: true });

const SampleRequest = mongoose.models.SampleRequest || mongoose.model<ISampleRequest>('SampleRequest', sampleRequestSchema);

export default SampleRequest;