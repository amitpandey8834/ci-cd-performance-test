const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet'); // <-- Added helmet
const Item = require('./models/item');

const app = express();

// Apply security headers
app.use(helmet());

// Disable Express identifying header
app.disable('x-powered-by');

// Parse JSON request bodies
app.use(bodyParser.json());

// MongoDB connection URI (using Docker MongoDB with auth)
const mongoURI = 'mongodb://admin:password@localhost:27017/?authSource=admin';

// Connect to MongoDB only if running this file directly (not in tests)
if (require.main === module) {
  mongoose.connect(mongoURI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));
}

// API routes
app.get('/items', async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

app.post('/items', async (req, res) => {
  const newItem = new Item(req.body);
  await newItem.save();
  res.status(201).json(newItem);
});

const port = process.env.PORT || 3000;

// Start server only if this file is run directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
}

module.exports = app; // Export app for testing
