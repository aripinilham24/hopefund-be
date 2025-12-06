import Campaign from "../models/Campaign.js";
import Transaction from "../models/Transaction.js";
import fs from "fs";
import path from "path";

// Get all campaigns
export const getCampaigns = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category && category !== "") {
      filter.category = category;
    }

    const campaigns = await Campaign.find(filter);
    res.json({ success: true, data: campaigns });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// name campaign
export const getTitleCampaignsById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).select("title");
    res.json({ success: true, data: campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get campaign by ID
export const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, message: "Campaign not found" });
    }
    const transactions = await Transaction.find({
      campaign: req.params.id,
    }).populate("user");
    res.json({
      success: true,
      campaign,
      transactions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//get campaigns by creatorId
export const getCampaignsByCreatorId = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const campaigns = await Campaign.find({ creatorId });
    res.json({ success: true, data: campaigns });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// Create new campaign
export const createCampaign = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Foto campaign wajib diupload",
      });
    }

    const {
      title,
      description,
      details,
      deadline,
      targetAmount,
      category,
      creatorId,
    } = req.body;

    await Campaign.create({
      creatorId,
      title,
      shortDescription: description,
      description: details,
      targetAmount,
      category,
      image: req.file.filename,
      deadline,
    });
    res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      data: {
        status: "success",
        message: " Campaign berhasil dibuat",
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
      data: {
        status: "error",
        message: " Terjadi kesalahan server",
      },
    });
  }
};

// Update campaign
export const updateCampaign = async (req, res) => {
  try {
    const {
      title,
      description,
      details,
      deadline,
      targetAmount,
      category,
      creatorId,
    } = req.body;

    // 1. Ambil data campaign lama
    const oldCampaign = await Campaign.findById(req.params.id);
    if (!oldCampaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    let newImage = oldCampaign.image; // default pakai gambar lama

    // 2. Jika ada file baru → update image + hapus file lama
    if (req.file) {
      newImage = req.file.filename;

      // path file lama
      const oldImagePath = path.join(
        "uploads",
        "image",
        "campaign",
        oldCampaign.image
      );

      // cek file lalu hapus
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // 3. Update DB
    await Campaign.findByIdAndUpdate(req.params.id, {
      creatorId,
      title,
      shortDescription: description,
      description: details,
      targetAmount,
      category,
      deadline,
      image: newImage,
    });

    res.status(200).json({
      success: true,
      message: "Campaign updated successfully",
      data: {
        status: "success",
        message: "Campaign berhasil diupdate",
      },
    });

  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// Delete campaign
export const deleteCampaign = async (req, res) => {
  try {
    // 1. Cari campaign dulu sebelum dihapus
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, message: "Campaign not found" });
    }

    // 2. Simpan nama file gambar
    const imageName = campaign.image;

    // 3. Hapus dari database
    await Campaign.findByIdAndDelete(req.params.id);

    // 4. Hapus file fisik gambar
    if (imageName) {
      const filePath = path.join("uploads", "image", "campaign", imageName);

      // cek apakah file ada
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // hapus file
      }
    }

    return res.json({
      success: true,
      message: "Campaign deleted successfully",
    });

  } catch (err) {
    console.error("Error deleting campaign:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error: " + err.message });
  }
};
