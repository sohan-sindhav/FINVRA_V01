import PanCard from "../models/panCard.models.js";
import PanShare from "../models/panShare.models.js";
import User from "../models/user.models.js";

// ─── Send a share request ──────────────────────────────────────────────────
export const sendShareRequest = async (req, res) => {
  try {
    const fromUser = req.user._id;
    const { recipientEmail, panCardIds } = req.body;

    if (!recipientEmail || !panCardIds?.length) {
      return res.status(400).json({ message: "Recipient email and at least one PAN card are required." });
    }

    // Look up recipient
    const recipient = await User.findOne({ email: recipientEmail.toLowerCase().trim() });
    if (!recipient) {
      return res.status(404).json({ message: "No Finvra account found with that email." });
    }

    // Cannot share with yourself
    if (recipient._id.equals(fromUser)) {
      return res.status(400).json({ message: "You cannot share PAN cards with yourself." });
    }

    // Verify the sender owns all requested PAN cards
    const ownedPans = await PanCard.find({ _id: { $in: panCardIds }, user: fromUser });
    if (ownedPans.length !== panCardIds.length) {
      return res.status(403).json({ message: "One or more PAN cards do not belong to you." });
    }

    // Prevent duplicate active request (pending or accepted)
    const existing = await PanShare.findOne({
      fromUser,
      toUser: recipient._id,
      status: { $in: ["pending", "accepted"] },
    });
    if (existing) {
      return res.status(409).json({
        message: existing.status === "pending"
          ? "A pending share request already exists for this recipient."
          : "You are already sharing PANs with this user. Revoke first to re-share.",
      });
    }

    const share = new PanShare({
      fromUser,
      toUser: recipient._id,
      panCards: panCardIds,
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
    const requests = await PanShare.find({ toUser, status: "pending" })
      .populate("fromUser", "name email")
      .populate({ path: "panCards", select: "panNumber nameOnPan" })
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

    const share = await PanShare.findOne({ _id: id, toUser, status: "pending" });
    if (!share) {
      return res.status(404).json({ message: "Share request not found or already handled." });
    }

    share.status = action === "accept" ? "accepted" : "declined";
    await share.save();

    return res.status(200).json({
      success: true,
      message: action === "accept" ? "Share accepted. PANs are now visible under Shared PANs." : "Share request declined.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ─── Get PANs shared with me (accepted only) ──────────────────────────────
export const getSharedWithMe = async (req, res) => {
  try {
    const toUser = req.user._id;
    const shares = await PanShare.find({ toUser, status: "accepted" })
      .populate("fromUser", "name email")
      .populate({ path: "panCards", select: "panNumber nameOnPan createdAt" })
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
    const shares = await PanShare.find({ fromUser, status: { $in: ["pending", "accepted"] } })
      .populate("toUser", "name email")
      .populate({ path: "panCards", select: "panNumber nameOnPan" })
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

    const share = await PanShare.findOne({ _id: id, fromUser, status: { $in: ["pending", "accepted"] } });
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
