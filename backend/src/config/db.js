const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shopApp');
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Database Connection Error:", err);
        console.log("Server will continue running without database connection");
    }
};

module.exports = connectDB;