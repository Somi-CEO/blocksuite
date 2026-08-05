/**
 * Remap @blocksuite/* workspace packages for GitHub Packages publish under @somi-co.
 *
 * Mutates package.json files in the working tree only (do not commit).
 *
 * Mapping: @blocksuite/foo → @somi-co/blocksuite-foo
 *
 * Usage:
 *   node scripts/somi/remap-for-gh-packages.mjs [--version=0.19.5-somi.0]
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const GH_REGISTRY = 'https://npm.pkg.github.com';
const REPO_URL = 'https://github.com/somi-co/blocksuite';

const versionArg = process.argv.find((a) => a.startsWith('--version='));
const TARGET_VERSION = versionArg ? versionArg.slice('--version='.length) : '0.19.5-somi.0';

/** External @blocksuite/* packages that live on npmjs, not this monorepo — do not remap. */
const EXTERNAL_BLOCKSUITE = new Set([
  '@blocksuite/icons',
]);

function remapScopeName(name) {
  if (typeof name !== 'string') return name;
  if (EXTERNAL_BLOCKSUITE.has(name)) return name;
  if (name.startsWith('@blocksuite/')) {
    return `@somi-co/blocksuite-${name.slice('@blocksuite/'.length)}`;
  }
  return name;
}

function remapDepValue(value) {
  if (typeof value !== 'string') return value;
  if (value === 'workspace:*' || value.startsWith('workspace:')) {
    return TARGET_VERSION;
  }
  // Pin same-lineage versions to the Somi publish version
  if (/^\d+\.\d+\.\d+/.test(value) || value.startsWith('^') || value.startsWith('~')) {
    return TARGET_VERSION;
  }
  return value;
}

function remapDepsObject(deps) {
  if (!deps || typeof deps !== 'object') return deps;
  const out = {};
  for (const [key, value] of Object.entries(deps)) {
    if (EXTERNAL_BLOCKSUITE.has(key)) {
      out[key] = value;
      continue;
    }
    const nextKey = remapScopeName(key);
    // Only rewrite versions for remapped @blocksuite (now @somi-co) deps
    if (key.startsWith('@blocksuite/')) {
      out[nextKey] = remapDepValue(value);
    } else {
      out[nextKey] = value;
    }
  }
  return out;
}

function walkPackageJsons(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry === 'lib' || entry === '.git') continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walkPackageJsons(full, acc);
    } else if (entry === 'package.json') {
      acc.push(full);
    }
  }
  return acc;
}

const DEP_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
];

const candidates = [
  ...walkPackageJsons(join(ROOT, 'packages')),
];

let remapped = 0;
let skipped = 0;
const publishedNames = [];

for (const pkgPath of candidates) {
  const raw = readFileSync(pkgPath, 'utf8');
  const pkg = JSON.parse(raw);

  if (!pkg.name || !pkg.name.startsWith('@blocksuite/')) {
    skipped += 1;
    continue;
  }
  if (pkg.private === true) {
    skipped += 1;
    continue;
  }

  pkg.name = remapScopeName(pkg.name);
  pkg.version = TARGET_VERSION;
  pkg.repository = {
    type: 'git',
    url: REPO_URL,
  };
  pkg.bugs = {
    url: `${REPO_URL}/issues`,
  };

  for (const field of DEP_FIELDS) {
    if (pkg[field]) {
      pkg[field] = remapDepsObject(pkg[field]);
    }
  }

  // Yarn `npm publish` promotes publishConfig.{exports,main,module,types,...} into the
  // tarball package.json. Plain `npm publish` does not for all fields — so copy them
  // onto the package root before publish so consumers resolve dist/, not src/.
  const publishConfig = { ...(pkg.publishConfig || {}) };
  for (const key of ['exports', 'main', 'module', 'types', 'browser', 'bin']) {
    if (publishConfig[key] != null) {
      pkg[key] = publishConfig[key];
    }
  }
  delete publishConfig.exports;
  delete publishConfig.main;
  delete publishConfig.module;
  delete publishConfig.types;
  delete publishConfig.browser;
  delete publishConfig.bin;

  pkg.publishConfig = {
    ...publishConfig,
    registry: GH_REGISTRY,
    // Public fork → public packages (Somi Main CI / local can install without a packages PAT
    // when org package visibility allows; Actions still use GH_PACKAGES_TOKEN / GITHUB_TOKEN).
    access: 'public',
  };

  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
  remapped += 1;
  publishedNames.push(pkg.name);
}

publishedNames.sort();
writeFileSync(
  join(ROOT, 'scripts/somi/last-remap-manifest.json'),
  `${JSON.stringify({ version: TARGET_VERSION, packages: publishedNames }, null, 2)}\n`,
  'utf8',
);

console.log(`Remapped ${remapped} packages to ${TARGET_VERSION} (skipped ${skipped}).`);
console.log(`Manifest: scripts/somi/last-remap-manifest.json (${publishedNames.length} names)`);
