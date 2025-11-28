import express from "express";
import { getConfig, createSnapTransaction, notification } from "../controllers/donateController.js";

const router = express.Router();

router.get("/config", getConfig);
router.post("/create", createSnapTransaction);
router.post("/notification", express.json(), notification);

export default router;
