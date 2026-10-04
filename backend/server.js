require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const datasetRoutes = require('./routes/datasetRoutes');
const aiRoutes = require('./routes/aiRoutes');
const userRoutes = require('./routes/UserRoutes');

const app = express();

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Connect to MongoDB
connectDB();

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Excel Visual Analyzer API Server Running' });
});

// Modern API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/datasets', datasetRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/ai', aiRoutes);

// Legacy Route Compatibility
app.use('/user', userRoutes);

// Centralized Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Excel Visual Analyzer Server running on port ${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
});
