import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2] || '.';
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'dist', 'build', 'scripts']);
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

function transform(s) {
  let next = s;
  // color: '#4a5a8a' → color: '#7e94c8' (only inline style/JSX inline objects — `color:` property)
  next = next.replace(/(color\s*:\s*)(["'])#4a5a8a(["'])/g, (m, k, q1, q2) => `${k}${q1}#7e94c8${q2}`);
  // Tailwind text-[#4a5a8a] → text-[#7e94c8]
  next = next.replace(/text-\[#4a5a8a\]/g, "text-[#7e94c8]");
  return next;
}

const files = walk(ROOT);
let changed = 0;
for (const f of files) {
  const orig = fs.readFileSync(f, 'utf8');
  const next = transform(orig);
  if (next !== orig) {
    fs.writeFileSync(f, next, 'utf8');
    changed++;
    console.log('updated:', path.relative(ROOT, f));
  }
}
console.log(`\n${changed} files changed.`);
