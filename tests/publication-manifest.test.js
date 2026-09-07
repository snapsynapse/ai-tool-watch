'use strict';

const assert = require('assert');
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');

const ROOT = path.join(__dirname, '..');
const verifier = path.join(ROOT, 'scripts', 'verify-publication-manifest.js');

function copyArtifact() {
    const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-tool-watch-artifact-'));
    fs.cpSync(path.join(ROOT, 'docs'), fixture, { recursive: true });
    return fixture;
}

function verify(fixture) {
    return spawnSync(process.execPath, [verifier, fixture], { encoding: 'utf8' });
}

test('reviewed publication verifier rejects a modified artifact file', () => {
    const fixture = copyArtifact();
    try {
        const file = path.join(fixture, 'index.html');
        fs.appendFileSync(file, '\\nfixture tampering\\n');
        const result = verify(fixture);
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /artifact hash mismatch for index\.html/);
    } finally {
        fs.rmSync(fixture, { recursive: true, force: true });
    }
});

test('reviewed publication verifier rejects an unmanifested artifact file', () => {
    const fixture = copyArtifact();
    try {
        fs.writeFileSync(path.join(fixture, 'unexpected.txt'), 'not reviewed\\n');
        const result = verify(fixture);
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /artifact file inventory does not match manifest/);
    } finally {
        fs.rmSync(fixture, { recursive: true, force: true });
    }
});

test('desktop metadata cannot enter publication or change its reviewed-input identity', () => {
    const { sourceCandidate, removePublicationMetadata } = require('../scripts/prepare-publication');
    const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-tool-watch-metadata-'));
    try {
        for (const dir of ['data', 'scripts', 'docs/assets', 'docs/.well-known']) fs.mkdirSync(path.join(fixture, dir), { recursive: true });
        fs.writeFileSync(path.join(fixture, 'README.md'), 'reviewed source');
        fs.writeFileSync(path.join(fixture, 'data/claim.md'), 'accepted claim');
        const baseline = sourceCandidate(fixture);
        fs.writeFileSync(path.join(fixture, 'data/.DS_Store'), 'local metadata');
        assert.equal(sourceCandidate(fixture), baseline);
        for (const file of ['.DS_Store', 'assets/._logo.png', 'assets/Thumbs.db', '.nojekyll', '.well-known/security.txt']) {
            fs.writeFileSync(path.join(fixture, 'docs', file), file);
        }
        removePublicationMetadata(path.join(fixture, 'docs'));
        for (const file of ['.DS_Store', 'assets/._logo.png', 'assets/Thumbs.db']) assert.equal(fs.existsSync(path.join(fixture, 'docs', file)), false);
        for (const file of ['.nojekyll', '.well-known/security.txt']) assert.equal(fs.existsSync(path.join(fixture, 'docs', file)), true);
        assert.equal(fs.existsSync(path.join(fixture, 'data/.DS_Store')), true);
        fs.writeFileSync(path.join(fixture, 'data/claim.md'), 'changed claim');
        assert.notEqual(sourceCandidate(fixture), baseline);
    } finally {
        fs.rmSync(fixture, { recursive: true, force: true });
    }
});
