import User from "../models/user.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authenticator } from "@otplib/preset-default";
import qrcode from "qrcode";
import LoginHistory from "../models/loginHistory.models.js";

const parseUserAgent = (uaString) => {
  let os = "Unknown OS";
  let browser = "Unknown Browser";
  let deviceType = "Desktop";

  if (!uaString) return { os, browser, deviceType };

  if (/Mobile|Android|iP(hone|od|ad)/i.test(uaString)) deviceType = "Mobile";
  if (/Tablet|iPad/i.test(uaString)) deviceType = "Tablet";

  if (/Windows/i.test(uaString)) os = "Windows";
  else if (/Mac/i.test(uaString)) os = "MacOS";
  else if (/Linux/i.test(uaString)) os = "Linux";
  else if (/Android/i.test(uaString)) os = "Android";
  else if (/iOS|iPhone|iPad|iPod/i.test(uaString)) os = "iOS";

  if (/Edg/i.test(uaString)) browser = "Edge";
  else if (/Chrome/i.test(uaString)) browser = "Chrome";
  else if (/Safari/i.test(uaString)) browser = "Safari";
  else if (/Firefox/i.test(uaString)) browser = "Firefox";
  
  return { os, browser, deviceType };
};

const recordLogin = async (req, userId, status) => {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "Unknown IP";
    const userAgent = req.headers['user-agent'] || "Unknown";
    const { os, browser, deviceType } = parseUserAgent(userAgent);

    await LoginHistory.create({
      user: userId,
      ipAddress,
      userAgent,
      deviceType,
      os,
      browser,
      status
    });
  } catch (error) {
    console.error("Failed to record login history", error);
  }
};

const updateOrRecordLogin = async (req, userId, oldStatus, newStatus) => {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "Unknown IP";
    const userAgent = req.headers['user-agent'] || "Unknown";

    const updated = await LoginHistory.findOneAndUpdate(
      { user: userId, status: oldStatus, ipAddress, userAgent },
      { status: newStatus },
      { sort: { createdAt: -1 } }
    );

    if (!updated) {
      await recordLogin(req, userId, newStatus);
    }
  } catch (error) {
    console.error("Failed to update login history", error);
  }
};

const handleFailedLogin = async (user) => {
  user.failedLoginAttempts += 1;
  if (user.failedLoginAttempts >= 5) {
    user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
  }
  await user.save();
};

const resetLoginAttempts = async (user) => {
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  await user.save();
};

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    return res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error. contact admin.",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(403).json({ 
        message: `Account is temporarily locked. Try again in ${remainingTime} minutes.` 
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      await recordLogin(req, user._id, "Failed");
      await handleFailedLogin(user);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.isTwoFactorEnabled) {
      await recordLogin(req, user._id, "2FA Pending");
      return res.status(200).json({
        message: "2FA required",
        twoFactorRequired: true,
        userId: user._id,
      });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
   res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: 30 * 24 * 60 * 60 * 1000,
});
    
    await recordLogin(req, user._id, "Success");
    await resetLoginAttempts(user);

    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        enabledModules: user.enabledModules,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error. contact admin.",
      error: error.message,
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error. contact admin.",
      error: error.message,
    });
  }
};

export const setup2FA = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isTwoFactorEnabled) {
      return res.status(400).json({ message: "2FA is already enabled" });
    }

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, "Finvra", secret);
    const qrCode = await qrcode.toDataURL(otpauth);

    user.twoFactorSecret = secret;
    await user.save();

    res.json({ qrCode, secret });
  } catch (error) {
    res.status(500).json({ message: "Error setting up 2FA", error: error.message });
  }
};

export const verify2FA = async (req, res) => {
  const { token, userId } = req.body;
  try {
    const activeUserId = userId || req.user?._id || req.user?.id;
    const user = await User.findById(activeUserId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(403).json({ 
        message: `Account is temporarily locked. Try again in ${remainingTime} minutes.` 
      });
    }

    const isValid = authenticator.check(token, user.twoFactorSecret);
    if (!isValid) {
      await updateOrRecordLogin(req, user._id, "2FA Pending", "Failed");
      await handleFailedLogin(user);
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.isTwoFactorEnabled) {
      user.isTwoFactorEnabled = true;
    }

    const jwtToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    await updateOrRecordLogin(req, user._id, "2FA Pending", "Success");
    await resetLoginAttempts(user);

    res.json({
      message: "2FA verified successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
        enabledModules: user.enabledModules,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error verifying 2FA", error: error.message });
  }
};

export const disable2FA = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = "";
    await user.save();
    res.json({ message: "2FA disabled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error disabling 2FA", error: error.message });
  }
};

export const getLoginHistory = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const history = await LoginHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching login history", error: error.message });
  }
};

export const updateEnabledModules = async (req, res) => {
  try {
    const { enabledModules } = req.body;
    const userId = req.user?._id || req.user?.id;
    
    if (!Array.isArray(enabledModules)) {
      return res.status(400).json({ message: "Invalid modules format" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.enabledModules = enabledModules;
    await user.save();

    res.json({ 
      message: "Modules updated successfully", 
      enabledModules: user.enabledModules 
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating modules", error: error.message });
  }
};

// Admin Controllers
export const getAllSystemLogs = async (req, res) => {
  try {
    const logs = await LoginHistory.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching system logs", error: error.message });
  }
};
