import User from "../models/user.models.js";

// Get current partners and incoming requests
export const getPartners = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("partners", "name email")
      .populate("partnerRequests", "name email");
    
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      success: true,
      partners: user.partners,
      partnerRequests: user.partnerRequests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send a partner request via email
export const sendPartnerRequest = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user._id;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const targetUser = await User.findOne({ email });
    if (!targetUser) return res.status(404).json({ message: "User with this email not found" });

    if (targetUser._id.toString() === userId.toString()) {
      return res.status(400).json({ message: "You cannot send a request to yourself" });
    }

    // Check if already partners
    if (targetUser.partners.includes(userId)) {
      return res.status(400).json({ message: "You are already partners" });
    }

    // Check if request already sent
    if (targetUser.partnerRequests.includes(userId)) {
      return res.status(400).json({ message: "Request already sent" });
    }

    targetUser.partnerRequests.push(userId);
    await targetUser.save();

    res.status(200).json({ success: true, message: "Partner request sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept an incoming partner request
export const acceptPartnerRequest = async (req, res) => {
  try {
    const { partnerId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const partner = await User.findById(partnerId);

    if (!user || !partner) {
      return res.status(404).json({ message: "User or partner not found" });
    }

    // Check if request exists
    if (!user.partnerRequests.includes(partnerId)) {
      return res.status(400).json({ message: "No pending request from this user" });
    }

    // Remove from requests
    user.partnerRequests = user.partnerRequests.filter(id => id.toString() !== partnerId);
    
    // Add to partners
    if (!user.partners.includes(partnerId)) user.partners.push(partnerId);
    if (!partner.partners.includes(userId)) partner.partners.push(userId);

    await user.save();
    await partner.save();

    res.status(200).json({ success: true, message: "Partner request accepted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject an incoming partner request
export const rejectPartnerRequest = async (req, res) => {
  try {
    const { partnerId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove from requests
    user.partnerRequests = user.partnerRequests.filter(id => id.toString() !== partnerId);
    await user.save();

    res.status(200).json({ success: true, message: "Partner request rejected" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
