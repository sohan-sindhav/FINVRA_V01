import mongoose from "mongoose";

const loginHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    deviceType: {
      type: String,
      default: "Unknown",
    },
    os: {
      type: String,
      default: "Unknown",
    },
    browser: {
      type: String,
      default: "Unknown",
    },
    status: {
      type: String,
      enum: ["Success", "Failed", "2FA Pending"],
      default: "Success",
    },
  },
  { timestamps: true }
);

const LoginHistory = mongoose.model("LoginHistory", loginHistorySchema);
export default LoginHistory;
