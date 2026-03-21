import BankAcc from "../models/bankAcc.models.js";

export const createBankAcc = async (req, res) => {
  const { nickname, bank, accnumber, balance } = req.body;
  const userId = req.user._id;

  const isExist = await BankAcc.findOne({
    nickname,
    userId,
  });

  if (isExist) {
    return res
      .status(409)
      .json({ message: "bank account with nickname exist." });
  } else {
    try {
      const bankacc = new BankAcc({
        nickname,
        bank,
        accnumber,
        userId,
        balance,
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

    // Prevent balance going below zero
    if (account.balance + balance < 0) {
      return res.status(400).json({
        message: `Not enough balance in "${account.nickname}". Available: ₹${account.balance.toLocaleString("en-IN")}`,
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
    const { toId, amount } = req.body; // amount was missing

    const fromBankAcc = await BankAcc.findById(fromId);

    if (!fromBankAcc) {
      return res.status(404).json({ message: "Source account not found" });
    }
    if (fromBankAcc.balance < amount) {
      return res.status(400).json({
        message: `Not enough balance in "${fromBankAcc.nickname}". Available: ₹${fromBankAcc.balance.toLocaleString("en-IN")}`,
      });
    }

    // decrease from account
    await BankAcc.findByIdAndUpdate(
      fromId, // was `id` (undefined)
      { $inc: { balance: -amount } }, // was `-balance` (undefined)
      { new: true },
    );

    // increase to account
    await BankAcc.findByIdAndUpdate(
      toId, // was `id` (undefined)
      { $inc: { balance: amount } }, // was `balance` (undefined)
      { new: true },
    );

    return res.status(200).json({ success: true, message: "Money sent" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};
