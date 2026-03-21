import mongoose from "mongoose";

const ipoManagerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  companyname: { type: String, required: true },
  opendate:    { type: Date,   required: true },
  closedate:   { type: Date,   required: true },
  priceband: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  lot:                  { type: Number, required: true },
  minimum_retail_price: { type: Number, required: true },
}, { timestamps: true });

const IPOManager = mongoose.model("IPOManager", ipoManagerSchema);

export default IPOManager;