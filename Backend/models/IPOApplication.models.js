import mongoose from "mongoose";

const ipoApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ipo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "IPOManager",
    required: true,
  },
  pan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PanCard",
    required: true,
  },
  bankAcc: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BankAcc",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Applied", "Not Applied", "Allotted", "Blocked", "Refunded"],
    default: "Pending",
  },
  isGMPSold: {
    type: Boolean,
    default: false,
  },
  gmpType: {
    type: String,
    enum: ["Allotted/Not Allotted", "Just Allotted"],
    default: "Allotted/Not Allotted",
  },
  gmpPrice: {
    type: Number,
    default: 0,
  },
  profit: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const IPOApplication = mongoose.model("IPOApplication", ipoApplicationSchema);
export default IPOApplication;
