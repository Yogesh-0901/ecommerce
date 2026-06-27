const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// GET: Fetch user's cart
// Matches: http://192.168.1.38:5000/api/cart/:userId
// If this line causes a crash, it means cartController.getCart is undefined.
router.get('/:userId', cartController.getCart);

// POST: Add, Update, or Remove items
// Matches: http://192.168.1.38:5000/api/cart/:userId
router.post('/:userId', cartController.updateCart);

module.exports = router;