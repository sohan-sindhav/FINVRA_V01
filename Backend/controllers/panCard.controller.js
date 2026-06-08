import PanCard from "../models/panCard.models.js";

export const addPanCard = async (req, res) => {
  const { panNumber, nameOnPan, isMyAccount } = req.body;
  const userId = req.user._id;

  try {
    const existingPan = await PanCard.findOne({ panNumber: panNumber.toUpperCase() });
    if (existingPan) {
      return res.status(400).json({ message: "PAN Card already exists" });
    }

    const newPan = new PanCard({
      user: userId,
      panNumber: panNumber.toUpperCase(),
      nameOnPan,
      isMyAccount: isMyAccount || false,
    });

    await newPan.save();
    return res.status(201).json({ message: "PAN Card added successfully", panCard: newPan });
  } catch (error) {
    return res.status(500).json({ message: "Failed to add PAN card", error: error.message });
  }
};

export const getPanCards = async (req, res) => {
  const userId = req.user._id;

  try {
    const panCards = await PanCard.find({ user: userId });
    return res.status(200).json({ panCards });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch PAN cards", error: error.message });
  }
};

export const deletePanCard = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const panCard = await PanCard.findOneAndDelete({ _id: id, user: userId });
    if (!panCard) {
      return res.status(404).json({ message: "PAN Card not found or unauthorized" });
    }
    return res.status(200).json({ message: "PAN Card deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete PAN card", error: error.message });
  }
};

export const updatePanCard = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  // Only allow editing these metadata fields — PAN number and name are immutable here
  const { broker, loggedInDevice, lastFundingMethod, nameOnPan, isMyAccount } = req.body;

  try {
    const updates = {};
    if (broker            !== undefined) updates.broker            = broker;
    if (loggedInDevice    !== undefined) updates.loggedInDevice    = loggedInDevice;
    if (lastFundingMethod !== undefined) updates.lastFundingMethod = lastFundingMethod;
    if (nameOnPan         !== undefined) updates.nameOnPan         = nameOnPan;
    if (isMyAccount       !== undefined) updates.isMyAccount       = isMyAccount;

    const panCard = await PanCard.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: updates },
      { new: true }
    );
    if (!panCard) {
      return res.status(404).json({ message: "PAN Card not found or unauthorized" });
    }
    return res.status(200).json({ message: "PAN Card updated", panCard });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update PAN card", error: error.message });
  }
};
