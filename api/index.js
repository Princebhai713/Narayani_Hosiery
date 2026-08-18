import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000, // Fail fast if DB is unreachable
});



// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup for file uploads (temporary storage before Cloudinary)
const upload = multer({ dest: '/tmp/' });

// Test DB Connection Route
app.get('/api/test-db', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    res.json({ success: true, time: result.rows[0].now, message: 'Connected to Neon PostgreSQL' });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Initialize Database Tables Route (Run once)
app.get('/api/init-db', async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Products Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        net_rate NUMERIC NOT NULL,
        moq INTEGER NOT NULL,
        category VARCHAR(100),
        images JSONB,
        is_top_picked BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(15) UNIQUE NOT NULL,
        name VARCHAR(255),
        gstin VARCHAR(15),
        shop_name VARCHAR(255),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Orders Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        items JSONB NOT NULL,
        total_amount NUMERIC NOT NULL,
        freight NUMERIC,
        gst NUMERIC,
        status VARCHAR(50) DEFAULT 'PENDING',
        customer_details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    client.release();
    res.json({ success: true, message: 'Database tables initialized successfully' });
  } catch (err) {
    console.error('Error initializing tables:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// API Routes
app.get('/api', (req, res) => {
  res.json({ message: 'Narayani Hosiery B2B API is running' });
});

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json({ success: true, products: result.rows });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST new product (Admin)
app.post('/api/products', upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, net_rate, moq, category, is_top_picked } = req.body;
    let imageUrls = [];
    
    // Automatically generate a unique product ID (e.g. NH-1698203023)
    const generatedId = `NH-${Date.now()}`;

    // Upload images to Cloudinary if provided
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'narayani_hosiery_products',
        });
        imageUrls.push(result.secure_url);
        // Delete temporary local file
        fs.unlinkSync(file.path);
      }
    }

    const query = `
      INSERT INTO products (id, name, description, net_rate, moq, category, images, is_top_picked)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      generatedId, name, description, parseFloat(net_rate), parseInt(moq, 10), category, JSON.stringify(imageUrls), is_top_picked === 'true' || is_top_picked === true
    ];

    const newProduct = await pool.query(query, values);
    res.json({ success: true, product: newProduct.rows[0] });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update product (Admin)
app.put('/api/products/:id', upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, net_rate, moq, category, existingImages, is_top_picked } = req.body;
    let imageUrls = existingImages ? JSON.parse(existingImages) : [];
    
    // Upload new images to Cloudinary if provided
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'narayani_hosiery_products',
        });
        imageUrls.push(result.secure_url);
        fs.unlinkSync(file.path);
      }
    }

    const query = `
      UPDATE products 
      SET name = $1, description = $2, net_rate = $3, moq = $4, category = $5, images = $6, is_top_picked = $7
      WHERE id = $8
      RETURNING *;
    `;
    const values = [
      name, description, parseFloat(net_rate), parseInt(moq, 10), category, JSON.stringify(imageUrls), is_top_picked === 'true' || is_top_picked === true, id
    ];

    const updatedProduct = await pool.query(query, values);
    if (updatedProduct.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    res.json({ success: true, product: updatedProduct.rows[0] });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH update product top-pick status (Admin)
app.patch('/api/products/:id/top-pick', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_top_picked } = req.body;
    
    const query = `
      UPDATE products 
      SET is_top_picked = $1
      WHERE id = $2
      RETURNING *;
    `;
    const values = [is_top_picked === 'true' || is_top_picked === true, id];

    const updatedProduct = await pool.query(query, values);
    if (updatedProduct.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    res.json({ success: true, product: updatedProduct.rows[0] });
  } catch (err) {
    console.error('Error updating top-pick status:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE product (Admin)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM products WHERE id = $1 RETURNING *;';
    const deletedProduct = await pool.query(query, [id]);
    
    if (deletedProduct.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET all orders (Admin)
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST new order
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, items, totalAmount, freight, gst, customerDetails } = req.body;
    
    const query = `
      INSERT INTO orders (user_id, items, total_amount, freight, gst, status, customer_details)
      VALUES ($1, $2, $3, $4, $5, 'PENDING', $6)
      RETURNING *;
    `;
    const values = [
      userId || null, 
      JSON.stringify(items), 
      parseFloat(totalAmount), 
      parseFloat(freight), 
      parseFloat(gst),
      customerDetails ? JSON.stringify(customerDetails) : null
    ];

    const result = await pool.query(query, values);
    res.json({ success: true, order: result.rows[0] });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- AUTH & PROFILE APIs --- //

// Login / Register (Fast login with phone)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, name, gstin } = req.body;
    
    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    // Check if user exists
    let userResult = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    let user = userResult.rows[0];

    if (!user) {
      // Create new user
      const insertResult = await pool.query(
        'INSERT INTO users (name, phone, gstin) VALUES ($1, $2, $3) RETURNING *',
        [name || 'Guest', phone, gstin || null]
      );
      user = insertResult.rows[0];
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Profile Details
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, shop_name, gstin, address } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET name = $1, shop_name = $2, gstin = $3, address = $4 WHERE id = $5 RETURNING *',
      [name, shop_name, gstin, address, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get User Orders
app.get('/api/users/:id/orders', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [id]);
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error('Fetch user orders error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// Export the app for Vercel Serverless with a defensive wrapper
export default (req, res) => {
  try {
    app(req, res);
  } catch (err) {
    console.error('CRITICAL VERCEL CRASH:', err);
    res.status(500).json({ success: false, error: 'CRITICAL CRASH: ' + err.message });
  }
};

// Start Server locally
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
