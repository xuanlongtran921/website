const http = require('http');
const os = require('os');
const { scrapeProductInfo } = require('./product-scraper');

function getLanIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal && !iface.address.startsWith('169.254')) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

function createProxyServer(listenPort, targetPort, label) {
  const server = http.createServer((req, res) => {
    // Intercept scraping endpoint for instant live web parsing
    if (req.url && (req.url.startsWith('/api/fetch-brand-price') || req.url.startsWith('/api/scrape-product'))) {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          let targetUrl = '';
          if (req.method === 'POST' && body) {
            const parsed = JSON.parse(body);
            targetUrl = parsed.url || '';
          } else {
            const u = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
            targetUrl = u.searchParams.get('url') || '';
          }

          if (targetUrl && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://'))) {
            const scraped = await scrapeProductInfo(targetUrl);
            if (scraped && scraped.success) {
              res.writeHead(200, {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
              });
              return res.end(JSON.stringify(scraped));
            }
          }
        } catch (e) {
          console.error('[Live Product Scraper Error]', e);
        }

        // Fallback to backend PowerShell handler if scrape did not finish
        forwardToBackend(req, res, listenPort, targetPort, label, body);
      });
      return;
    }

    forwardToBackend(req, res, listenPort, targetPort, label);
  });

  server.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  });

  server.listen(listenPort, '0.0.0.0', () => {
    console.log(`[LAN PROXY] ${label} listening on 0.0.0.0:${listenPort} -> 127.0.0.1:${targetPort}`);
  });

  return server;
}

function forwardToBackend(req, res, listenPort, targetPort, label, preloadedBody = null) {
  const clientHost = req.headers['host'] || `localhost:${listenPort}`;
  const clientIp = req.socket.remoteAddress || '';

  const headers = { ...req.headers };
  headers['host'] = `localhost:${targetPort}`;
  headers['x-forwarded-for'] = clientIp;
  headers['x-forwarded-host'] = clientHost;
  headers['x-forwarded-proto'] = 'http';

  const options = {
    hostname: '127.0.0.1',
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    res.end(`[LAN Proxy Error] Could not connect to backend ${label} (127.0.0.1:${targetPort}): ${err.message}`);
  });

  if (preloadedBody !== null) {
    proxyReq.write(preloadedBody);
    proxyReq.end();
  } else {
    req.pipe(proxyReq, { end: true });
  }
}

const LAN_IP = getLanIp();
const webProxy = createProxyServer(3002, 3012, 'Website');
const adminProxy = createProxyServer(3003, 3013, 'Admin CMS');

console.log('==========================================================');
console.log('  TECHPICKS REVIEW - LAN & LOCALHOST SHARING ACTIVE:');
console.log(`  LAN IP: ${LAN_IP}`);
console.log(`  1. WEBSITE:   http://localhost:3002/  |  http://${LAN_IP}:3002/`);
console.log(`  2. ADMIN CMS: http://localhost:3003/  |  http://${LAN_IP}:3003/`);
console.log('==========================================================');

process.on('SIGINT', () => {
  webProxy.close();
  adminProxy.close();
  process.exit(0);
});
process.on('SIGTERM', () => {
  webProxy.close();
  adminProxy.close();
  process.exit(0);
});
