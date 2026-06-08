import IPOApplication from "../models/IPOApplication.models.js";
import BankAcc from "../models/bankAcc.models.js";
import PanCard from "../models/panCard.models.js";
import IPOManager from "../models/IPOManager.models.js";
import mongoose from "mongoose";

export const applyIPO = async (req, res) => {
  const { ipoId, applications } = req.body; // applications: [{ panId, bankAccId }]
  const userId = req.user._id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ipo = await IPOManager.findById(ipoId);
    if (!ipo) {
      throw new Error("IPO not found");
    }

    const amountPerApplication = ipo.minimum_retail_price;
    const results = [];

    for (const app of applications) {
      const { panId, bankAccId, fundingMethod = "", loggedInDevice = "" } = app;

      // 1. Check Bank Balance
      const bank = await BankAcc.findOne({ _id: bankAccId, userId }).session(session);
      if (!bank) throw new Error(`Bank account not found: ${bankAccId}`);
      if (bank.balance < amountPerApplication) {
        throw new Error(`Insufficient funds in ${bank.nickname}. Required: ₹${amountPerApplication}`);
      }

      // 2. Check if already applied with this PAN for this IPO
      const existingApp = await IPOApplication.findOne({ ipo: ipoId, pan: panId }).session(session);
      if (existingApp) {
        const pan = await PanCard.findById(panId).session(session);
        throw new Error(`Already applied for this IPO using PAN: ${pan.panNumber}`);
      }

      // 3. Update Bank Balance (Block Money)
      bank.balance -= amountPerApplication;
      bank.blockedBalance += amountPerApplication;
      await bank.save({ session });

      // 4. Update PAN last used bank, last funding method, and device
      const panUpdate = { lastUsedBankAcc: bankAccId };
      if (fundingMethod) panUpdate.lastFundingMethod = fundingMethod;
      if (loggedInDevice) panUpdate.loggedInDevice = loggedInDevice;
      const updatedPan = await PanCard.findByIdAndUpdate(panId, panUpdate, { session, new: true });

      let mySharePct = 25, holderSharePct = 25, funderSharePct = 50;
      if (updatedPan && updatedPan.isMyAccount) {
        mySharePct = 50;
        holderSharePct = 0;
        funderSharePct = 50;
      }

      // 5. Create Application record
      const newApp = new IPOApplication({
        user: userId,
        ipo: ipoId,
        pan: panId,
        bankAcc: bankAccId,
        amount: amountPerApplication,
        status: "Pending",
        fundingMethod,
        mySharePct,
        holderSharePct,
        funderSharePct,
      });
      await newApp.save({ session });
      
      results.push(newApp);
    }

    await session.commitTransaction();
    res.status(201).json({ success: true, message: `Successfully applied for ${results.length} accounts`, applications: results });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

export const getUserApplications = async (req, res) => {
  try {
    const apps = await IPOApplication.find({ user: req.user._id })
      .populate("ipo")
      .populate("pan")
      .populate("bankAcc")
      .sort({ createdAt: -1 });
    res.status(200).json(apps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelApplication = async (req, res) => {
  const { appId } = req.params;
  const userId = req.user._id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const app = await IPOApplication.findOne({ _id: appId, user: userId }).session(session);
    if (!app) throw new Error("Application not found");

    // 1. Restore Bank Balance
    const bank = await BankAcc.findById(app.bankAcc).session(session);
    if (bank) {
      bank.balance += app.amount;
      bank.blockedBalance -= app.amount;
      await bank.save({ session });
    }

    // 2. Delete Application
    await IPOApplication.deleteOne({ _id: appId }).session(session);

    await session.commitTransaction();
    res.status(200).json({ success: true, message: "Application cancelled and funds restored" });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};
export const updateApplicationStatus = async (req, res) => {
  const { appId } = req.params;
  const { status, isGMPSold, gmpType, gmpPrice, mySharePct, holderSharePct, funderSharePct } = req.body;
  const userId = req.user._id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const app = await IPOApplication.findOne({ _id: appId, user: userId }).session(session);
    if (!app) throw new Error("Application not found");

    const ipo = await IPOManager.findById(app.ipo).session(session);
    const lotSize = ipo ? ipo.lot : 1;

    // Update fields if provided
    if (isGMPSold !== undefined) app.isGMPSold = isGMPSold;
    if (gmpType !== undefined) app.gmpType = gmpType;
    if (gmpPrice !== undefined) app.gmpPrice = gmpPrice;
    if (mySharePct !== undefined) app.mySharePct = mySharePct;
    if (holderSharePct !== undefined) app.holderSharePct = holderSharePct;
    if (funderSharePct !== undefined) app.funderSharePct = funderSharePct;

    // Handle bank unblocking/blocking on Refunded status transition
    if (status !== undefined && app.status !== status) {
      if (status === "Refunded" && app.status !== "Refunded") {
        // Going to Refunded -> Unblock funds
        const bank = await BankAcc.findById(app.bankAcc).session(session);
        if (bank) {
          bank.balance += app.amount;
          bank.blockedBalance -= app.amount;
          await bank.save({ session });
        }
      } else if (app.status === "Refunded" && status !== "Refunded") {
        // Leaving Refunded -> Re-block funds
        const bank = await BankAcc.findById(app.bankAcc).session(session);
        if (bank) {
          // ensure not going negative theoretically, but we just re-block
          bank.balance -= app.amount;
          bank.blockedBalance += app.amount;
          await bank.save({ session });
        }
      }
      app.status = status;
    }

    // PROFIT CALCULATION LOGIC
    let calculatedProfit = 0;
    if (app.isGMPSold) {
      if (app.gmpType === "Allotted/Not Allotted") {
        // Method 1: Profit is the GMP price per share * lot size regardless of allotment
        calculatedProfit = (app.gmpPrice || 0) * lotSize;
      } else if (app.gmpType === "Just Allotted") {
        // Method 2: Profit only counts if status is Allotted
        if (app.status === "Allotted") {
          calculatedProfit = (app.gmpPrice || 0) * lotSize;
        } else {
          calculatedProfit = 0;
        }
      }
    } else {
      calculatedProfit = 0;
    }

    app.profit = calculatedProfit;
    app.myProfit = (calculatedProfit * (app.mySharePct / 100)) || 0;
    app.holderProfit = (calculatedProfit * (app.holderSharePct / 100)) || 0;
    app.funderProfit = (calculatedProfit * (app.funderSharePct / 100)) || 0;

    await app.save({ session });
    await session.commitTransaction();

    res.status(200).json({ success: true, application: app });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};
