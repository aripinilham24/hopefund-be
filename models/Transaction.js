// src/models/Transaction.js
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  donateId: { type: String, required: true, unique: true },
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  donorName: { type: String, required: true },
  donorEmail: { type: String, required: true },
  donorTelpon: {type: String, required: true },
  anonymous: { type: Boolean, default: false },
  amount: { type: Number, required: true, min: 1000 }, 
  status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
  message: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);
