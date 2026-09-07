'use strict';

const assert = require('assert');
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

const ROOT = path.join(__dirname, '..');

function copyFixture(root) {
    for (const name of ['data', 'docs', 'scripts', 'README.md']) fs.cpSync(path.join(ROOT, name), path.join(root, name), { recursive: true });
}

test('reviewed source change reaches human HTML, API, and MCP from one build', () => {
    const fixtureRoot = fs.mkdtempSync(path.join(require('os').tmpdir(), 'ai-tool-watch-publication-'));
    try {
        copyFixture(fixtureRoot);
        const sourceFile = path.join(fixtureRoot, 'data', 'platforms', 'chatgpt.md');
        const original = fs.readFileSync(sourceFile, 'utf8');
        const before = 'GPT-Live-1 mini; web + mobile only, no desktop app';
        const after = 'Fixture GPT-Live-1 mini; web + mobile only, no desktop app';
        assert.ok(original.includes(before), 'fixture source must contain the reviewed plan note');
        fs.writeFileSync(sourceFile, original.replace(before, after));

        const env = { ...process.env, AI_TOOL_WATCH_ROOT: fixtureRoot, AI_TOOL_WATCH_PUBLICATION_FIXTURE: 'chatgpt-advanced-voice-mode' };
        execFileSync(process.execPath, [path.join(fixtureRoot, 'scripts', 'sync-evidence.js')], { cwd: fixtureRoot, env });
        execFileSync(process.execPath, [path.join(fixtureRoot, 'scripts', 'validate-ontology.js')], { cwd: fixtureRoot, env });
        execFileSync(process.execPath, [path.join(fixtureRoot, 'scripts', 'build.js')], { cwd: fixtureRoot, env });
        const output = execFileSync(process.execPath, [path.join(fixtureRoot, 'scripts', 'validate-publication.js')], { cwd: fixtureRoot, env, encoding: 'utf8' });
        assert.match(output, /Publication fixture chatgpt-advanced-voice-mode is coherent/);

        const api = JSON.parse(fs.readFileSync(path.join(fixtureRoot, 'docs', 'api', 'v1', 'implementations.json'), 'utf8'));
        assert.equal(api.implementations.find(item => item.id === 'chatgpt-advanced-voice-mode').plans[0].notes, after);
        assert.ok(fs.readFileSync(path.join(fixtureRoot, 'docs', 'implementations.html'), 'utf8').includes(after));
    } finally {
        fs.rmSync(fixtureRoot, { recursive: true, force: true });
    }
});

test('an invalid reviewed fixture blocks publication validation', () => {
    const result = spawnSync(process.execPath, ['scripts/validate-publication.js'], {
        cwd: ROOT,
        env: { ...process.env, AI_TOOL_WATCH_PUBLICATION_FIXTURE: 'missing-reviewed-fixture' },
        encoding: 'utf8'
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Publication validation failed/);
});

test('an isolated artifact field mutation is rejected before deployment', () => {
    const fixtureRoot = fs.mkdtempSync(path.join(require('os').tmpdir(), 'ai-tool-watch-publication-'));
    try {
        copyFixture(fixtureRoot);
        const apiFile = path.join(fixtureRoot, 'docs', 'api', 'v1', 'implementations.json');
        const original = fs.readFileSync(apiFile, 'utf8');
        const api = JSON.parse(original);
        api.implementations.find(item => item.id === 'chatgpt-advanced-voice-mode').gating = 'tampered';
        fs.writeFileSync(apiFile, `${JSON.stringify(api, null, 2)}\n`);
        const result = spawnSync(process.execPath, [path.join(fixtureRoot, 'scripts', 'validate-publication.js')], { cwd: fixtureRoot, env: { ...process.env, AI_TOOL_WATCH_ROOT: fixtureRoot }, encoding: 'utf8' });
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /Human data export disagrees/);
    } finally {
        fs.rmSync(fixtureRoot, { recursive: true, force: true });
    }
});
