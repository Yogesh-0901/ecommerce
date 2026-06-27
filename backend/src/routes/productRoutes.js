const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productController');

// 1. Configure Multer Storage for Seller Image Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Files will be saved in the 'uploads' directory at the root
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        // Create a unique filename using the current timestamp
        cb(null, `${Date.now()}-${file.originalname}`); 
    }
});

const upload = multer({ storage });

// 2. Define API Routes

// GET: Fetch all products for the Home Page
// Matches: GET http://192.168.1.38:5000/api/products
router.get('/', productController.getProducts); 

// GET: Fetch a single product for the Product Details Page
// Matches: GET http://192.168.1.38:5000/api/products/:id
router.get('/:id', productController.getProductById); 

// POST: Submit a review for a specific product
// Matches: POST http://192.168.1.38:5000/api/products/:id/review
// This route is essential for your 'submitReview' function in the app
router.post('/:id/review', productController.addReview);

// POST: Create a new product with an image (Seller Mode)
// Matches: POST http://192.168.1.38:5000/api/products
router.post('/', upload.single('image'), productController.createProduct);

module.exports = router;