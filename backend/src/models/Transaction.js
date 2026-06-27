const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    paymentId: { type: String },
    status: { type: String, default: 'Completed' },
    amount: { type: Number },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);