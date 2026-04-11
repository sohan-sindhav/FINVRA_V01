import BankAcc from "../models/bankAcc.models.js";

// Helper: compute the effective minimum balance floor for an account
const getFloor = (account) =>
  account.isZeroBalance ? 0 : (account.minimumBalance || 0);

// Helper: update minBalanceBreachSince on accounts lazily (called on every GET)
// Only writes to DB when the breach state actually changes (edge transitions).
const syncBreachStatus = async (accounts) => {
  const now = new Date();
  const updates = [];

  for (const acc of accounts) {
    if (acc.isZeroBalance) continue; // zero-balance accounts don't have a floor rule

    const isBelowMin = acc.balance < (acc.minimumBalance || 0);

    if (isBelowMin && acc.minBalanceBreachSince == null) {
      // Just crossed below — stamp today
      updates.push(
        BankAcc.findByIdAndUpdate(acc._id, { minBalanceBreachSince: now })
      );
    } else if (!isBelowMin && acc.minBalanceBreachSince != null) {
      // Recovered — clear the breach date
      updates.push(
        BankAcc.findByIdAndUpdate(acc._id, { minBalanceBreachSince: null })
      );
    }
  }

  if (updates.length > 0) await Promise.all(updates);
};

export const createBankAcc = async (req, res) => {
  const { nickname, bank, accnumber, balance, isZeroBalance, minimumBalance } = req.body;
  const userId = req.user._id;

  const isExist = await BankAcc.findOne({ nickname, userId });

  if (isExist) {
    return res
      .status(409)
      .json({ message: "bank account with nickname exist." });
  } else {
    try {
      const zeroBalance = isZeroBalance !== false; // default true
      const minBal = zeroBalance ? 0 : (Number(minimumBalance) || 0);

      const bankacc = new BankAcc({
        nickname,
        bank,
        accnumber,
        userId,
        balance: Number(balance) || 0,
        isZeroBalance: zeroBalance,
        minimumBalance: minBal,
      });
      await bankacc.save();
      return res
        .status(201)
        .json({ success: true, message: "Bank account created." });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: "Internal server error. contact admin" });
    }
  }
};

export const getBankAcc = async (req, res) => {
  try {
    const accounts = await BankAcc.find({ userId: req.user._id });

    // Lazily sync breach timestamps — only writes on state-change edge cases
    await syncBreachStatus(accounts);

    // Re-fetch so the response reflects any just-updated breach fields
    const bankacc = await BankAcc.find({ userId: req.user._id });
    return res.status(200).json({ success: true, bankacc });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error. contact admin" });
  }
};

export const updateBankAcc = async (req, res) => {
  try {
    const bankacc = await BankAcc.findOne({
      nickname: req.body.nickname,
      userId: req.user._id,
    });
    if (!bankacc) {
      return res.status(404).json({ message: "Bank account not found" });
    }
    bankacc.nickname = req.body.nickname;
    bankacc.bank = req.body.bank;
    bankacc.accnumber = req.body.accnumber;
    await bankacc.save();
    return res.status(200).json({ success: true, bankacc });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error. contact admin" });
  }
};

export const deleteBankAcc = async (req, res) => {
  try {
    const bankacc = await BankAcc.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!bankacc) {
      return res.status(404).json({ message: "Bank account not found" });
    }

    await bankacc.deleteOne();
    return res.status(200).json({ success: true, bankacc });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error. contact admin" });
  }
};

export const updateBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { balance } = req.body; // positive = add, negative = deduct

    const account = await BankAcc.findById(id);
    if (!account) {
      return res.status(404).json({ message: "Bank account not found" });
    }

    const floor = getFloor(account);
    const newBalance = account.balance + balance;

    // Prevent balance dropping below the minimum floor
    if (newBalance < floor) {
      const floorLabel = floor === 0
        ? "zero"
        : `₹${floor.toLocaleString("en-IN")}`;
      return res.status(400).json({
        message: `Balance cannot go below the minimum balance (${floorLabel}) for "${account.nickname}". Available: ₹${(account.balance - floor).toLocaleString("en-IN")}`,
      });
    }

    const updatedAccount = await BankAcc.findByIdAndUpdate(
      id,
      { $inc: { balance: balance } },
      { new: true },
    );

    return res.status(200).json({ updatedAccount });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const sendMoney = async (req, res) => {
  try {
    const { fromId } = req.params;
    const { toId, amount } = req.body;

    const fromBankAcc = await BankAcc.findById(fromId);

    if (!fromBankAcc) {
      return res.status(404).json({ message: "Source account not found" });
    }

    const floor = getFloor(fromBankAcc);

    if (fromBankAcc.balance - amount < floor) {
      const floorLabel = floor === 0
        ? "zero"
        : `₹${floor.toLocaleString("en-IN")}`;
      return res.status(400).json({
        message: `Not enough balance in "${fromBankAcc.nickname}". Minimum balance must stay at ${floorLabel}. Available to send: ₹${Math.max(0, fromBankAcc.balance - floor).toLocaleString("en-IN")}`,
      });
    }

    // decrease from account
    await BankAcc.findByIdAndUpdate(
      fromId,
      { $inc: { balance: -amount } },
      { new: true },
    );

    // increase to account
    await BankAcc.findByIdAndUpdate(
      toId,
      { $inc: { balance: amount } },
      { new: true },
    );

    return res.status(200).json({ success: true, message: "Money sent" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};
