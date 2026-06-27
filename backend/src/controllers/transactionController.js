const Transaction = require('../models/Transaction');

exports.logTransaction = async (req, res) => {
    try {
        const { orderId, paymentId, status } = req.body;
        const newTransaction = new Transaction({ orderId, paymentId, status });
        await newTransaction.save();
        res.status(201).json(newTransaction);
    } catch (error) {
        res.status(500).json({ error: "Failed to log transaction" });
    }
};