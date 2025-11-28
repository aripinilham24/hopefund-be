// src/models/Donor.js
import mongoose from "mongoose";

const donorSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
  name: { type: String, trim: true, default: "" },
  email: { type: String, trim: true, lowercase: true, default: "" },
  message: { type: String },
  amount: { type: Number, required: true, min: 1000 },
  status: { type: String, enum: ["PENDING", "SUCCESS", "FAILED"], default: "PENDING" }
}, { timestamps: true });

donorSchema.index({ campaignId: 1, status: 1 });

export default mongoose.model("Donor", donorSchema);
