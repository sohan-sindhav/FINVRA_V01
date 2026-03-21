import mongoose from "mongoose";
import { encrypt, decrypt } from "../utils/encryption.js";

const RoughNotePersonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  notes: { 
    type: String, 
    default: "",
    set: (v) => (v ? encrypt(v) : ""),
    get: (v) => (v ? decrypt(v) : ""),
  },
  lastModified: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

export default mongoose.model("RoughNotePerson", RoughNotePersonSchema);
