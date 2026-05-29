import transactions from "../models/transaction.models.js";
import TransactionShare from "../models/transactionShare.models.js";
import User from "../models/user.models.js";

// ─── Send a share request ──────────────────────────────────────────────────
export const sendShareRequest = async (req, res) => {
  try {
    const fromUser = req.user._id;
    const { recipientEmail, transactionIds } = req.body;

    if (!recipientEmail || !transactionIds?.length) {
      return res.status(400).json({ message: "Recipient email and at least one transaction are required." });
    }

    // Look up recipient
    const recipient = await User.findOne({ email: recipientEmail.toLowerCase().trim() });
    if (!recipient) {
      return res.status(404).json({ message: "No Finvra account found with that email." });
    }

    // Cannot share with yourself
    if (recipient._id.equals(fromUser)) {
      return res.status(400).json({ message: "You cannot share transactions with yourself." });
    }

    // Verify the sender owns all requested transactions
    const ownedTransactions = await transactions.find({ _id: { $in: transactionIds }, userId: fromUser });
    if (ownedTransactions.length !== transactionIds.length) {
      return res.status(403).json({ message: "One or more transactions do not belong to you." });
    }

    // Prevent duplicate active request (pending or accepted)
    const existing = await TransactionShare.findOne({
      fromUser,
      toUser: recipient._id,
      status: { $in: ["pending", "accepted"] },
    });
    
    if (existing) {
      // If there's an existing accepted share, maybe we should just append the new transactions?
      // Let's keep it simple and follow the PanShare pattern: block it if one exists.
      return res.status(409).json({
        message: existing.status === "pending"
          ? "A pending share request already exists for this recipient."
          : "You are already sharing transactions with this user. Revoke first to re-share.",
      });
    }

    const share = new TransactionShare({
      fromUser,
      toUser: recipient._id,
      transactions: transactionIds,
    });
    await share.save();

    return res.status(201).json({ success: true, message: `Share request sent to ${recipient.name}.` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ─── Get incoming pending requests (for notification bell) ─────────────────
export const getIncomingRequests = async (req, res) => {
  try {
    const toUser = req.user._id;
    const requests = await TransactionShare.find({ toUser, status: "pending" })
      .populate("fromUser", "name email")
      .populate({ 
        path: "transactions", 
        select: "amount from to", 
        populate: [
          { path: "from", select: "name" },
          { path: "to", select: "nickname" }
        ]
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ─── Accept or decline a request ──────────────────────────────────────────
export const respondToRequest = async (req, res) => {
  try {
    const toUser = req.user._id;
    const { id } = req.params;
    const { action } = req.body; // 'accept' | 'decline'

    if (!["accept", "decline"].includes(action)) {
      return res.status(400).json({ message: "Action must be 'accept' or 'decline'." });
    }

    const share = await TransactionShare.findOne({ _id: id, toUser, status: "pending" });
    if (!share) {
      return res.status(404).json({ message: "Share request not found or already handled." });
    }

    share.status = action === "accept" ? "accepted" : "declined";
    await share.save();

    return res.status(200).json({
      success: true,
      message: action === "accept" ? "Share accepted. Transactions are now visible." : "Share request declined.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ─── Get transactions shared with me (accepted only) ──────────────────────
export const getSharedWithMe = async (req, res) => {
  try {
    const toUser = req.user._id;
    const shares = await TransactionShare.find({ toUser, status: "accepted" })
      .populate("fromUser", "name email")
      .populate({ 
        path: "transactions", 
        select: "amount from to reversed userId", 
        populate: [
          { path: "from", select: "name" },
          { path: "to", select: "nickname" }
        ]
      })
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, shares });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ─── Get my outgoing shares (to manage/revoke) ────────────────────────────
export const getMyOutgoingShares = async (req, res) => {
  try {
    const fromUser = req.user._id;
    const shares = await TransactionShare.find({ fromUser, status: { $in: ["pending", "accepted"] } })
      .populate("toUser", "name email")
      .populate({ 
        path: "transactions", 
        select: "amount from to",
        populate: [
          { path: "from", select: "name" },
          { path: "to", select: "nickname" }
        ]
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, shares });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ─── Revoke a share (sender cancels an accepted/pending share) ────────────
export const revokeShare = async (req, res) => {
  try {
    const fromUser = req.user._id;
    const { id } = req.params;

    const share = await TransactionShare.findOne({ _id: id, fromUser, status: { $in: ["pending", "accepted"] } });
    if (!share) {
      return res.status(404).json({ message: "Share not found or already revoked." });
    }

    share.status = "revoked";
    await share.save();

    return res.status(200).json({ success: true, message: "Share revoked successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
