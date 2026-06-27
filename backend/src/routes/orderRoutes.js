const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Line 7: Matches the exported 'createOrder' function
router.post('/', orderController.createOrder); 

// Matches the exported 'getUserOrders' function
router.get('/:userId', orderController.getUserOrders);

module.exports = router;