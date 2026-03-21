import express from "express";
import { createIPO, getAllIPO, getIPOById, updateIPO, deleteIPO } from "../controllers/IPO.controller.js";
import { checkAuth as protect } from "../middleware/checkAuth.js";

const router = express.Router();

router.post("/create", protect, createIPO);
router.get("/get", protect, getAllIPO);
router.get("/get/:id", protect, getIPOById);
router.put("/update/:id", protect, updateIPO);
router.delete("/delete/:id", protect, deleteIPO);

export default router;