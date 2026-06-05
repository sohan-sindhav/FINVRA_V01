import express from "express";
import { checkAuth } from "../middleware/checkAuth.js";
import {
  sendShareRequest,
  getIncomingRequests,
  respondToRequest,
  getSharedWithMe,
  getMyOutgoingShares,
  revokeShare,
  getSharedIPODetails
} from "../controllers/IPOShare.controller.js";

const router = express.Router();

// All routes require authentication
router.use(checkAuth);

router.post("/share", sendShareRequest);
router.post("/respond/:id", respondToRequest);

router.get("/incoming", getIncomingRequests);
router.get("/shared-with-me", getSharedWithMe);
router.get("/outgoing", getMyOutgoingShares);

router.delete("/revoke/:id", revokeShare);

router.get("/details/:shareId", getSharedIPODetails);

export default router;
