import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if(!uri) throw new Error("MONGO_URI is missing in .env");

    mongoose.set("strictQuery", true);
    await mongoose.connect(uri, {
        autoIndex: true,
        maxPoolSize: 10,
    });
    console.log("MongoDB connected");
}