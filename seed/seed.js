// src/seed/seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

import Campaign from "../models/Campaign.js";
import Donor from "../models/Donor.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI missing in .env");
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected for seeding");

  // Bersihkan koleksi (hindari di production)
  await Promise.all([
    Campaign.deleteMany({}),
    Donor.deleteMany({}),
    Transaction.deleteMany({}),
    User.deleteMany({})
  ]);

  const id = () => new mongoose.Types.ObjectId();

  // ====== ID Mapping ======
  const campaignIdMap = new Map([
    [1, id()], [2, id()], [3, id()], [4, id()], [5, id()], [6, id()]
  ]);
  const userIdMap = new Map([
    [1, id()], [2, id()], [3, id()], [4, id()], [5, id()]
  ]);

  // ====== Users ======
  const hash = async (plain) => bcrypt.hash(plain, 10);
  const users = [
    {
      _id: userIdMap.get(1),
      name: "admin",
      email: "admin@gmail.com",
      passwordHash: await hash("admin123"),
      role: "admin",
      avatar: "user.jpg"
    },
    {
      _id: userIdMap.get(2),
      name: "Arifin",
      email: "arifin@gmail.com",
      passwordHash: await hash("arifin123"),
      role: "user",
      avatar: "user.jpg"
    },
    {
      _id: userIdMap.get(3),
      name: "Jane Smith",
      email: "jane@example.com",
      passwordHash: await hash("jane123"),
      role: "user",
      avatar: "user.jpg"
    },
    {
      _id: userIdMap.get(4),
      name: "Michael Johnson",
      email: "michael@example.com",
      passwordHash: await hash("michael123"),
      role: "user",
      avatar: "user.jpg"
    },
    {
      _id: userIdMap.get(5),
      name: "Sarah Williams",
      email: "sarah@example.com",
      passwordHash: await hash("sarah123"),
      role: "user",
      avatar: "user.jpg"
    }
  ];

  // ====== Transactions (lebih rapih, cover semua campaign) ======
  const txRaw = [
    { campaignLegacyId: 1, userLegacyId: 2, amount: 500000, message: "Semoga bermanfaat untuk korban banjir", createdAt: "2025-04-21 01:30:00" },
    { campaignLegacyId: 1, userLegacyId: 3, amount: 750000, message: "Semoga cepat pulih ya", createdAt: "2025-04-21 03:15:00" },
    { campaignLegacyId: 2, userLegacyId: 4, amount: 1000000, message: "Pendidikan adalah hak semua anak", createdAt: "2025-04-19 07:00:00" },
    { campaignLegacyId: 3, userLegacyId: 5, amount: 300000, message: "Semoga lansia bisa lebih sehat", createdAt: "2025-04-16 04:20:00" },
    { campaignLegacyId: 4, userLegacyId: 2, amount: 1200000, message: "Hijaukan kotaku 🌳", createdAt: "2025-04-12 12:00:00" },
    { campaignLegacyId: 5, userLegacyId: 3, amount: 250000, message: "Sayangi hewan-hewan terlantar", createdAt: "2025-04-06 02:45:00" },
    { campaignLegacyId: 6, userLegacyId: 4, amount: 500000, message: "Buat kucing jalanan lebih sehat", createdAt: "2025-04-25 10:00:00" }
  ];

  const transactions = txRaw.map(t => ({
    campaign: campaignIdMap.get(t.campaignLegacyId),
    user: userIdMap.get(t.userLegacyId),
    amount: t.amount,
    message: t.message || "",
    createdAt: t.createdAt ? new Date(t.createdAt) : new Date()
  }));

  // Hitung total donasi untuk setiap campaign
  const totals = {};
  txRaw.forEach(t => {
    const id = t.campaignLegacyId;
    totals[id] = (totals[id] || 0) + t.amount;
  });

  // ====== Campaigns (rapih, shortDesc = ringkas) ======
  const campaigns = [
    {
      _id: campaignIdMap.get(1),
      title: "Bantu Korban Banjir Jakarta",
      shortDescription: "Penggalangan dana untuk korban banjir Jakarta.",
      description:
        "Banjir besar melanda beberapa wilayah Jakarta pada awal April 2025. Dana akan digunakan untuk penyediaan makanan, pakaian, tempat tinggal sementara, serta program pemulihan psikologis untuk anak-anak.",
      targetAmount: 50000000,
      amountRaised: totals[1] || 0,
      deadline: new Date("2025-05-30"),
      image: "banjir.jpg",
      createdAt: new Date("2025-04-20T10:00:00"),
      category: "sosial"
    },
    {
      _id: campaignIdMap.get(2),
      title: "Pembangunan Sekolah di Pedesaan",
      shortDescription: "Membangun sekolah dasar di daerah terpencil.",
      description:
        "Proyek ini bertujuan membangun sekolah dasar di daerah terpencil untuk memberikan akses pendidikan layak bagi anak-anak. Sekolah ini akan melayani 120 anak dari 3 dusun terdekat.",
      targetAmount: 75000000,
      amountRaised: totals[2] || 0,
      deadline: new Date("2025-06-15"),
      image: "sekolah.jpg",
      createdAt: new Date("2025-04-18T14:30:00"),
      category: "pendidikan"
    },
    {
      _id: campaignIdMap.get(3),
      title: "Bantuan Medis untuk Lansia",
      shortDescription: "Layanan kesehatan gratis untuk lansia.",
      description:
        "Program ini menyediakan layanan kesehatan komprehensif dan obat-obatan gratis bagi lansia kurang mampu. Ditargetkan membantu 500 lansia selama 6 bulan.",
      targetAmount: 30000000,
      amountRaised: totals[3] || 0,
      deadline: new Date("2025-05-20"),
      image: "lansia.jpg",
      createdAt: new Date("2025-04-15T09:15:00"),
      category: "sosial"
    },
    {
      _id: campaignIdMap.get(4),
      title: "Penghijauan Kota",
      shortDescription: "Program penanaman 1000 pohon di perkotaan.",
      description:
        "Inisiatif penghijauan dengan menanam 1000 pohon di 5 titik strategis kota. Melibatkan 200 relawan untuk mengurangi polusi udara dan menciptakan lingkungan lebih sehat.",
      targetAmount: 25000000,
      amountRaised: totals[4] || 0,
      deadline: new Date("2025-07-10"),
      image: "penghijauan.jpg",
      createdAt: new Date("2025-04-10T11:45:00"),
      category: "lingkungan"
    },
    {
      _id: campaignIdMap.get(5),
      title: "Bantuan Hewan Terlantar",
      shortDescription: "Rescue dan perawatan hewan terlantar.",
      description:
        "Program ini fokus pada penyelamatan, sterilisasi, vaksinasi, perawatan, dan adopsi hewan terlantar di jalanan.",
      targetAmount: 15000000,
      amountRaised: totals[5] || 0,
      deadline: new Date("2025-05-05"),
      image: "hewan.jpg",
      createdAt: new Date("2025-04-05T16:20:00"),
      category: "sosial"
    },
    {
      _id: campaignIdMap.get(6),
      title: "Donasi Kucing Jalanan",
      shortDescription: "Donasi untuk kucing jalanan.",
      description:
        "Program khusus untuk kucing jalanan: sterilisasi, vaksinasi, pengobatan, feeding point, dan foster care.",
      targetAmount: 1000000,
      amountRaised: totals[6] || 0,
      deadline: new Date("2025-10-10"),
      image: "1745508790_d6ce12d789e8e80cda4a.jpg",
      createdAt: new Date("2025-04-24T00:00:00"),
      category: "sosial"
    }
  ];

  // ====== Donors (optional jika mau tetap simpan) ======
  const donors = [];

  // Insert ke DB
  await Campaign.insertMany(campaigns);
  await User.insertMany(users);
  await Donor.insertMany(donors);
  await Transaction.insertMany(transactions);

  console.log("🌱 Seed done!");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
