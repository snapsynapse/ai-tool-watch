'use strict';

const assert = require('assert');
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');

const ROOT = path.join(__dirname, '..');
const FIXTURE = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'publication-correction.json'), 'utf8'));

function copyFixture(root) {
    for (const name of ['data', 'docs', 'scripts', 'README.md']) {
        fs.cpSync(path.join(ROOT, name), path.join(root, name), { recursive: true });
    }
}

function tableRow({ plan, available, limits, notes }) {
    return `| ${plan} | ${available} | ${limits} | ${notes} |`;
}

function initialFeatureMarkdown(fixture) {
    assert.equal(
        fixture.feature_url,
        fixture.sources[0].url,
        'synthetic first evidence URL must be visible as the feature URL'
    );
    const availabilityRows = [...fixture.plans.unrelated, fixture.plans.erroneous_legacy]
        .map(tableRow)
        .join('\n');
    const sourceRows = fixture.sources.map(source => `- [${source.title}](${source.url})`).join('\n');
    return `
---

## ${fixture.source_heading}

| Property | Value |
|----------|-------|
| Category | other |
| Status   | ga |
| Gating   | mixed |
| URL      | ${fixture.feature_url} |
| Launched | ${fixture.dates.launched} |
| Verified | ${fixture.dates.verified} |
| Checked  | ${fixture.dates.checked} |

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
${availabilityRows}

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| web | ✅ | Synthetic publication fixture |

### Regional

Synthetic fixture; no regional claim.

### Talking Point

> "${fixture.base_talking_point}"

### Sources

${sourceRows}

### Changelog

| Date | Change |
|------|--------|
| ${fixture.historical_entry.date} | ${fixture.historical_entry.change} |
`;
}

function appendSyntheticImplementation(root, fixture) {
    const sourcePath = path.join(root, fixture.source_file);
    fs.appendFileSync(sourcePath, initialFeatureMarkdown(fixture));

    const mapping = `
- id: ${fixture.implementation_id}
  product: ${fixture.product}
  provider: ${fixture.provider}
  source_file: ${fixture.source_file}
  source_heading: ${fixture.source_heading}
  capabilities:
${fixture.capabilities.map(capability => `    - ${capability}`).join('\n')}
`;
    fs.appendFileSync(path.join(root, 'data', 'implementations', 'index.yml'), mapping);
}

function applyAcceptedCorrection(source, fixture) {
    const legacyRow = `${tableRow(fixture.plans.erroneous_legacy)}\n`;
    assert.equal(source.split(legacyRow).length - 1, 1, 'synthetic source must contain exactly one erroneous legacy row');

    const oldTalkingPoint = `> "${fixture.base_talking_point}"`;
    assert.equal(source.split(oldTalkingPoint).length - 1, 1, 'synthetic source must contain exactly one unscoped talking point');

    const changelogHeader = '| Date | Change |\n|------|--------|\n';
    const correctionRow = `| ${fixture.correction.date} | ${fixture.correction.change} |\n`;
    assert.equal(source.split(changelogHeader).length - 1 > 0, true, 'synthetic source must contain a changelog');

    return source
        .replace(legacyRow, '')
        .replace(oldTalkingPoint, `> "${fixture.base_talking_point} ${fixture.coverage_note}"`)
        .replace(
            `${changelogHeader}| ${fixture.historical_entry.date} | ${fixture.historical_entry.change} |\n`,
            `${changelogHeader}${correctionRow}| ${fixture.historical_entry.date} | ${fixture.historical_entry.change} |\n`
        );
}

function parseSyntheticFeature(root, fixture) {
    const { parsePlatform } = require(path.join(root, 'scripts', 'lib', 'parser.js'));
    const platform = parsePlatform(path.join(root, fixture.source_file));
    const feature = platform.features.find(item => item.name === fixture.source_heading);
    assert.ok(feature, `missing synthetic feature ${fixture.source_heading}`);
    return feature;
}

function sourceBaseline(feature, fixture) {
    return {
        checked: feature.checked,
        verified: feature.verified,
        unrelatedPlans: feature.availability.filter(plan => plan.plan !== fixture.plans.erroneous_legacy.plan)
    };
}

