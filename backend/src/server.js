const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

const app = express();

// Connect DB
connectDB(); 

// Middleware
app.use(express.json()); 
app.use(cors()); 

// 1. IMPROVED: Dynamic Static Folder Path
// This ensures the /uploads folder is accessible for your Product Images
const uploadDir = path.join(__dirname, 'uploads'); 
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

// 2. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes); 
app.use('/api/orders', orderRoutes);

// 3. NEW: Global Error Handler
// This stops the server from crashing if a route fails
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong on the server!' });
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => { // '0.0.0.0' allows connections from your phone
    console.log(`=================================`);
    console.log(`🚀 Server running on Port: ${PORT}`);
    console.log(`📱 Connect your app to: http://192.168.1.35:${PORT}`);
    console.log(`=================================`);
});