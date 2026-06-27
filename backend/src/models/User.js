const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'customer' } 
});

module.exports = mongoose.model('User', UserSchema);