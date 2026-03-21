import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./models/user.models.js";

dotenv.config();

const createAdmin = async () => {
    const name = "Official Admin";
    const email = "adminsohan7@gmail.com";
    const password = "Sohan@123***"; // CHANGE THIS

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            console.log("Admin account already exists.");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const adminUser = new User({
            name,
            email,
            password: hashedPassword,
            role: "admin"
        });

        await adminUser.save();
        console.log("Admin account created successfully!");
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        process.exit(0);
    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
};

createAdmin();
