const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product'); 

exports.toggleWishlist = async (req, res) => {
    try {
        const { productId, action, userId } = req.body; 
        
        if (!userId) {
            return res.status(400).json({ error: "User ID required" });
        }

        let wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            wishlist = new Wishlist({ userId, items: [] });
        }

        if (action === 'add') {
            if (!wishlist.items.some(item => item.productId === productId)) {
                wishlist.items.push({ productId });
            }
        } else if (action === 'remove') {
            wishlist.items = wishlist.items.filter(item => item.productId !== productId);
        }

        await wishlist.save();
        res.status(200).json({ message: "Wishlist updated", wishlist: wishlist.items });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getWishlist = async (req, res) => {
    try {
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({ error: "User ID required" });
        }

        const wishlist = await Wishlist.findOne({ userId });
        
        if (!wishlist) {
            return res.status(200).json([]);
        }

        const productIds = wishlist.items.map(item => item.productId);
        const products = await Product.find({ _id: { $in: productIds } });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
