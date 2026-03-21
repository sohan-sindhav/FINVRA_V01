import express from "express";
import { checkAuth } from "../middleware/checkAuth.js";
import { addPanCard, getPanCards, deletePanCard } from "../controllers/panCard.controller.js";

const router = express.Router();

router.post("/create", checkAuth, addPanCard);
router.get("/get", checkAuth, getPanCards);
router.delete("/delete/:id", checkAuth, deletePanCard);

export default router;
