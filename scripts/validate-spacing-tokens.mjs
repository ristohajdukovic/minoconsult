import { readFile } from 'node:fs/promises';

const css = await readFile('src/index.css', 'utf8');
const failures = [];
const advisories = [];
const primitiveValues = new Set(['0', '0.25rem', '0.5rem', '0.75rem', '1rem', '1.5rem', '2rem', '3rem', '4rem', '6rem', '8rem', '10rem']);

const spacingVariables = [...css.matchAll(/(--(?:space|page-gutter|section-space|content-gap|column-gap|prose-gap|heading-gap|action-gap|footer-space)[\w-]*)\s*:/g)]
  .map((match) => match[1]);
for (const variable of new Set(spacingVariables)) {
  const count = spacingVariables.filter((candidate) => candidate === variable).length;
  if (count > 1) failures.push(`${variable} is declared ${count} times; spacing variables must have one source of truth.`);
}

for (const required of [
  '--space-1', '--space-2', '--space-3', '--space-4', '--space-5', '--space-6', '--space-7', '--space-8', '--space-9', '--space-10', '--space-11',
  '--page-gutter-inline', '--section-space-compact', '--section-space-default', '--section-space-generous',
  '--column-gap-default', '--column-gap-wide', '--container-wide', '--container-default', '--container-prose', '--container-narrow',
]) {
  if (!css.includes(`${required}:`)) failures.push(`Required layout token is missing: ${required}`);
}

if (!/--page-gutter-inline:\s*clamp\(1\.25rem,/.test(css)) failures.push('The page gutter does not retain the 20px mobile minimum.');
if (!/\.section-shell\s*\{[^}]*padding-inline:\s*var\(--page-gutter-inline\)/s.test(css)) failures.push('.section-shell does not use the shared page gutter.');

for (const match of css.matchAll(/margin(?:-[\w-]+)?\s*:\s*(-(?:\d*\.)?\d+)(rem|px)/gi)) {
  const numeric = Math.abs(Number(match[1]));
  if ((match[2] === 'rem' && numeric >= 1) || (match[2] === 'px' && numeric >= 16)) {
    failures.push(`Large negative margin is not allowed: ${match[0]}`);
  }
}

for (const block of css.matchAll(/([^{}]+)\{([^{}]+)\}/g)) {
  const selector = block[1].trim();
  const declarations = block[2];
  if (/(?:^|[\s,.>])(p|h[1-6]|li|\.faq-panel-inner|\.legal-section|\.specialization-card)(?:$|[\s,:.>])/i.test(selector)
    && /(?:^|;)\s*height\s*:\s*(?!auto)[^;]+/i.test(declarations)) {
    failures.push(`${selector} applies a fixed height to a text-bearing container.`);
  }
}

const valueCounts = new Map();
for (const match of css.matchAll(/(?:margin|padding|gap)(?:-[\w-]+)?\s*:\s*(-?(?:\d*\.)?\d+(?:rem|px))/gi)) {
  const value = match[1];
  valueCounts.set(value, (valueCounts.get(value) ?? 0) + 1);
}
for (const [value, count] of valueCounts) {
  if (count < 3 || primitiveValues.has(value)) continue;
  advisories.push(`${value} appears in ${count} spacing declarations; keep only when covered by SPACING_TOKEN_EXCEPTIONS.md.`);
}

for (const obsolete of ['--section-padding', '--page-padding', '--content-max-width', '--mobile-gutter']) {
  if (css.includes(obsolete)) failures.push(`Obsolete spacing variable remains: ${obsolete}`);
}

if (advisories.length) console.log(`Spacing advisories (${advisories.length}):\n- ${advisories.join('\n- ')}`);
if (failures.length) {
  console.error(`Spacing-token validation failed (${failures.length}):\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Spacing-token validation passed with ${new Set(spacingVariables).size} centralized spacing variables and no high-risk layout exceptions.`);
