import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { UI_ROOT, loadCatalog } from '../lib/catalog.mjs';

export const PUBLIC_ROOT = fileURLToPath(new URL('../public/prototypes/', import.meta.url));
// Deliberate allowlist: never publish JSON metadata, environment files, source maps,
// credentials, archives, or arbitrary repository documents.
export const SAFE_EXTENSIONS = new Set(['.html', '.css', '.js', '.mjs', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.otf', '.mp4', '.webm', '.mp3', '.ogg', '.wav']);
export function isSafePublicPath(relativePath) {
  const parts = relativePath.split(/[\\/]/);
  return parts.every((part) => part && !part.startsWith('.') && !/secret|credential|token|password|private[-_]?key|metadata|history/i.test(part))
    && SAFE_EXTENSIONS.has(path.extname(relativePath).toLowerCase());
}
function copySafe(source, destination, prefix = '') {
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || /^(node_modules|metadata|history|secrets?|credentials?)$/i.test(entry.name)) continue;
    const relative = path.join(prefix, entry.name);
    const src = path.join(source, entry.name);
    const dest = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      copySafe(src, dest, relative);
    } else if (entry.isFile() && isSafePublicPath(relative)) {
      mkdirSync(destination, { recursive: true });
      copyFileSync(src, dest);
    }
  }
}
export function syncPrototypes({ uiRoot = UI_ROOT, publicRoot = PUBLIC_ROOT } = {}) {
  const source = path.resolve(uiRoot);
  const destination = path.resolve(publicRoot);
  // Refuse destructive configurations, even when called programmatically.
  const relative = path.relative(source, destination);
  if (!relative || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative)) || path.parse(destination).root === destination || path.basename(destination) !== 'prototypes') {
    throw new Error('Refusing unsafe prototype destination: ' + destination);
  }
  const catalog = loadCatalog({ uiRoot: source });
  if (existsSync(destination)) rmSync(destination, { recursive: true, force: true });
  mkdirSync(destination, { recursive: true });
  for (const item of catalog) copySafe(path.join(source, item.slug), path.join(destination, item.slug));
  return catalog.length;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  console.log('Synced ' + syncPrototypes() + ' prototypes (public assets only).');
}
