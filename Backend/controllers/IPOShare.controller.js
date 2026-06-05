import IPOShare from "../models/ipoShare.models.js";
import IPOApplication from "../models/IPOApplication.models.js";
import User from "../models/user.models.js";

// ─── Send a share request ──────────────────────────────────────────────────
export const sendShareRequest = async (req, res) => {
  try {
    const fromUser = req.user._id;
    const { toUserId, ipoId } = req.body;

    if (!toUserId || !ipoId) {
      return res.status(400).json({ message: "Partner ID and IPO ID are required." });
    }

    const recipient = await User.findById(toUserId);
    if (!recipient) {
      return res.status(404).json({ message: "Partner not found." });
    }

    if (recipient._id.equals(fromUser)) {
      return res.status(400).json({ message: "You cannot share an IPO with yourself." });
    }

    // Prevent duplicate active request
    const existing = await IPOShare.findOne({
      fromUser,
      toUser: recipient._id,
      ipo: ipoId,
      status: { $in: ["pending", "accepted"] },
    });

    if (existing) {
      return res.status(409).json({
        message: existing.status === "pending"
          ? "A pending share request already exists for this IPO with this partner."
          : "You are already sharing this IPO with this partner. Revoke first to re-share.",
      });
    }

    const sender = await User.findById(fromUser);
    const isPartner = sender && sender.partners.includes(recipient._id);

    const share = new IPOShare({
      fromUser,
      toUser: recipient._id,
      ipo: ipoId,
      status: isPartner ? "accepted" : "pending",
    });
    await share.save();

    return res.status(201).json({ 
      success: true, 
      message: isPartner ? `IPO directly shared with ${recipient.name}.` : `IPO share request sent to ${recipient.name}.` 
    });
  } catch (error) {
    console.error("sendShareRequest error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ─── Get incoming pending requests (for notification bell) ─────────────────
export const getIncomingRequests = async (req, res) => {
  try {
    const toUser = req.user._id;
    const requests = await IPOShare.find({ toUser, status: "pending" })
      .populate("fromUser", "name email")
      .populate("ipo", "companyname opendate closedate")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error("getIncomingRequests error:", error);
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

    const share = await IPOShare.findOne({ _id: id, toUser, status: "pending" }).populate("ipo", "companyname");
    if (!share) {
      return res.status(404).json({ message: "Share request not found or already handled." });
    }

    share.status = action === "accept" ? "accepted" : "declined";
    await share.save();

    return res.status(200).json({
      success: true,
      message: action === "accept" 
        ? `Share accepted. IPO ${share.ipo.companyname} is now visible.` 
        : "Share request declined.",
    });
  } catch (error) {
    console.error("respondToRequest error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ─── Get IPOs shared with me (accepted only) ──────────────────────────────
export const getSharedWithMe = async (req, res) => {
  try {
    const toUser = req.user._id;
    const shares = await IPOShare.find({ toUser, status: "accepted" })
      .populate("fromUser", "name email")
      .populate("ipo", "companyname opendate closedate priceband lot minimum_retail_price")
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, shares });
  } catch (error) {
    console.error("getSharedWithMe error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ─── Get My Outgoing Shares ──────────────────────────────
export const getMyOutgoingShares = async (req, res) => {
  try {
    const fromUser = req.user._id;
    const shares = await IPOShare.find({ fromUser, status: { $in: ["pending", "accepted"] } })
      .populate("toUser", "name email")
      .populate("ipo", "companyname")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, shares });
  } catch (error) {
    console.error("getMyOutgoingShares error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ─── Revoke a share ────────────────────────────
export const revokeShare = async (req, res) => {
  try {
    const fromUser = req.user._id;
    const { id } = req.params;

    const share = await IPOShare.findOne({ _id: id, fromUser, status: { $in: ["pending", "accepted"] } });
    if (!share) {
      return res.status(404).json({ message: "Share not found or already revoked." });
    }

    share.status = "revoked";
    await share.save();

    return res.status(200).json({ success: true, message: "Share revoked successfully." });
  } catch (error) {
    console.error("revokeShare error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ─── Get Read-Only Data for a Shared IPO ──────────────────────────────
export const getSharedIPODetails = async (req, res) => {
  try {
    const toUser = req.user._id;
    const { shareId } = req.params;

    const share = await IPOShare.findOne({ _id: shareId, toUser, status: "accepted" }).populate("ipo");
    if (!share) {
      return res.status(404).json({ message: "Shared IPO not found or not accepted." });
    }

    // Fetch applications specifically for this IPO and the fromUser
    const applications = await IPOApplication.find({ 
      user: share.fromUser, 
      ipo: share.ipo._id 
    }).populate("pan", "nameOnPan panNumber");

    // Format the result to only include requested fields
    const formattedData = applications.map(app => ({
      _id: app._id,
      panName: app.pan?.nameOnPan || "Unknown PAN",
      panNumber: app.pan?.panNumber || "N/A",
      status: app.status,
      isGMPSold: app.isGMPSold,
      gmpType: app.gmpType,
      gmpPrice: app.gmpPrice,
      profit: app.profit,
    }));

    return res.status(200).json({
      success: true,
      ipo: share.ipo,
      fromUser: share.fromUser,
      applications: formattedData
    });
  } catch (error) {
    console.error("getSharedIPODetails error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
