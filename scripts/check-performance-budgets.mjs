import { readdir, readFile, stat } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import budgets from './performance-budgets.config.mjs';

const distDir = resolve('dist');
const failures = [];

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
const mainScriptPath = rootHtml.match(/<script[^>]+src="(\/assets\/[^"]+\.js)"/i)?.[1];
if (!mainScriptPath) failures.push('Unable to identify the initial JavaScript entry.');
else withinBudget(fileSizes.get(resolve(distDir, mainScriptPath.replace(/^\//, ''))) ?? Infinity, budgets.mainJavaScriptBytes, 'Initial JavaScript');

const jsFiles = files.filter((file) => file.endsWith('.js'));
const cssFiles = files.filter((file) => file.endsWith('.css'));
const fontFiles = files.filter((file) => /\.(?:woff2?|ttf|otf)$/i.test(file));
withinBudget(jsFiles.reduce((sum, file) => sum + fileSizes.get(file), 0), budgets.totalJavaScriptBytes, 'Total JavaScript');
withinBudget(cssFiles.reduce((sum, file) => sum + fileSizes.get(file), 0), budgets.totalCssBytes, 'Total CSS');
for (const file of fontFiles) withinBudget(fileSizes.get(file), budgets.individualFontBytes, `Font ${basename(file)}`);

const preloadedFonts = [...rootHtml.matchAll(/<link\s+rel="preload"\s+href="([^"]+)"\s+as="font"/gi)]
  .map((match) => resolve(distDir, match[1].replace(/^\//, '')));
withinBudget(preloadedFonts.reduce((sum, file) => sum + (fileSizes.get(file) ?? 0), 0), budgets.criticalPreloadedFontBytes, 'Critical preloaded fonts');

const heroImage = resolve(distDir, 'images', 'hero', 'mino-office-consultation-placeholder.svg');
const teamImage = resolve(distDir, 'images', 'team', 'tomislav-siketic-placeholder.svg');
withinBudget(fileSizes.get(heroImage) ?? Infinity, budgets.heroImageBytes, 'Hero image');
withinBudget(fileSizes.get(teamImage) ?? Infinity, budgets.belowFoldImageBytes, 'Below-the-fold team image');

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
