import transactions from "../models/transaction.models.js";

export const createTransactions = async (req, res) => {
  try {
    const { from, to, amount } = req.body;
    const userId = req.user._id;

    const transaction = new transactions({
      from,
      to,
      amount,
      userId,
    });
    await transaction.save();
    return res
      .status(201)
      .json({ message: "transaction created", success: true });
  } catch (error) {
    console.log(error);
    return res
      .status(501)
      .json({ message: "Internal server error", success: false });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;

    const userTransactions = await transactions
      .find({ userId })
      .populate("from", "name")
      .populate("to", "nickname");

    return res.status(200).json({ userTransactions });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};

export const deleteTransactions = async (req, res) => {
  try {
    const { transactionid } = req.params;

    const deletedTransaction =
      await transactions.findByIdAndDelete(transactionid);

    if (!deletedTransaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    return res.status(200).json({
      message: "Transaction deleted successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error deleting transaction",
      success: false,
    });
  }
};

export const tickReverseTransaction = async (req, res) => {
  try {
    const { transactionid } = req.params; // must match route :transactionid

    const reverseTransaction = await transactions.findByIdAndUpdate(
      transactionid, // was transactionId (undefined)
      { reversed: true },
      { new: true }, // add this
    );

    if (!reverseTransaction) {
      return res.status(404).json({
        message: "Transaction not found",
        success: false,
      });
    }

    return res
      .status(200)
      .json({ message: "Transaction Reversed", success: true });
  } catch (error) {
    console.log(error); // check terminal for real error
    return res.status(500).json({
      message: "Internal server error in reversing transaction",
    });
  }
};
