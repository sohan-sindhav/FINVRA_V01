import mongoose from "mongoose";

const panShareSchema = new mongoose.Schema(
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
    panCards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PanCard",
      },
    ],
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "revoked"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const PanShare = mongoose.model("PanShare", panShareSchema);
export default PanShare;
