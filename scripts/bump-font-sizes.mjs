import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2] || '.';
const DRY = process.argv.includes('--dry');

const PX_MAP = {
  8: 12, 9: 13, 10: 14, 11: 15, 12: 16, 13: 17, 14: 18,
  15: 19, 16: 20, 18: 22, 26: 32, 28: 34, 32: 40, 36: 44,
};

const TW_NAMED = {
  'text-xs': 'text-sm',
  'text-sm': 'text-base',
  'text-base': 'text-lg',
  'text-lg': 'text-xl',
  'text-xl': 'text-2xl',
  'text-2xl': 'text-3xl',
  'text-3xl': 'text-4xl',
  'text-4xl': 'text-5xl',
  'text-5xl': 'text-6xl',
};

const mapPx = (n) => (PX_MAP[n] !== undefined ? PX_MAP[n] : n);

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'dist', 'build', 'scripts']);
const SKIP_FILES = new Set([path.normalize('app/globals.css')]);
const EXTS = /\.(tsx|ts|jsx|js|css)$/;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (EXTS.test(e.name)) out.push(full);
  }
  return out;
}

function transform(src) {
  let s = src;

  // 1) Tailwind named classes — single pass to prevent double-bumping
  s = s.replace(
    /(?<![\w-])text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)(?![\w-])/g,
    (m, k) => TW_NAMED['text-' + k] || m
  );

  // 2) Tailwind arbitrary text-[Npx]
  s = s.replace(/(?<![\w-])text-\[(\d+)px\]/g, (m, n) => {
    const v = mapPx(Number(n));
    return `text-[${v}px]`;
  });

  // 3) inline fontSize: <number>  (no quotes, no px)
  s = s.replace(/fontSize:\s*(\d+)(?=\s*[,)}\]])/g, (m, n) => {
    return `fontSize: ${mapPx(Number(n))}`;
  });

  // 4) inline fontSize: "<num>px" or '<num>px' or "<num>" or '<num>'
  s = s.replace(/fontSize:\s*(['"])(\d+)(px)?\1/g, (m, q, n, px) => {
    return `fontSize: ${q}${mapPx(Number(n))}${px || ''}${q}`;
  });

  // 5) inline fontSize: "clamp(...)" — bump every px inside
  s = s.replace(/fontSize:\s*(['"])clamp\(([^)]+)\)\1/g, (m, q, inner) => {
    const newInner = inner.replace(/(\d+)px/g, (mm, n) => `${mapPx(Number(n))}px`);
    return `fontSize: ${q}clamp(${newInner})${q}`;
  });

  // 6) CSS font-size: Npx
  s = s.replace(/font-size:\s*(\d+)px/g, (m, n) => `font-size: ${mapPx(Number(n))}px`);

  // 7) CSS font-size: clamp(...)
  s = s.replace(/font-size:\s*clamp\(([^)]+)\)/g, (m, inner) => {
    const newInner = inner.replace(/(\d+)px/g, (mm, n) => `${mapPx(Number(n))}px`);
    return `font-size: clamp(${newInner})`;
  });

  return s;
}

const files = walk(ROOT);
let changed = 0;
for (const f of files) {
  const rel = path.relative(ROOT, f);
  if (SKIP_FILES.has(path.normalize(rel))) continue;
  const orig = fs.readFileSync(f, 'utf8');
  const next = transform(orig);
  if (next !== orig) {
    if (!DRY) fs.writeFileSync(f, next, 'utf8');
    changed++;
    console.log((DRY ? '[dry] ' : '') + 'updated:', path.relative(ROOT, f));
  }
}
console.log(`\n${changed} file(s) ${DRY ? 'would be ' : ''}changed.`);
