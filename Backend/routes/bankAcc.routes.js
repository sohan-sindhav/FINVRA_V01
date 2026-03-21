import express from "express";
import {
  createBankAcc,
  getBankAcc,
  updateBankAcc,
  deleteBankAcc,
  updateBalance,
  sendMoney,
} from "../controllers/bankAcc.controller.js";
import { checkAuth } from "../middleware/checkAuth.js";
import {
  createBankHistory,
  getBankHistory,
  reverseBankHistory,
} from "../controllers/BankHistory.controller.js";

const router = express.Router();

router.post("/create", checkAuth, createBankAcc);
router.get("/get", checkAuth, getBankAcc);
router.put("/update", checkAuth, updateBankAcc);
router.delete("/delete/:id", checkAuth, deleteBankAcc);
router.post("/updateBalance/:id", checkAuth, updateBalance);
router.post("/sendMoney/:fromId", checkAuth, sendMoney);
router.post("/BankHistory", checkAuth, createBankHistory);
router.get("/BankHistory", checkAuth, getBankHistory);
router.post("/BankHistory/reverse/:id", checkAuth, reverseBankHistory);

export default router;
