import { build } from 'vite';

const result = await build({
  root: process.cwd(),
  logLevel: 'silent',
  build: { write: false, sourcemap: false },
});
const outputs = Array.isArray(result) ? result.flatMap((entry) => entry.output) : result.output;
const chunks = outputs.filter((output) => output.type === 'chunk');
const assets = outputs.filter((output) => output.type === 'asset');

for (const chunk of chunks.sort((a, b) => b.code.length - a.code.length)) {
  console.log(`\n${chunk.fileName}: ${Buffer.byteLength(chunk.code)} bytes`);
  const modules = Object.entries(chunk.modules)
    .map(([id, details]) => ({ id: id.replace(process.cwd(), '<project>'), bytes: details.renderedLength }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 12);
  for (const module of modules) console.log(`${String(module.bytes).padStart(8)}  ${module.id}`);
}

console.log('\nLargest emitted assets:');
for (const asset of assets
  .map((entry) => ({ fileName: entry.fileName, bytes: Buffer.byteLength(typeof entry.source === 'string' ? entry.source : entry.source) }))
  .sort((a, b) => b.bytes - a.bytes)
  .slice(0, 12)) {
  console.log(`${String(asset.bytes).padStart(8)}  ${asset.fileName}`);
}