function assertAcceptedSourceCorrection(feature, baseline, fixture) {
    assert.equal(feature.checked, baseline.checked, 'Checked date drifted during a content correction');
    assert.equal(feature.verified, baseline.verified, 'Verified date drifted during a content correction');
    assert.deepEqual(
        feature.availability.filter(plan => plan.plan !== fixture.plans.erroneous_legacy.plan),
        baseline.unrelatedPlans,
        'unrelated plan entitlements changed during legacy-row correction'
    );
    assert.equal(
        feature.availability.some(plan => plan.plan === fixture.plans.erroneous_legacy.plan),
        false,
        'unsupported legacy unavailability row was reintroduced'
    );
    assert.ok(feature.talking_point.includes(fixture.coverage_note), 'new-customer coverage note was dropped');
    assert.ok(
        feature.changelog.some(entry => entry.date === fixture.correction.date && entry.change === fixture.correction.change),
        'dated correction provenance was dropped'
    );
    assert.ok(
        feature.changelog.some(entry => entry.date === fixture.historical_entry.date && entry.change === fixture.historical_entry.change),
        'historical entry was silently rewritten instead of annotated'
    );
}

function callMcp(root, fixture) {
    const requests = [
        {
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'publication-correction-test', version: '1.0.0' } }
        },
        {
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/call',
            params: { name: 'get_product', arguments: { id: fixture.product } }
        },
        {
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: { name: 'get_evidence', arguments: { implementation_id: fixture.implementation_id } }
        }
    ];
    const result = spawnSync(process.execPath, [path.join(root, 'scripts', 'mcp-server.js')], {
        cwd: root,
        env: { ...process.env, AI_TOOL_WATCH_DATA_DIR: path.join(root, 'docs', 'api', 'v1') },
        input: `${requests.map(request => JSON.stringify(request)).join('\n')}\n`,
        encoding: 'utf8'
    });
    assert.equal(result.status, 0, result.stderr);
    const responses = result.stdout.trim().split('\n').map(line => JSON.parse(line));
    const decode = id => JSON.parse(responses.find(response => response.id === id).result.content[0].text).data;
    return { product: decode(2), evidence: decode(3) };
}

test('accepted Copilot correction reaches HTML, API, evidence, and MCP without entitlement or date drift', () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-tool-watch-correction-'));
    try {
        copyFixture(fixtureRoot);
        appendSyntheticImplementation(fixtureRoot, FIXTURE);

        const before = parseSyntheticFeature(fixtureRoot, FIXTURE);
        const baseline = sourceBaseline(before, FIXTURE);
        assert.ok(before.availability.some(plan => plan.plan === FIXTURE.plans.erroneous_legacy.plan));
        assert.equal(before.talking_point.includes(FIXTURE.coverage_note), false);

        const sourcePath = path.join(fixtureRoot, FIXTURE.source_file);
        fs.writeFileSync(sourcePath, applyAcceptedCorrection(fs.readFileSync(sourcePath, 'utf8'), FIXTURE));
        const corrected = parseSyntheticFeature(fixtureRoot, FIXTURE);
        assertAcceptedSourceCorrection(corrected, baseline, FIXTURE);

        const env = {
            ...process.env,
            AI_TOOL_WATCH_ROOT: fixtureRoot,
            AI_TOOL_WATCH_PUBLICATION_FIXTURE: FIXTURE.implementation_id
        };
        execFileSync(process.execPath, [path.join(fixtureRoot, 'scripts', 'sync-evidence.js')], { cwd: fixtureRoot, env });
        execFileSync(process.execPath, [path.join(fixtureRoot, 'scripts', 'validate-ontology.js')], { cwd: fixtureRoot, env });
        execFileSync(process.execPath, [path.join(fixtureRoot, 'scripts', 'build.js')], { cwd: fixtureRoot, env });
        const validation = execFileSync(process.execPath, [path.join(fixtureRoot, 'scripts', 'validate-publication.js')], {
            cwd: fixtureRoot,
            env,
            encoding: 'utf8'
        });
        assert.match(validation, new RegExp(`Publication fixture ${FIXTURE.implementation_id} is coherent`));

        const implementations = JSON.parse(fs.readFileSync(path.join(fixtureRoot, 'docs', 'api', 'v1', 'implementations.json'), 'utf8'));
        const apiFeature = implementations.implementations.find(item => item.id === FIXTURE.implementation_id);
        assert.ok(apiFeature, 'corrected implementation missing from API');
        assert.equal(apiFeature.verified, baseline.verified);
        assert.deepEqual(
            apiFeature.plans,
            baseline.unrelatedPlans.map(plan => ({ ...plan, available: plan.available === '✅' }))
        );
        assert.ok(apiFeature.talking_point.includes(FIXTURE.coverage_note));
        assert.equal(apiFeature.plans.some(plan => plan.plan === FIXTURE.plans.erroneous_legacy.plan), false);

        const evidence = JSON.parse(fs.readFileSync(path.join(fixtureRoot, 'docs', 'api', 'v1', 'evidence.json'), 'utf8'));
        const apiEvidence = evidence.evidence.find(item => item.entity_id === FIXTURE.implementation_id);
        assert.ok(apiEvidence, 'correction evidence missing from API');
        assert.equal(apiEvidence.checked, baseline.checked);
        assert.equal(apiEvidence.verified, baseline.verified);
        assert.ok(apiEvidence.changelog.some(entry => entry.change === FIXTURE.correction.change));
        assert.ok(apiEvidence.changelog.some(entry => entry.change === FIXTURE.historical_entry.change));

        const html = fs.readFileSync(path.join(fixtureRoot, 'docs', 'implementations.html'), 'utf8');
        assert.ok(html.includes(FIXTURE.coverage_note), 'coverage note missing from human HTML');
        assert.ok(html.includes(FIXTURE.correction.change), 'correction provenance missing from human HTML changelog data');
        assert.equal(html.includes(FIXTURE.plans.erroneous_legacy.notes), false, 'removed retirement assertion remains in human HTML');

        const mcp = callMcp(fixtureRoot, FIXTURE);
        const mcpFeature = mcp.product.implementation_details.find(item => item.id === FIXTURE.implementation_id);
        assert.ok(mcpFeature, 'corrected implementation missing from MCP get_product');
        assert.equal(mcpFeature.verified, baseline.verified);
        assert.deepEqual(mcpFeature.plans, apiFeature.plans);
        assert.ok(mcpFeature.talking_point.includes(FIXTURE.coverage_note));
        assert.equal(mcpFeature.plans.some(plan => plan.plan === FIXTURE.plans.erroneous_legacy.plan), false);
        assert.equal(mcp.evidence.checked, baseline.checked);
        assert.equal(mcp.evidence.verified, baseline.verified);
        assert.ok(mcp.evidence.changelog.some(entry => entry.change === FIXTURE.correction.change));
        assert.ok(mcp.evidence.changelog.some(entry => entry.change === FIXTURE.historical_entry.change));
    } finally {
        fs.rmSync(fixtureRoot, { recursive: true, force: true });
    }
});

