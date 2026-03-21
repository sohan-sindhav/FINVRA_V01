import mongoose from "mongoose";
import { encrypt, decrypt } from "../utils/encryption.js";

const RoughNoteEntrySchema = new mongoose.Schema({
  personId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RoughNotePerson",
    required: true,
  },
  type: {
    type: String,
    enum: ["send", "receive"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    default: "",
    set: (v) => (v ? encrypt(v) : ""),
    get: (v) => (v ? decrypt(v) : ""),
  },
  notes: {
    type: String,
    default: "",
    set: (v) => (v ? encrypt(v) : ""),
    get: (v) => (v ? decrypt(v) : ""),
  },
  category: {
    type: String,
    enum: ["Lunch", "Travel", "Lend", "Movie", "Shopping", "Other"],
    default: "Other"
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

export default mongoose.model("RoughNoteEntry", RoughNoteEntrySchema);
