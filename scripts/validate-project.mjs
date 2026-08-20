import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const results = [];

function pass(name, detail = '') {
  results.push({ name, status: 'PASS', detail });
}

function fail(name, detail) {
  results.push({ name, status: 'FAIL', detail });
}

function check(name, condition, detail) {
  if (condition) pass(name, detail);
  else fail(name, detail);
}

function projectPath(relative) {
  return path.join(root, relative);
}

function read(relative) {
  return fs.readFileSync(projectPath(relative), 'utf8');
}

function pngSize(buffer) {
  const signature = '89504e470d0a1a0a';
  if (buffer.subarray(0, 8).toString('hex') !== signature) return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20), format: 'PNG' };
}

function jpegSize(buffer) {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  const startOfFrame = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    if (marker === 0xd8 || marker === 0xd9 || marker === 0x01) {
      offset += 2;
      continue;
    }
    const length = buffer.readUInt16BE(offset + 2);
    if (startOfFrame.has(marker)) {
      return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5), format: 'JPEG' };
    }
    if (length < 2) return null;
    offset += 2 + length;
  }
  return null;
}

const requiredFiles = [
  'index.html',
  'README.md',
  'notes.md',
  'progress.md',
  'styles.css',
  'ui.css',
  'vendor/three.min.js',
  'vendor/THREE-LICENSE.txt',
  'assets/generated/README.md',
  'assets/textures/README.md',
  'src/config.js',
  'src/materials.js',
  'src/entities.js',
  'src/audio.js',
  'src/world.js',
  'src/ui.js',
  'src/combat.js',
  'src/core.js',
  'product-specs/README.md',
  'product-specs/01-specification-model.md',
  'product-specs/02-design-content-products.md',
  'product-specs/03-engineering-products.md',
  'product-specs/04-visual-products.md',
  'product-specs/05-quality-products.md',
  'product-specs/06-agent-production-workflow.md',
  'product-specs/07-agent-definitions.md',
  'product-specs/AGENTS.md',
  'product-specs/templates/artifact-spec-template.md',
  'product-specs/templates/work-order-template.md',
  'product-specs/templates/acceptance-report-template.md',
  'product-specs/verification/baseline-acceptance.md',
  'product-specs/verification/baseline-static-validation.json',
];

const missing = requiredFiles.filter((relative) => !fs.existsSync(projectPath(relative)));
check('required-files', missing.length === 0, missing.length ? `missing: ${missing.join(', ')}` : `${requiredFiles.length} files present`);

const index = read('index.html');
const scriptOrder = [
  'vendor/three.min.js',
  'src/config.js',
  'src/materials.js',
  'src/entities.js',
  'src/audio.js',
  'src/world.js',
  'src/ui.js',
  'src/combat.js',
  'src/core.js',
];
const sourceChecks = scriptOrder
  .filter((relative) => relative.startsWith('src/'))
  .map((relative) => ({
    relative,
    result: spawnSync(process.execPath, ['--check', projectPath(relative)], { encoding: 'utf8' }),
  }));
const sourceFailures = sourceChecks.filter(({ result }) => result.status !== 0);
check(
  'source-syntax',
  sourceFailures.length === 0,
  sourceFailures.length
    ? sourceFailures.map(({ relative, result }) => `${relative}: ${(result.stderr || result.stdout).trim()}`).join('; ')
    : `${sourceChecks.length} scripts parsed`
);

let previous = -1;
let ordered = true;
for (const source of scriptOrder) {
  const current = index.indexOf(`src="${source}"`);
  if (current <= previous) ordered = false;
  previous = current;
}
check('classic-script-order', ordered && !index.includes('type="module"'), scriptOrder.join(' -> '));

const vendorPrefix = fs.readFileSync(projectPath('vendor/three.min.js')).subarray(0, 400).toString('utf8');
check('three-revision', vendorPrefix.includes('const e="149"'), 'expected bundled Three.js r149');

const config = read('src/config.js');
const expectedStages = [
  'TITLE', 'GATE_OFFER', 'ROAD_TO_BRIDGE', 'BRIDGE_CROSSING', 'VILLAGE_ARRIVAL',
  'TEMPLE_DEFENSE', 'BOSS_INTRO', 'BOSS_FIGHT', 'RETURN_TO_GATE', 'COMPLETE',
];
const missingStages = expectedStages.filter((stage) => !config.includes(`${stage}: '${stage}'`));
check('quest-stage-contract', missingStages.length === 0, missingStages.length ? `missing: ${missingStages.join(', ')}` : `${expectedStages.length} stages`);

