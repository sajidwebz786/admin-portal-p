const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://serverapp-a8wy.onrender.com', 'https://pamsforce-admin.onrender.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Serve static files from the dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// API proxy to backend server
app.use('/api', async (req, res) => {
  try {
    const target = process.env.API_URL || 'https://serverapp-a8wy.onrender.com';
    const proxyUrl = target + req.originalUrl;
    
    const headers = { ...req.headers };
    headers.host = new URL(target).host;
    delete headers['content-length'];
    
    const fetchOptions = {
      method: req.method,
      headers,
    };
    
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(req.body);
      headers['content-type'] = 'application/json';
    }
    
    const response = await fetch(proxyUrl, fetchOptions);
    
    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (key !== 'transfer-encoding') {
        res.setHeader(key, value);
      }
    });
    
    const body = await response.text();
    res.send(body);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(502).json({ error: 'Bad gateway', message: err.message });
  }
});

// SPA fallback - serve index.html for all routes that don't match static files or API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Admin portal server running on port ${PORT}`);
});
