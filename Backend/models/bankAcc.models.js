import mongoose from "mongoose";
import indianBanksEnum from "./indianBanksEnum.js";
import { encrypt, decrypt } from "../utils/encryption.js";

const BankAccSchema = new mongoose.Schema({
  nickname: { required: true, type: String },
  bank: { enum: indianBanksEnum, type: String, required: true },
  accnumber: { 
    type: String, // Changed from Number to String for encryption
    set: (v) => (v ? encrypt(v.toString()) : ""),
    get: (v) => (v ? decrypt(v) : ""),
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  balance: {
    type: Number,
  },
  blockedBalance: {
    type: Number,
    default: 0,
  },
}, {
  toJSON: { getters: true },
  toObject: { getters: true }
});

const BankAcc = mongoose.model("BankAcc", BankAccSchema);

export default BankAcc;
