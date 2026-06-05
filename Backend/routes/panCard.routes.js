import express from "express";
import { checkAuth } from "../middleware/checkAuth.js";
import { addPanCard, getPanCards, deletePanCard, updatePanCard } from "../controllers/panCard.controller.js";
import {
  sendShareRequest,
  getIncomingRequests,
  respondToRequest,
  getSharedWithMe,
  getMyOutgoingShares,
  revokeShare,
} from "../controllers/panShare.controller.js";

const router = express.Router();

// ── Existing PAN card routes ──────────────────────────────────────────────
router.post("/create", checkAuth, addPanCard);
router.get("/get", checkAuth, getPanCards);
router.delete("/delete/:id", checkAuth, deletePanCard);
router.patch("/update/:id", checkAuth, updatePanCard);

// ── PAN Sharing routes ────────────────────────────────────────────────────
router.post("/share/send", checkAuth, sendShareRequest);
router.get("/share/incoming", checkAuth, getIncomingRequests);
router.post("/share/respond/:id", checkAuth, respondToRequest);
router.get("/share/shared-with-me", checkAuth, getSharedWithMe);
router.get("/share/outgoing", checkAuth, getMyOutgoingShares);
router.post("/share/revoke/:id", checkAuth, revokeShare);

export default router;
