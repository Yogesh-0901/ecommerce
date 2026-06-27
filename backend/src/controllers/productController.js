const Product = require('../models/Product'); // Ensure the Product model is imported correctly

// 1. Fetch products with optional filtering (Section and Category)
exports.getProducts = async (req, res) => {
    try {
        // Extract filters from the URL query parameters (e.g., ?section=men&category=Watches)
        const { section, category } = req.query; 
        let query = {};

        // If 'section' (men/women/kids) is provided, add it to the search
        if (section) query.section = section; 
        
        // If 'category' (Watches/Shoes/etc.) is provided, add it to the search
        if (category) query.category = category; 

        // Retrieves products from MongoDB matching the query, sorted by newest first
        const products = await Product.find(query).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch products: " + error.message });
    }
};

// 2. Fetch a single product for the Product Details Page
exports.getProductById = async (req, res) => {
    try {
        // Find product by its MongoDB _id from the URL parameter
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: "Error fetching product: " + error.message });
    }
};

// 3. Add a review to a specific product
exports.addReview = async (req, res) => {
    try {
        const { stars, comment, user, userImage } = req.body; // Data from your app's submitReview function
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Create the new review object
        const newReview = {
            user,
            stars: Number(stars),
            comment,
            userImage,
            createdAt: new Date()
        };

        // Push review to the product's review array
        product.reviews.push(newReview); 
        await product.save();

        // Return the updated list of reviews so the app updates instantly
        res.status(201).json({ message: "Review added", reviews: product.reviews });
    } catch (error) {
        res.status(500).json({ error: "Review submission failed: " + error.message });
    }
};

// 4. Create a new product (Seller Upload)
exports.createProduct = async (req, res) => {
    try {
        const { name, price, category, section } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: "Please upload a product image" });
        }

        // Generate full URL for mobile app display
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        const newProduct = new Product({
            name,
            price: Number(price), 
            category,
            section,
            image: imageUrl 
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: "Product creation failed: " + error.message });
    }
};