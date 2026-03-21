import express from "express";
const router = express.Router();

import {
  createTransactions,
  deleteTransactions,
  getTransactions,
  tickReverseTransaction,
} from "../controllers/transaction.controller.js";
import { checkAuth } from "../middleware/checkAuth.js";

router.post("/create", checkAuth, createTransactions);
router.get("/get", checkAuth, getTransactions);
router.delete("/delete/:transactionid", checkAuth, deleteTransactions);
router.post("/reverse/:transactionid", checkAuth, tickReverseTransaction);

export default router;
