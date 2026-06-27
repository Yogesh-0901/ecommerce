const Cart = require('../models/Cart');

// 1. Fetch the cart
exports.getCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const cart = await Cart.findOne({ userId });
        
        // Return the items array or an empty array if no cart exists
        res.status(200).json(cart ? cart.items : []);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch cart: " + error.message });
    }
};

// 2. Add, Update, or Remove items
exports.updateCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const { productId, name, price, image, action } = req.body;

        let cart = await Cart.findOne({ userId });

        // Create a new cart if one doesn't exist for this user
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(p => p.productId === productId);

        if (action === 'add' || action === 'plus') {
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += 1;
            } else {
                cart.items.push({ productId, name, price, image, quantity: 1 });
            }
        } else if (action === 'minus') {
            if (itemIndex > -1 && cart.items[itemIndex].quantity > 1) {
                cart.items[itemIndex].quantity -= 1;
            }
        } else if (action === 'remove') {
            cart.items = cart.items.filter(p => p.productId !== productId);
        }

        await cart.save();
        res.status(200).json(cart.items); // Return updated list to frontend
    } catch (error) {
        res.status(500).json({ error: "Cart update failed: " + error.message });
    }
};