import multer from "multer";
import path from "path";

// Setup folder
const storageCampaign = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/image/campaign");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + file.originalname;
    cb(null, unique);
  }
});

export const uploadCampaign = multer({ storage: storageCampaign });
