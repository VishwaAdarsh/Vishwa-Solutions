/**
 * Vishwa Solutions — Local Development & Test Server
 * Serves static frontend files with production security headers and mounts /api/enquiry.
 */

require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const enquiryHandler = require('./api/enquiry');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
    // Helper to send JSON responses
    res.status = function (code) {
        this.statusCode = code;
        return this;
    };
    res.json = function (obj) {
        this.setHeader('Content-Type', 'application/json');
        this.end(JSON.stringify(obj));
        return this;
    };

    // Route /api/enquiry and /.netlify/functions/enquiry
    if (req.url.startsWith('/api/enquiry') || req.url.startsWith('/.netlify/functions/enquiry')) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                req.body = {};
                if (body) {
                    try {
                        req.body = JSON.parse(body);
                    } catch {
                        const parsed = new URLSearchParams(body);
                        req.body = Object.fromEntries(parsed.entries());
                    }
                }
                await enquiryHandler(req, res);
            } catch (err) {
                console.error('[Server Error]', err);
                res.status(500).json({ status: 'error', message: 'Internal Server Error' });
            }
        });
        return;
    }

    // Serve static files
    let safePath = req.url.split('?')[0];
    if (safePath === '/' || safePath === '') safePath = '/index.html';

    const filePath = path.join(__dirname, safePath);

    // Prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        // Apply production security and caching headers
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https://images.unsplash.com https://media.istockphoto.com https://vishwasolutions.netlify.app; frame-src https://www.google.com https://maps.google.com; connect-src 'self' https://script.google.com https://script.googleusercontent.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none';");

        if (safePath.startsWith('/assets/')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (safePath.startsWith('/styles/') || safePath.startsWith('/scripts/')) {
            res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
        }

        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(` Vishwa Solutions Local Server Running `);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(` API: http://localhost:${PORT}/api/enquiry`);
    console.log(`========================================\n`);
});
