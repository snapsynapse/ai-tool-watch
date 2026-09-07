#!/usr/bin/env node
'use strict';

// Produces the only deployable tree. Dependent targets must consume the
// uploaded artifact from this command; they must never rebuild source.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const steps = [
    ['Sync canonical evidence', 'scripts/sync-evidence.js'],
    ['Validate changed source and evidence tree', 'scripts/validate-ontology.js'],
    ['Generate publication artifact', 'scripts/build.js'],
    ['Validate generated structured data', 'scripts/validate-structured-data.js'],
    ['Validate human, API, and MCP publication coherence', 'scripts/validate-publication.js']
];

function run(label, script) {
    const result = spawnSync(process.execPath, [path.join(ROOT, script)], { cwd: ROOT, stdio: 'inherit' });
    if (result.status !== 0) throw new Error(`${label} failed`);
}

function files(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? files(full) : [full];
    });
}

function sourceCandidate() {
    // All canonical data and generator code that the reviewed build consumes.
    // Operational run receipts are intentionally outside this digest.
    const paths = [path.join(ROOT, 'data'), path.join(ROOT, 'scripts'), path.join(ROOT, 'README.md')];
    const entries = paths.flatMap(item => (fs.statSync(item).isDirectory() ? files(item) : [item]).map(file => ({
        path: path.relative(ROOT, file).replace(/\\/g, '/'),
        sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
    }))).sort((a, b) => a.path.localeCompare(b.path));
    return crypto.createHash('sha256').update(JSON.stringify(entries)).digest('hex');
}

function manifest() {
    const entries = files(DOCS).filter(file => path.basename(file) !== 'publication-manifest.json').map(file => {
        const relative = path.relative(DOCS, file).replace(/\\/g, '/');
        return { path: relative, sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') };
    }).sort((a, b) => a.path.localeCompare(b.path));
    const artifactSha256 = crypto.createHash('sha256').update(JSON.stringify(entries)).digest('hex');
    const revision = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' });
    const output = {
        schema_version: 1,
        source_revision: revision.status === 0 ? revision.stdout.trim() : null,
        reviewed_input_sha256: sourceCandidate(),
        artifact_sha256: artifactSha256,
        files: entries
    };
    fs.writeFileSync(path.join(DOCS, 'publication-manifest.json'), `${JSON.stringify(output, null, 2)}\n`);
    console.log(`Prepared reviewed publication artifact ${artifactSha256} (${entries.length} files).`);
}

try {
    steps.forEach(([label, script]) => run(label, script));
    manifest();
    run('Validate publication artifact manifest', 'scripts/verify-publication-manifest.js');
} catch (error) {
    console.error(`Publication preparation failed: ${error.message}`);
    process.exitCode = 1;
}
