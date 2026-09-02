/**
 * Vishwa Solutions — Local Development & Test Server
 * Serves static frontend files and mounts /api/enquiry.
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

    // Route /api/enquiry
    if (req.url.startsWith('/api/enquiry')) {
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
