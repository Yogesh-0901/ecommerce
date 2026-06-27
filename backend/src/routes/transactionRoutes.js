const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.post('/log', transactionController.logTransaction);

module.exports = router;