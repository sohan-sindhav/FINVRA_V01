import mongoose from "mongoose";
import { encrypt, decrypt } from "../utils/encryption.js";

const panCardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  panNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    set: (v) => (v ? encrypt(v) : ""),
    get: (v) => (v ? decrypt(v) : ""),
    // match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Please fill a valid PAN number"], 
    // NOTE: Regex match won't work on encrypted strings in DB.
  },
  nameOnPan: {
    type: String,
    required: true,
    trim: true,
    set: (v) => (v ? encrypt(v) : ""),
    get: (v) => (v ? decrypt(v) : ""),
  },
  lastUsedBankAcc: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BankAcc",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  toJSON: { getters: true },
  toObject: { getters: true }
});

const PanCard = mongoose.model("PanCard", panCardSchema);
export default PanCard;
