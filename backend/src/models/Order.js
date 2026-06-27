const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: Array,
    totalAmount: Number,
    deliveryCarrier: String,
    status: { type: String, default: 'Pending' }
}, { timestamps: true });

// MAKE SURE THIS SAYS 'Order'
module.exports = mongoose.model('Order', OrderSchema);