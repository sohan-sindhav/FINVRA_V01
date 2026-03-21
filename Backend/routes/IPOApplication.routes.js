import express from "express";
import { checkAuth } from "../middleware/checkAuth.js";
import { applyIPO, getUserApplications, cancelApplication, updateApplicationStatus } from "../controllers/IPOApplication.controller.js";

const router = express.Router();

router.post("/apply", checkAuth, applyIPO);
router.get("/get", checkAuth, getUserApplications);
router.delete("/cancel/:appId", checkAuth, cancelApplication);
router.put("/status/:appId", checkAuth, updateApplicationStatus);

export default router;
