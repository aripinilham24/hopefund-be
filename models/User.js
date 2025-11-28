// src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  avatar: { type: String, default: "user.jpg" },
  googleId: { type: String, default: null },
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
}, { timestamps: true });


export default mongoose.model("User", userSchema);
