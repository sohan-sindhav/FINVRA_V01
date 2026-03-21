import mongoose from "mongoose";
import { encrypt, decrypt } from "../utils/encryption.js";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 32,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  twoFactorSecret: {
    type: String,
    default: "",
    set: (v) => (v ? encrypt(v) : ""),
    get: (v) => (v ? decrypt(v) : ""),
  },
  isTwoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  enabledModules: {
    type: [String],
    default: ["connections", "transactions", "bankacc", "ipo", "pan", "money_diary"],
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
    default: null,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

const User = mongoose.model("User", userSchema);
export default User;
