import express from "express";
import { getFlowchartData } from "../controllers/flowchart.controller.js";
import { checkAuth } from "../middleware/checkAuth.js";

const router = express.Router();

router.get("/", checkAuth, getFlowchartData);

export default router;
