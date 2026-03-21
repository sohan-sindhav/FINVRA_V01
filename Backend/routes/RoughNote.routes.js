import express from "express";
import { checkAuth } from "../middleware/checkAuth.js";
import { 
  addPerson, 
  getPersons, 
  addEntry, 
  deleteEntry,
  getHistory, 
  deletePerson,
  updatePersonNotes 
} from "../controllers/RoughNote.controller.js";

const router = express.Router();

router.post("/person", checkAuth, addPerson);
router.get("/persons", checkAuth, getPersons);
router.put("/person/:personId/notes", checkAuth, updatePersonNotes);
router.delete("/person/:personId", checkAuth, deletePerson);

router.post("/entry", checkAuth, addEntry);
router.delete("/entry/:entryId", checkAuth, deleteEntry);
router.get("/history/:personId", checkAuth, getHistory);

export default router;
