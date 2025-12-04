import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import donateRoutes from "./routes/donateRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

let url = "http://localhost:5173";
if(process.env.MODE === "PRODUCTION") {
  url = process.env.URL_FE;
}

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  "/uploads/image/",
  express.static(path.join(__dirname, "./uploads/image/"))
);

app.use(
  cors({
    origin: url,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

await connectDB();

app.use("/api/campaigns", campaignRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment", donateRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`\n\nServer running on http://localhost:${PORT}`)
);
