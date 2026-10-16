import http from 'node:http';
import { createReadStream } from 'node:fs';
import { lstat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { isSafePublicPath } from '../../site/scripts/sync-prototypes.mjs';
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon', '.avif': 'image/avif', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav' };
export async function startPrototypeServer(uiRoot) {
  const root = await realpath(uiRoot);
  const server = http.createServer(async (request, response) => {
    const reject = (code) => { response.writeHead(code); response.end(); };
    if (request.method !== 'GET' && request.method !== 'HEAD') return reject(405);
    try {
      const pathname = decodeURIComponent((request.url || '/').split('?')[0]);
      if (pathname.includes('\0') || pathname.includes('\\')) return reject(403);
      const parts = pathname.split('/').filter(Boolean);
      if (parts.some((part) => part === '.' || part === '..')) return reject(403);
      if (pathname.endsWith('/')) parts.push('index.html');
      const relative = parts.join('/');
      if (!isSafePublicPath(relative)) return reject(403);
      let file = root;
      for (const part of parts) {
        file = path.join(file, part);
        if ((await lstat(file)).isSymbolicLink()) return reject(403);
      }
      const resolved = await realpath(file);
      if (!resolved.startsWith(root + path.sep) || !(await lstat(resolved)).isFile()) return reject(403);
      response.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' });
      if (request.method === 'HEAD') return response.end();
      createReadStream(resolved).on('error', () => response.destroy()).pipe(response);
    } catch (error) { reject(error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 404 : 400); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  return { server, url: 'http://127.0.0.1:' + server.address().port,
    close: () => new Promise((resolve, reject) => { server.close((error) => error ? reject(error) : resolve()); server.closeAllConnections(); }) };
}
