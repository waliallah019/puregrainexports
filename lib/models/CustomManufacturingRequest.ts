// my-leather-platform/lib/models/CustomManufacturingRequest.ts
import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICustomManufacturingRequest extends Document {
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string; // Optional
  productType: string;
  estimatedQuantity: string; // Storing as string as per your input field example
  preferredMaterial?: string; // Optional
  colors?: string; // Storing as string as per your input field example
  timeline?: string; // Optional
  designFiles: string[]; // Array of Cloudinary URLs
  specifications?: string; // Optional
  budgetRange?: string; // Optional
  status: "Pending" | "Reviewed" | "Contacted" | "Completed" | "Archived"; // Admin-facing status
  createdAt: Date;
  updatedAt: Date;
}

const CustomManufacturingRequestSchema: Schema = new Schema(
  {
    companyName: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    productType: { type: String, required: true, trim: true },
    estimatedQuantity: { type: String, required: true, trim: true },
    preferredMaterial: { type: String, trim: true },
    colors: { type: String, trim: true },
    timeline: { type: String, trim: true },
    designFiles: { type: [String], default: [] }, // Cloudinary URLs
    specifications: { type: String, trim: true },
    budgetRange: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Contacted", "Completed", "Archived"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

CustomManufacturingRequestSchema.index({ email: 1, status: 1, createdAt: -1 }); // Indexes for efficient lookup

const CustomManufacturingRequest: Model<ICustomManufacturingRequest> =
  (mongoose.models.CustomManufacturingRequest as Model<ICustomManufacturingRequest>) ||
  mongoose.model<ICustomManufacturingRequest>("CustomManufacturingRequest", CustomManufacturingRequestSchema);

export default CustomManufacturingRequest;