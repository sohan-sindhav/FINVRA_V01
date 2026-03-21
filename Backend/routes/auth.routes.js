import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  setup2FA,
  verify2FA,
  disable2FA,
  getLoginHistory,
  updateEnabledModules,
  getAllSystemLogs,
} from "../controllers/auth.controller.js";
import { checkAuth } from "../middleware/checkAuth.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/logout", logoutUser);
router.get("/2fa/setup", checkAuth, setup2FA);
router.post("/2fa/verify", authLimiter, verify2FA);
router.post("/2fa/disable", checkAuth, disable2FA);
router.get("/sessions", checkAuth, getLoginHistory);
router.put("/modules", checkAuth, updateEnabledModules);

// Admin Routes
router.get("/admin/logs", checkAuth, isAdmin, getAllSystemLogs);

export default router;
