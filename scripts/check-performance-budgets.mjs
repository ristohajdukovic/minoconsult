import { readdir, readFile, stat } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import budgets from './performance-budgets.config.mjs';
import { ADVISER_PORTRAIT_PATH, HERO_IMAGE_PATH } from '../src/config/site.js';

const distDir = resolve('dist');
const failures = [];

function outputPathToDist(path) {
  return resolve(distDir, path.replace(/^\/minoconsult\//, '').replace(/^\//, ''));
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(path));
    else files.push(path);
  }
  return files;
}

function withinBudget(actual, budget, label) {
  if (actual > budget) failures.push(`${label}: ${actual} bytes exceeds ${budget} bytes`);
}

const files = await collectFiles(distDir);
const fileSizes = new Map(await Promise.all(files.map(async (file) => [file, (await stat(file)).size])));
const rootHtml = await readFile(resolve(distDir, 'index.html'), 'utf8');
const mainScriptPath = rootHtml.match(/<script[^>]+src="((?:\/minoconsult)?\/assets\/[^"]+\.js)"/i)?.[1];
if (!mainScriptPath) failures.push('Unable to identify the initial JavaScript entry.');
else withinBudget(fileSizes.get(outputPathToDist(mainScriptPath)) ?? Infinity, budgets.mainJavaScriptBytes, 'Initial JavaScript');

const jsFiles = files.filter((file) => file.endsWith('.js'));
const cssFiles = files.filter((file) => file.endsWith('.css'));
const fontFiles = files.filter((file) => /\.(?:woff2?|ttf|otf)$/i.test(file));
withinBudget(jsFiles.reduce((sum, file) => sum + fileSizes.get(file), 0), budgets.totalJavaScriptBytes, 'Total JavaScript');
withinBudget(cssFiles.reduce((sum, file) => sum + fileSizes.get(file), 0), budgets.totalCssBytes, 'Total CSS');
for (const file of fontFiles) withinBudget(fileSizes.get(file), budgets.individualFontBytes, `Font ${basename(file)}`);

const preloadedFonts = [...rootHtml.matchAll(/<link\s+rel="preload"\s+href="([^"]+)"\s+as="font"/gi)]
  .map((match) => outputPathToDist(match[1]));
withinBudget(preloadedFonts.reduce((sum, file) => sum + (fileSizes.get(file) ?? 0), 0), budgets.criticalPreloadedFontBytes, 'Critical preloaded fonts');

const heroImage = outputPathToDist(HERO_IMAGE_PATH || '/brand/mino-logo.svg');
const adviserVisual = outputPathToDist(ADVISER_PORTRAIT_PATH || '/brand/mino-logo.svg');
withinBudget(fileSizes.get(heroImage) ?? Infinity, budgets.heroImageBytes, 'Hero visual');
withinBudget(fileSizes.get(adviserVisual) ?? Infinity, budgets.belowFoldImageBytes, 'Below-the-fold adviser visual');

for (const file of files.filter((candidate) => candidate.endsWith('.html'))) {
  withinBudget(fileSizes.get(file), budgets.generatedHtmlBytesPerPage, `HTML ${file.replace(`${distDir}\\`, '')}`);
}

for (const file of files.filter((candidate) => /\.(?:html|css|js|xml|txt)$/i.test(candidate))) {
  const content = await readFile(file, 'utf8');
  for (const domain of budgets.prohibitedDomains) {
    if (content.toLowerCase().includes(domain)) failures.push(`${file.replace(`${distDir}\\`, '')}: contains prohibited domain ${domain}`);
  }
}

if (failures.length) {
  console.error(`Performance budgets failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Performance budgets passed: ${jsFiles.length} JavaScript chunks, ${cssFiles.length} stylesheet, ${fontFiles.length} fonts, ${files.filter((file) => file.endsWith('.html')).length} HTML files.`);
