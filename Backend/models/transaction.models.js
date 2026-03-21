import mongoose from "mongoose";

const transactionsSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Connection",
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BankAcc",
  },
  amount: {
    type: Number,
    required: true,
  },
  reversed: {
    type: Boolean,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const transactions = mongoose.model("transactions", transactionsSchema);

export default transactions;
