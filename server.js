const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://192.168.1.8:3000', 'http://192.168.1.8:5000', 'http://127.0.0.1:3001', 'http://192.168.0.3:5173', 'http://192.168.1.8:5173', 'http://192.168.1.8:3001', 'http://localhost:5173', 'http://192.168.1.8:8081', 'https://serverapp-a8wy.onrender.com', 'https://pamsforce-admin.onrender.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files from the dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// API proxy to backend server
app.use('/api', (req, res) => {
  const target = 'https://serverapp-a8wy.onrender.com';
  const proxyUrl = target + req.url;
  
  fetch(proxyUrl, {
    method: req.method,
    headers: {
      ...req.headers,
      host: 'serverapp-a8wy.onrender.com'
    },
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined
  })
  .then(response => {
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    response.body.pipe(res);
  })
  .catch(err => {
    console.error('Proxy error:', err);
    res.status(502).json({ error: 'Bad gateway' });
  });
});

// SPA fallback - serve index.html for all routes that don't match static files or API
app.get('*', (req, res) => {
  // Don't handle API routes here - they should return 404 from backend
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  
  // Serve index.html for all other routes (SPA routing)
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Admin portal server running on port ${PORT}`);
});
