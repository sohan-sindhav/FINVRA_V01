import mongoose from "mongoose";

const ipoShareSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ipo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IPOManager",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "revoked"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const IPOShare = mongoose.model("IPOShare", ipoShareSchema);
export default IPOShare;
