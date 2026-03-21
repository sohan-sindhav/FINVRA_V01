import BankHistory from "../models/Bankhistory.models.js";
import BankAcc from "../models/bankAcc.models.js";

export const createBankHistory = async (req, res) => {
  try {
    const { fromId, toId, amount , transactionType } = req.body;
    const userId = req.user._id;

    const history = new BankHistory({
      from: fromId,
      to: toId,
      amount,
      userId,
      transactionType,
    });
    await history.save();
    return res.status(201).json({ success: true, history });
  } catch (error) {
    console.log("Error creating bank history:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getBankHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const history = await BankHistory.find({ userId })
      .populate("from", "nickname bank")
      .populate("to", "nickname bank")
      .sort({ date: -1 }); // latest first

    return res.status(200).json({ success: true, history });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

// Reverse a bank history entry — send the money back from `to` → `from`
export const reverseBankHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const entry = await BankHistory.findOne({ _id: id, userId });
    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }
    if (entry.reversed) {
      return res.status(400).json({ message: "Already reversed" });
    }

    // Debit the `to` account (it received money originally)
    await BankAcc.findByIdAndUpdate(entry.to, {
      $inc: { balance: -entry.amount },
    });

    // Credit back the `from` account
    await BankAcc.findByIdAndUpdate(entry.from, {
      $inc: { balance: entry.amount },
    });

    // Mark as reversed
    entry.reversed = true;
    await entry.save();

    return res.status(200).json({ success: true, message: "Entry reversed" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};
