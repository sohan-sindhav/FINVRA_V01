import mongoose from "mongoose";
import indianBanksEnum from "./indianBanksEnum.js";
import { encrypt, decrypt } from "../utils/encryption.js";

const BankAccSchema = new mongoose.Schema({
  nickname: { required: true, type: String },
  bank: { enum: indianBanksEnum, type: String, required: true },
  accnumber: { 
    type: String,
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
    default: 0,
  },
  // true  → zero-balance account (floor = 0)
  // false → account has a minimum balance requirement
  isZeroBalance: {
    type: Boolean,
    default: true,
  },
  // Effective floor. Ignored when isZeroBalance is true (floor is 0).
  minimumBalance: {
    type: Number,
    default: 0,
  },
  blockedBalance: {
    type: Number,
    default: 0,
  },
  // Timestamp of the first day balance dropped below minimumBalance
  // and has stayed there continuously. Cleared to null when balance recovers.
  minBalanceBreachSince: {
    type: Date,
    default: null,
  },
}, {
  toJSON: { getters: true },
  toObject: { getters: true }
});

const BankAcc = mongoose.model("BankAcc", BankAccSchema);

export default BankAcc;