const expectedRoles = ['spear', 'archer', 'healer', 'scout'];
const missingRoles = expectedRoles.filter((role) => !config.includes(`${role}:`));
check('party-role-contract', missingRoles.length === 0, missingRoles.length ? `missing: ${missingRoles.join(', ')}` : expectedRoles.join(', '));

const core = read('src/core.js');
check(
  'qa-bridge-contract',
  core.includes('window.render_game_to_text') && core.includes('window.advanceTime') && core.includes('window.__GY_TEST__'),
  'render_game_to_text, advanceTime and debug bridge present'
);

const materials = read('src/materials.js');
check(
  'texture-protocol-contract',
  materials.includes("window.location.protocol === 'file:'")
    && materials.includes('THREE.CanvasTexture')
    && materials.includes('THREE.TextureLoader'),
  'file:// local-safe textures and HTTP image textures present'
);

const expectedAssets = [
  ['assets/generated/title-hero.png', 1672, 941, 'PNG'],
  ['assets/generated/distant-valley.png', 1915, 821, 'PNG'],
  ['assets/textures/robe-cloth-512.jpg', 512, 512, 'JPEG'],
  ['assets/textures/bluestone-512.jpg', 512, 512, 'JPEG'],
  ['assets/textures/dark-cedar-512.jpg', 512, 512, 'JPEG'],
];
for (const [relative, width, height, format] of expectedAssets) {
  if (!fs.existsSync(projectPath(relative))) {
    fail(`asset:${relative}`, 'file missing');
    continue;
  }
  const buffer = fs.readFileSync(projectPath(relative));
  const size = format === 'PNG' ? pngSize(buffer) : jpegSize(buffer);
  check(
    `asset:${relative}`,
    size && size.width === width && size.height === height && size.format === format,
    size ? `${size.format} ${size.width}x${size.height}` : 'unrecognized image data'
  );
}

const specFiles = fs.readdirSync(projectPath('product-specs'))
  .filter((name) => /^\d\d-.*\.md$/.test(name))
  .map((name) => `product-specs/${name}`);
const specText = specFiles.map((relative) => read(relative)).join('\n');
const bannedSampleTerms = ['青砚渡', 'wuxia-demo', 'Phaser'];
const foundBanned = bannedSampleTerms.filter((term) => specText.includes(term));
check('project-specific-specs', foundBanned.length === 0, foundBanned.length ? `foreign sample terms: ${foundBanned.join(', ')}` : 'no foreign sample instances');

for (const prefix of ['DSN', 'ENG', 'VIS', 'QA', 'OPS']) {
  const pattern = new RegExp(`\\b${prefix}(?:\\.[A-Z0-9_]+)+\\.GUIYUN(?:_[A-Z0-9_]+)?\\b`, 'g');
  const ids = new Set(specText.match(pattern) || []);
  check(`spec-id:${prefix}`, ids.size > 0, ids.size ? `${ids.size} concrete IDs` : 'no GUIYUN concrete ID found');
}

const markdownFiles = [
  'README.md',
  ...specFiles,
  'product-specs/README.md',
  'product-specs/AGENTS.md',
  'product-specs/templates/artifact-spec-template.md',
  'product-specs/templates/work-order-template.md',
  'product-specs/templates/acceptance-report-template.md',
  'product-specs/verification/baseline-acceptance.md',
];
const brokenLinks = [];
for (const relative of markdownFiles) {
  const text = read(relative);
  const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
  for (const match of text.matchAll(linkPattern)) {
    const target = match[1].split('#')[0];
    if (!target || /^(?:https?:|mailto:)/.test(target) || target.includes('<')) continue;
    const resolved = path.resolve(path.dirname(projectPath(relative)), decodeURIComponent(target));
    if (!fs.existsSync(resolved)) brokenLinks.push(`${relative} -> ${target}`);
  }
}
check('markdown-links', brokenLinks.length === 0, brokenLinks.length ? brokenLinks.join('; ') : `${markdownFiles.length} documents checked`);

const failed = results.filter((result) => result.status === 'FAIL');
console.log(JSON.stringify({
  result: failed.length ? 'FAIL' : 'PASS',
  checkedAt: new Date().toISOString(),
  checks: results,
  failures: failed.length,
}, null, 2));

if (failed.length) process.exitCode = 1;
