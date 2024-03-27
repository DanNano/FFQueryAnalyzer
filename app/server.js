// server.js

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse request body
app.use(express.json());

// Define routes here
app.get('/api', (req, res) => {
  res.send('API is running...');
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
