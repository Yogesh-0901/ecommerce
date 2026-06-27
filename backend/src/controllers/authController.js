const User = require('../models/User');
const bcrypt = require('bcryptjs');

// 1. Signup Logic
exports.signup = async (req, res) => {
    const { fullName, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ fullName, email, password: hashedPassword, role });
        await newUser.save();
        res.status(201).json({ message: "Account Created Successfully" });
    } catch (error) {
        res.status(400).json({ error: "User already exists" });
    }
};

// 2. Login Logic
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            res.json({ message: "Success", user });
        } else {
            res.status(400).json({ error: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
};

// 3. Forgot Password Logic
exports.forgotPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const user = await User.findOneAndUpdate(
            { email }, 
            { password: hashedPassword },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update password" });
    }
};

