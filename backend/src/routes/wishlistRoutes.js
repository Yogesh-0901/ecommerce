const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');

// Route to add or remove an item from the wishlist
router.post('/', wishlistController.toggleWishlist);

// Route to get all items in the wishlist
router.get('/', wishlistController.getWishlist);

module.exports = router;