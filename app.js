// app.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const routes = require('./routes'); 
const cors = require('cors');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to DB
connectDB();

app.use(cors({
  origin: '*',
}));
// Middleware
app.use(express.json());

// Routes
// const particularRoutes = require('./services/particular/particular.routes');
// app.use('/particulars', particularRoutes);

// const purchaseRoutes = require('./services/purchase/purchase.routes');
// app.use('/purchase', purchaseRoutes);

app.use('/', routes);

// Health check
app.get('/', (req, res) => {
  res.send('Billing System Service V2 is running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
