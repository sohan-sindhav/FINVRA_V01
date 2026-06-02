import express from "express";
import { checkAuth } from "../middleware/checkAuth.js";
import {
  getPartners,
  sendPartnerRequest,
  acceptPartnerRequest,
  rejectPartnerRequest
} from "../controllers/partner.controller.js";

const router = express.Router();

router.get("/", checkAuth, getPartners);
router.post("/request", checkAuth, sendPartnerRequest);
router.post("/accept", checkAuth, acceptPartnerRequest);
router.post("/reject", checkAuth, rejectPartnerRequest);

export default router;
