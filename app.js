// app.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to DB
connectDB();

// Middleware
app.use(express.json());

// Routes
const particularRoutes = require('./services/particular/particular.routes');
app.use('/particulars', particularRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Billing System Service V2 is running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
