require('dotenv').config();
const express = require('express');
const cors = require('cors');
const inventoryRoutes = require('./routes/inventoryRoutes');
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
  res.status(200).json({ status: 'OK', service: 'Inventory Service' });
});

// Protect all inventory routes with JWT
app.use('/inventory', verifyToken, inventoryRoutes);

// Start Server
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Inventory Service running on port ${PORT}`);
});
