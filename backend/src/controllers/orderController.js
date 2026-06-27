const Order = require('../models/Order');
const Cart = require('../models/Cart');

/**
 * 1. Create a new order
 * Triggered by the "SUBMIT ORDER" button on the Checkout page.
 */
exports.createOrder = async (req, res) => {
    try {
        const { userId, deliveryCarrier, totalAmount } = req.body;
        
        // Find user's cart to get the actual items being purchased
        // userId here is "rose@gmail.com"
        const cart = await Cart.findOne({ userId });
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: "Your cart is empty. Cannot place order." });
        }

        // Create the new order document in MongoDB
        const newOrder = new Order({
            userId, // Store as String (email)
            items: cart.items,
            totalAmount,
            deliveryCarrier,
            status: 'Processing'
        });

        await newOrder.save();

        // IMPORTANT: Clear the user's cart after successful order placement
        // This ensures the basket is empty when they return to the home screen.
        await Cart.findOneAndDelete({ userId }); 

        // Send back a success response to the mobile app
        res.status(201).json({ 
            message: "Order placed successfully", 
            orderId: newOrder._id 
        });
    } catch (error) {
        // Detailed error for debugging the "Invalid Response" crash
        res.status(500).json({ error: "Checkout process failed: " + error.message });
    }
};

/**
 * 2. Fetch user order history
 * Used by the Profile page to display "My Orders".
 */
exports.getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params; // Extracts email from the URL
        
        // Find all orders associated with this email string
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });
        
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch orders: " + error.message });
    }
};