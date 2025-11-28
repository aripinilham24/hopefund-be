import snap from "../config/midtrans.js";
import Transaction from "../models/Transaction.js";

export const getConfig = async (req, res) => {
    try {
        const clientKey = process.env.MIDTRANS_CLIENT_KEY;
        res.json({ clientKey });
    } catch (err) {
        console.error("❌ Error fetching client key:", err.message);
        res.status(500).json({ message: "Gagal mengambil client key" });
    }
};

export const createSnapTransaction = async (req, res) => {
    try {
        const { donateId, amount, message, customer, campaignId } = req.body;

        if (!donateId || !amount || !customer?.name || !customer?.email) {
            return res.status(400).json({
                success: false,
                message: "Data transaksi tidak lengkap.",
            });
        }

        const parameters = {
            transaction_details: {
                order_id: donateId,
                gross_amount: amount,
            },
            customer_details: {
                first_name: customer.name,
                email: customer.email,
                phone: customer.telp,
            },

            callbacks: {
                finish: `http://localhost:5173/detailcampaign/${campaignId}`,
                unfinish: `http://localhost:5173/detailcampaign/${campaignId}`,
                error: `http://localhost:5173/detailcampaign/${campaignId}`,
            },
        };

        const transaction = await snap.createTransaction(parameters);
        // transaction.redirect_url, transaction.token, dll

        // Simpan transaksi awal ke DB dengan status pending
        const newTransaction = await Transaction.create({
            donateId,
            campaign: campaignId || null, // opsional
            user: customer.userId || null,
            donorName: customer.name,
            donorEmail: customer.email,
            donorTelpon: customer.telp,
            anonymous: Boolean(customer.anonymous),
            amount,
            status: "pending",
            message: message || "",
            paymentToken: transaction.token,
        });

        return res.status(201).json({
            success: true,
            message: "Transaksi berhasil dibuat",
            redirect_url: transaction.redirect_url,
            token: transaction.token,
            transaction: newTransaction,
        });
    } catch (err) {
        console.error("❌ Error create transaction:", err.message);
        return res.status(500).json({
            success: false,
            message: "Gagal membuat transaksi, silakan coba lagi.",
        });
    }
};

export const handleMidtransNotification = async (req, res) => {
    try {
        const notification = req.body;

        const { order_id, transaction_status, fraud_status } = notification;

        // Cari transaksi berdasarkan order_id
        const tx = await Transaction.findOne({ donateId: order_id });
        if (!tx) {
            return res
                .status(404)
                .json({ message: "Transaksi tidak ditemukan" });
        }

        if (transaction_status === "settlement" && fraud_status === "accept") {
            tx.status = "success";
        } else if (transaction_status === "pending") {
            tx.status = "pending";
        } else {
            tx.status = "failed";
        }

        await tx.save();

        // harus balas 200 ke Midtrans
        return res.status(200).json({ message: "OK" });
    } catch (err) {
        console.error("Error notification:", err);
        return res.status(500).json({ message: "Error" });
    }
};

export const notification = async (req, res) => {
    try {
        const notification = req.body;

        const { order_id, transaction_status, fraud_status } = notification;

        // Cari transaksi berdasarkan order_id
        const tx = await Transaction.findOne({ donateId: order_id });
        if (!tx) {
            return res
                .status(404)
                .json({ message: "Transaksi tidak ditemukan" });
        }

        if (transaction_status === "settlement" && fraud_status === "accept") {
            tx.status = "success";
        } else if (transaction_status === "pending") {
            tx.status = "pending";
        } else {
            tx.status = "failed";
        }

        await tx.save();

        // harus balas 200 ke Midtrans
        return res.status(200).json({ message: "OK" });
    } catch (err) {
        console.error("Error notification:", err);
        return res.status(500).json({ message: "Error" });
    }
};
