import mongoose from "mongoose";

const bankHistorySchema = new mongoose.Schema({
   from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BankAcc",
    validate: {
      validator: function (value) {
       
        if (this.transactionType === "transfer") {
          return value != null;
        }
        return true;
      },
      message: "'from' is required for transfer transactions",
    },
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BankAcc",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  reversed: {
    type: Boolean,
    default: false,
  },
  transactionType: {
    type: String,
    enum: ["transfer", "self_update", "cash_deposit"],
    required: true,
    default: "transfer",
  },
});

const BankHistory = mongoose.model("BankHistory", bankHistorySchema);

export default BankHistory;
