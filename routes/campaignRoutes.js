import express from "express";
import {
  getCampaigns,
  getCampaignById,
  getTitleCampaignsById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignsByCreatorId
} from "../controllers/campaignController.js";
import { uploadCampaign } from "../middlewares/storage.js";

const router = express.Router();

router.get("/", getCampaigns); // GET all
router.get("/title/:id", getTitleCampaignsById); // GET title campaign by id
router.get("/:id", getCampaignById); // GET one
router.get("/creator/:creatorId", getCampaignsByCreatorId)
router.post("/create", uploadCampaign.single("image"), createCampaign); // POST new
router.put("/:id", uploadCampaign.single("image"), updateCampaign); // PUT update
router.delete("/:id", deleteCampaign); // DELETE

export default router;
