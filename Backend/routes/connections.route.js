import {
  createConnection,
  getConnections,
  deleteConnection,
  editConnection,
} from "../controllers/connection.controller.js";
import { checkAuth } from "../middleware/checkAuth.js";
import express from "express";

const router = express.Router();
router.post("/create", checkAuth, createConnection);
router.get("/get", checkAuth, getConnections);
router.delete("/delete/:id", checkAuth, deleteConnection);
router.put("/edit/:id", checkAuth, editConnection);

export default router;
