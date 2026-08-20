import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checks = [];

function projectPath(relative) {
  return path.join(root, relative);
}

function read(relative) {
  return fs.readFileSync(projectPath(relative), 'utf8');
}

function record(name, passed, detail) {
  checks.push({ name, status: passed ? 'PASS' : 'FAIL', detail });
}

const requiredFiles = [
  'README.md',
  'notes.md',
  'progress.md',
  'product-specs/README.md',
  'product-specs/AGENTS.md',
  'product-specs/01-artifact-contract.md',
  'product-specs/02-production-process.md',
  'product-specs/03-agent-definitions.md',
  'product-specs/04-quality-gates.md',
  'product-specs/05-adoption-guide.md',
  'product-specs/templates/project-profile-template.md',
  'product-specs/templates/artifact-spec-template.md',
  'product-specs/templates/work-order-template.md',
  'product-specs/templates/acceptance-report-template.md',
  'product-specs/templates/deviation-register-template.md',
  'product-specs/examples/guiyun-vertical-slice.md',
  'scripts/validate-spec-process.mjs',
];

const missingFiles = requiredFiles.filter((relative) => !fs.existsSync(projectPath(relative)));
record('required-files', missingFiles.length === 0, missingFiles.length ? missingFiles.join(', ') : `${requiredFiles.length} files present`);

const obsoleteFiles = [
  'product-specs/01-specification-model.md',
  'product-specs/02-design-content-products.md',
  'product-specs/03-engineering-products.md',
  'product-specs/04-visual-products.md',
  'product-specs/05-quality-products.md',
  'product-specs/06-agent-production-workflow.md',
  'product-specs/07-agent-definitions.md',
  'product-specs/verification/baseline-acceptance.md',
  'product-specs/verification/baseline-static-validation.json',
  'scripts/validate-project.mjs',
];

const obsoleteRemaining = obsoleteFiles.filter((relative) => fs.existsSync(projectPath(relative)));
record('obsolete-files-removed', obsoleteRemaining.length === 0, obsoleteRemaining.length ? obsoleteRemaining.join(', ') : `${obsoleteFiles.length} obsolete paths absent`);

const coreFiles = [
  'product-specs/README.md',
  'product-specs/AGENTS.md',
  'product-specs/01-artifact-contract.md',
  'product-specs/02-production-process.md',
  'product-specs/03-agent-definitions.md',
  'product-specs/04-quality-gates.md',
  'product-specs/05-adoption-guide.md',
  'product-specs/templates/project-profile-template.md',
  'product-specs/templates/artifact-spec-template.md',
  'product-specs/templates/work-order-template.md',
  'product-specs/templates/acceptance-report-template.md',
  'product-specs/templates/deviation-register-template.md',
];

const coreText = coreFiles.map((relative) => read(relative)).join('\n');
const projectTerms = ['归云录', '沈烬尘', 'GUIYUN', 'Three.js'];
const leakedTerms = projectTerms.filter((term) => coreText.includes(term));
record('reusable-core', leakedTerms.length === 0, leakedTerms.length ? `project terms: ${leakedTerms.join(', ')}` : 'no example project facts in reusable core');

const artifactText = read('product-specs/01-artifact-contract.md');
const baseSpecIds = [
  'PRJ.PROFILE',
  'DSN.SLICE',
  'DSN.FLOW',
  'DSN.SYSTEM',
  'ENG.RUNTIME',
  'VIS.PACK',
  'QA.PLAN',
  'QA.EVIDENCE',
  'OPS.RELEASE',
  'OPS.DECISION',
];
const missingBaseSpecs = baseSpecIds.filter((id) => !artifactText.includes(`\`${id}\``));
record('artifact-catalog', missingBaseSpecs.length === 0, missingBaseSpecs.length ? `missing: ${missingBaseSpecs.join(', ')}` : `${baseSpecIds.length} base specifications`);

const processText = read('product-specs/02-production-process.md');
const phases = Array.from({ length: 8 }, (_, index) => `P${index}`);
const missingPhases = phases.filter((phase) => !processText.includes(`## ${Number(phase.slice(1)) + 2}. ${phase}`));
record('production-phases', missingPhases.length === 0, missingPhases.length ? `missing: ${missingPhases.join(', ')}` : phases.join(' → '));

