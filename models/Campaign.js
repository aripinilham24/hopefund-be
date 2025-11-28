// src/models/Campaign.js
import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  shortDescription: { type: String, trim: true },
  description: { type: String },
  targetAmount: { type: Number, required: true, min: 0 },
  amountRaised: { type: Number, default: 0, min: 0 },
  deadline: { type: Date, required: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  category: { type: String, trim: true }
}, { timestamps: true, _id:true });

export default mongoose.model("Campaign", campaignSchema);
