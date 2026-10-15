const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/error.middleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount Module Routes
app.use('/api/v1/auth', require('./src/modules/auth/auth.routes'));
app.use('/api/v1/products', require('./src/modules/products/product.routes'));
app.use('/api/v1/orders', require('./src/modules/orders/order.routes'));
app.use(require('./src/middleware/error.middleware'));

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Shopora Backend API' });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Shopora server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});