test('correction contract rejects dropped scope, a reintroduced row, date drift, and lost provenance', async t => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-tool-watch-correction-contract-'));
    try {
        copyFixture(fixtureRoot);
        appendSyntheticImplementation(fixtureRoot, FIXTURE);
        const sourcePath = path.join(fixtureRoot, FIXTURE.source_file);
        fs.writeFileSync(sourcePath, applyAcceptedCorrection(fs.readFileSync(sourcePath, 'utf8'), FIXTURE));
        const corrected = parseSyntheticFeature(fixtureRoot, FIXTURE);
        const baseline = {
            checked: FIXTURE.dates.checked,
            verified: FIXTURE.dates.verified,
            unrelatedPlans: FIXTURE.plans.unrelated
        };
        assertAcceptedSourceCorrection(corrected, baseline, FIXTURE);

        const clone = value => JSON.parse(JSON.stringify(value));
        await t.test('dropped new-customer scope note', () => {
            const candidate = clone(corrected);
            candidate.talking_point = FIXTURE.base_talking_point;
            assert.throws(() => assertAcceptedSourceCorrection(candidate, baseline, FIXTURE), /coverage note was dropped/);
        });
        await t.test('reintroduced unsupported legacy row', () => {
            const candidate = clone(corrected);
            candidate.availability.push(FIXTURE.plans.erroneous_legacy);
            assert.throws(() => assertAcceptedSourceCorrection(candidate, baseline, FIXTURE), /legacy unavailability row was reintroduced/);
        });
        await t.test('unrelated plan entitlement drift', () => {
            const candidate = clone(corrected);
            candidate.availability[0].limits = 'Changed allowance';
            assert.throws(() => assertAcceptedSourceCorrection(candidate, baseline, FIXTURE), /unrelated plan entitlements changed/);
        });
        await t.test('Checked or Verified date drift', () => {
            for (const field of ['checked', 'verified']) {
                const candidate = clone(corrected);
                candidate[field] = '2026-09-07';
                assert.throws(() => assertAcceptedSourceCorrection(candidate, baseline, FIXTURE), new RegExp(`${field}`, 'i'));
            }
        });
        await t.test('lost dated correction provenance', () => {
            const candidate = clone(corrected);
            candidate.changelog = candidate.changelog.filter(entry => entry.change !== FIXTURE.correction.change);
            assert.throws(() => assertAcceptedSourceCorrection(candidate, baseline, FIXTURE), /correction provenance was dropped/);
        });
        await t.test('silently rewritten historical entry', () => {
            const candidate = clone(corrected);
            candidate.changelog = candidate.changelog.filter(entry => entry.change !== FIXTURE.historical_entry.change);
            assert.throws(() => assertAcceptedSourceCorrection(candidate, baseline, FIXTURE), /historical entry was silently rewritten/);
        });
    } finally {
        fs.rmSync(fixtureRoot, { recursive: true, force: true });
    }
});
