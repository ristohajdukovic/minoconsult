import { mkdir, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { seoPages } from '../src/seoPages.js';

const distDir = resolve('dist');
const indexFile = resolve(distDir, 'index.html');

await Promise.all(
  seoPages.map(async (page) => {
    const routeDir = resolve(distDir, page.path.replace(/^\//, ''));
    await mkdir(routeDir, { recursive: true });
    await copyFile(indexFile, resolve(routeDir, 'index.html'));
  }),
);
