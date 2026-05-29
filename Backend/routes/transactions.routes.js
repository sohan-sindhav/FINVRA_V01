import express from "express";
const router = express.Router();

import {
  createTransactions,
  deleteTransactions,
  getTransactions,
  tickReverseTransaction,
} from "../controllers/transaction.controller.js";
import {
  sendShareRequest,
  getIncomingRequests,
  respondToRequest,
  getSharedWithMe,
  getMyOutgoingShares,
  revokeShare,
} from "../controllers/transactionShare.controller.js";
import { checkAuth } from "../middleware/checkAuth.js";

router.post("/create", checkAuth, createTransactions);
router.get("/get", checkAuth, getTransactions);
router.delete("/delete/:transactionid", checkAuth, deleteTransactions);
router.post("/reverse/:transactionid", checkAuth, tickReverseTransaction);

// Sharing routes
router.post("/share/send", checkAuth, sendShareRequest);
router.get("/share/incoming", checkAuth, getIncomingRequests);
router.post("/share/respond/:id", checkAuth, respondToRequest);
router.get("/share/shared-with-me", checkAuth, getSharedWithMe);
router.get("/share/outgoing", checkAuth, getMyOutgoingShares);
router.post("/share/revoke/:id", checkAuth, revokeShare);

export default router;