const agentText = read('product-specs/03-agent-definitions.md');
const agentIds = [
  'production_coordinator',
  'specification_agent',
  'design_content_agent',
  'implementation_agent',
  'visual_agent',
  'qa_release_agent',
];
const missingAgents = agentIds.filter((id) => !agentText.includes(id));
record('agent-definitions', missingAgents.length === 0, missingAgents.length ? `missing: ${missingAgents.join(', ')}` : `${agentIds.length} agents`);

const qualityText = read('product-specs/04-quality-gates.md');
const gateNames = ['L0 结构', 'L1 逻辑', 'L2 集成', 'L3 体验', '发布门'];
const missingGates = gateNames.filter((name) => !qualityText.includes(name));
record('quality-gates', missingGates.length === 0, missingGates.length ? `missing: ${missingGates.join(', ')}` : gateNames.join(', '));

const templateContracts = {
  'product-specs/templates/project-profile-template.md': ['{{PROJECT_ID}}', '{{CORE_EXPERIENCE}}', '{{LAUNCH_MODES}}', '{{NON_GOAL_1}}', '{{L3}}'],
  'product-specs/templates/artifact-spec-template.md': ['{{BASE_SPEC_ID}}', '{{OUTPUT_PATH}}', '{{CONSUMER}}', '{{L3_ASSERTION}}', '{{ROLLBACK_POINT}}'],
  'product-specs/templates/work-order-template.md': ['{{WORK_ORDER_ID}}', '{{ONE_VERIFIABLE_GOAL}}', '{{ALLOWED_PATHS}}', '{{FROZEN_CONTRACTS}}', '{{L3_CHECK}}'],
  'product-specs/templates/acceptance-report-template.md': ['{{COMMIT_OR_VERSION}}', '{{L0_ACTUAL}}', '{{GOLDEN_ACTUAL}}', '{{DEVIATION_ID}}', '{{FINAL_DECISION_AND_NEXT_STEP}}'],
  'product-specs/templates/deviation-register-template.md': ['DEV-{{PROJECT_ID}}-001', '{{EXPECTED}}', '{{ACTUAL}}', '{{OWNER}}', '{{REGRESSION}}'],
};

const templateFailures = [];
for (const [relative, tokens] of Object.entries(templateContracts)) {
  const text = read(relative);
  const missing = tokens.filter((token) => !text.includes(token));
  if (missing.length) templateFailures.push(`${relative}: ${missing.join(', ')}`);
}
record('template-contracts', templateFailures.length === 0, templateFailures.length ? templateFailures.join('; ') : `${Object.keys(templateContracts).length} templates complete`);

const exampleText = read('product-specs/examples/guiyun-vertical-slice.md');
const exampleFacts = ['GUIYUN', 'P0–P7', '54cc820', '913f844', '120.5 秒', '844×390', 'DEV-GUIYUN-001'];
const missingExampleFacts = exampleFacts.filter((fact) => !exampleText.includes(fact));
record('filled-example', missingExampleFacts.length === 0, missingExampleFacts.length ? `missing: ${missingExampleFacts.join(', ')}` : 'actual project process and evidence represented');

const markdownFiles = [
  'README.md',
  ...coreFiles,
  'product-specs/examples/guiyun-vertical-slice.md',
];
const brokenLinks = [];
for (const relative of markdownFiles) {
  const text = read(relative);
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || /^(?:https?:|mailto:)/.test(target) || target.includes('{{')) continue;
    const resolved = path.resolve(path.dirname(projectPath(relative)), decodeURIComponent(target));
    if (!fs.existsSync(resolved)) brokenLinks.push(`${relative} -> ${target}`);
  }
}
record('markdown-links', brokenLinks.length === 0, brokenLinks.length ? brokenLinks.join('; ') : `${markdownFiles.length} documents checked`);

const rootReadme = read('README.md');
record(
  'project-entry',
  rootReadme.includes('product-specs/README.md') && rootReadme.includes('node scripts/validate-spec-process.mjs'),
  'root README links reusable process and validator'
);

const failures = checks.filter((check) => check.status === 'FAIL');
console.log(JSON.stringify({
  schemaVersion: '1.0.0',
  result: failures.length ? 'FAIL' : 'PASS',
  checkedAt: new Date().toISOString(),
  checks,
  failures: failures.length,
}, null, 2));

if (failures.length) process.exitCode = 1;
