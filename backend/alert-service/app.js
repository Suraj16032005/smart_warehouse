require('dotenv').config();
const express = require('express');
const cors = require('cors');
const alertRoutes = require('./routes/alertRoutes');
const { verifyToken } = require('./middleware/auth');
const alertController = require('./controllers/alertController');

const app = express();
const client = require('prom-client');

client.collectDefaultMetrics();

// custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});


// metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:8080"],
  credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
  if (req.path === '/metrics') return next();

  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;

    httpRequestDuration.labels(
      req.method,
      req.route?.path || req.baseUrl || req.path,
      res.statusCode
    ).observe(duration);
  });

  next();
});

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
