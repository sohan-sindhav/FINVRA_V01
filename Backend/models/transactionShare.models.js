import mongoose from "mongoose";

const transactionShareSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "transactions",
    required: true,
  }],
  status: {
    type: String,
    enum: ["pending", "accepted", "declined", "revoked"],
    default: "pending",
  },
}, { timestamps: true });

const TransactionShare = mongoose.model("TransactionShare", transactionShareSchema);

export default TransactionShare;
