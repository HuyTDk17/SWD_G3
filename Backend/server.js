const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const app = express();
const connectDB = require('./config/db')
const router = require('./src/routers/index');
const errorHandler = require('./src/middlewares/errorHandler');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Connect to database
connectDB();

// Routes
app.use('/', router);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));