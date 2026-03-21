import Connection from "../models/connection.models.js";
import User from "../models/user.models.js";
import jwt from "jsonwebtoken";

export const createConnection = async (req, res) => {
  const { name } = req.body;
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({ message: "cannot get user id" });
    }
    const newConnection = new Connection({
      name,
      userId: req.user._id,
    });
    await newConnection.save();
    return res.status(201).json({
      message: "Connection created successfully",
      connection: newConnection,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error. contact admin.",
      error: error.message,
    });
  }
};

export const getConnections = async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    return res.status(401).json({ message: "cannot get user id" });
  }
  try {
    const connections = await Connection.find({ userId });
    return res.status(200).json({ connections });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error. contact admin.",
      error: error.message,
    });
  }
};

export const deleteConnection = async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await Connection.findByIdAndDelete(id);
    return res.status(200).json({ message: "Connection deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error. contact admin.",
      error: error.message,
    });
  }
};

export const editConnection = async (req, res) => {
  const { id } = req.params;
  const { name, number } = req.body;
  try {
    const connection = await Connection.findByIdAndUpdate(id, { name });
    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }
    res.status(200).json({
      message: "Connection updated successfully",
      connection,
    });
  } catch (error) {
    console.error("Error updating connection:", error);
    res.status(500).json({
      message: "Failed to update connection",
      error: error.message,
    });
  }
};
