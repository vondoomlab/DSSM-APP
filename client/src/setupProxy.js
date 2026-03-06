const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      timeout: 120000,        // 2 minutes
      proxyTimeout: 120000,   // 2 minutes
      onError: (err, req, res) => {
        console.error('Proxy error:', err.message);
        res.status(500).json({ error: 'Proxy error: ' + err.message });
      }
    })
  );
};
