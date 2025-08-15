
const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Security headers
app.use(helmet());
// Gzip compression
app.use(compression());

// Serve static files from the React build directory
const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath, {
  setHeaders: (res, filePath) => {
    // Cache static assets for 1 year
    if (filePath.includes('/static/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }
}));

// SPA routing: serve index.html for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`React app served at http://localhost:${PORT}`);
});
