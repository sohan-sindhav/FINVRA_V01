import IPOManager from "../models/IPOManager.models.js";
import User from "../models/user.models.js";

export const createIPO = async (req, res) => {
  try {
    const { companyname, opendate, closedate, priceband, lot } = req.body;
    const userId = req.user._id;

    // minimum_retail_price is auto-calculated by the pre-save hook
    const ipo = new IPOManager({
      userId,
      companyname,
      opendate,
      closedate,
      priceband,
      lot,
      minimum_retail_price: lot * priceband.max, // set explicitly since hook runs after model() not create()
    });
    await ipo.save();

    // Auto-share with partners
    const user = await User.findById(userId).populate("partners");
    if (user && user.partners && user.partners.length > 0) {
      for (const partner of user.partners) {
        // Check if IPO with same companyname already exists for partner
        const existingIPO = await IPOManager.findOne({ userId: partner._id, companyname });
        if (!existingIPO) {
          const partnerIpo = new IPOManager({
            userId: partner._id,
            companyname,
            opendate,
            closedate,
            priceband,
            lot,
            minimum_retail_price: lot * priceband.max,
          });
          await partnerIpo.save();
        }
      }
    }

    res.status(201).json({ success: true, ipo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllIPO = async (req, res) => {
  try {
    const ipos = await IPOManager.find({ userId: req.user._id }).sort({ opendate: -1 });
    res.status(200).json(ipos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getIPOById = async (req, res) => {
  try {
    const ipo = await IPOManager.findOne({ _id: req.params.id, userId: req.user._id });
    if (!ipo) return res.status(404).json({ message: "IPO not found" });
    res.status(200).json(ipo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateIPO = async (req, res) => {
  try {
    const ipo = await IPOManager.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!ipo) return res.status(404).json({ message: "IPO not found" });
    res.status(200).json(ipo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteIPO = async (req, res) => {
  try {
    const ipo = await IPOManager.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!ipo) return res.status(404).json({ message: "IPO not found" });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};