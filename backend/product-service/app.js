require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const { verifyToken } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:8080"],
  credentials: true
}));
app.use(express.json());

// Health check endpoint (public)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Product Service' });
});

// Protect all product routes with JWT
app.use('/products', verifyToken, productRoutes);

// Start Server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
});
