import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/DBconnect.js";
dotenv.config();
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import connectionRoutes from "./routes/connections.route.js";
import cookieParser from "cookie-parser";
import BankAccRoutes from "./routes/bankAcc.routes.js";
import transactionsRoutes from "./routes/transactions.routes.js";
import flowchartRoutes from "./routes/flowchart.routes.js";
import ipoRoutes from "./routes/IPO.routes.js";
import panCardRoutes from "./routes/panCard.routes.js";
import ipoApplicationRoutes from "./routes/IPOApplication.routes.js";
import roughNoteRoutes from "./routes/RoughNote.routes.js";

import { globalLimiter } from "./middleware/rateLimiter.js";

const app = express();
app.set("trust proxy", 1)
const PORT = process.env.PORT || 5000;

app.use(globalLimiter);
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

//Making Database connection
connectDB();

//routes
app.use("/api/auth", authRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/bank/account", BankAccRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/flowchart", flowchartRoutes);
app.use("/api/ipo", ipoRoutes);
app.use("/api/pan", panCardRoutes);
app.use("/api/ipo/app", ipoApplicationRoutes);
app.use("/api/rough-notes", roughNoteRoutes);

//Server is running on port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
