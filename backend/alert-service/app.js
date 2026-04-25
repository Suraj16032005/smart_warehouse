require('dotenv').config();
const express = require('express');
const cors = require('cors');
const alertRoutes = require('./routes/alertRoutes');
const { verifyToken } = require('./middleware/auth');
const alertController = require('./controllers/alertController');

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:8080"],
  credentials: true
}));
app.use(express.json());

// Health check endpoint (public)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Alert Service' });
});

// Protect all alert routes with JWT
app.use('/alerts', verifyToken, alertRoutes);

// Start listening for PG notifications
alertController.listenForAlerts().catch(console.error);

// Start Server
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Alert Service running on port ${PORT}`);
});
