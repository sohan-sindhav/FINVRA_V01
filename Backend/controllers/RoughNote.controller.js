import RoughNotePerson from "../models/RoughNotePerson.models.js";
import RoughNoteEntry from "../models/RoughNoteEntry.models.js";
import mongoose from "mongoose";

export const addPerson = async (req, res) => {
  try {
    const { name } = req.body;
    const person = await RoughNotePerson.create({ name, user: req.user._id });
    res.status(201).json(person);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPersons = async (req, res) => {
  try {
    const persons = await RoughNotePerson.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.status(200).json(persons);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePersonNotes = async (req, res) => {
  try {
    const { personId } = req.params;
    const { notes } = req.body;
    const person = await RoughNotePerson.findByIdAndUpdate(personId, { notes }, { new: true });
    res.status(200).json(person);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const addEntry = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { personId, type, amount, description, notes, date, category } = req.body;
    
    const entry = await RoughNoteEntry.create([{
      personId,
      type,
      amount,
      description,
      notes,
      category: category || "Other",
      date: date || Date.now()
    }], { session });

    const adjustment = type === "send" ? amount : -amount;
    await RoughNotePerson.findByIdAndUpdate(
      personId,
      { $inc: { balance: adjustment } },
      { session }
    );

    await session.commitTransaction();
    res.status(201).json(entry[0]);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

export const deleteEntry = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { entryId } = req.params;
    const entry = await RoughNoteEntry.findById(entryId);
    if (!entry) throw new Error("Entry not found");

    const adjustment = entry.type === "send" ? -entry.amount : entry.amount;
    await RoughNotePerson.findByIdAndUpdate(
      entry.personId,
      { $inc: { balance: adjustment } },
      { session }
    );

    await RoughNoteEntry.findByIdAndDelete(entryId, { session });

    await session.commitTransaction();
    res.status(200).json({ success: true });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

export const getHistory = async (req, res) => {
  try {
    const { personId } = req.params;
    const history = await RoughNoteEntry.find({ personId }).sort({ date: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePerson = async (req, res) => {
  try {
    const { personId } = req.params;
    await RoughNoteEntry.deleteMany({ personId });
    await RoughNotePerson.findByIdAndDelete(personId);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
