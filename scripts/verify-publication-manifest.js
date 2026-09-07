#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const docs = path.resolve(process.argv[2] || path.join(__dirname, '..', 'docs'));
const manifestPath = path.join(docs, 'publication-manifest.json');

function artifactFiles(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const full = path.join(dir, entry.name);
        const relative = path.relative(docs, full).replace(/\\/g, '/');
        if (relative === 'publication-manifest.json') return [];
        if (entry.isDirectory()) return artifactFiles(full);
        if (!entry.isFile()) throw new Error(`artifact contains non-regular file ${relative}`);
        return [relative];
    }).sort();
}

try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (manifest.schema_version !== 1 || !/^[a-f0-9]{40}$/.test(manifest.source_revision || '') || !/^[a-f0-9]{64}$/.test(manifest.reviewed_input_sha256 || '') || !Array.isArray(manifest.files) || !manifest.artifact_sha256) throw new Error('invalid publication manifest shape');
    const paths = new Set();
    const files = manifest.files.map(entry => {
        if (!entry.path || entry.path.startsWith('/') || entry.path.split('/').includes('..') || !/^[a-f0-9]{64}$/.test(entry.sha256) || paths.has(entry.path)) throw new Error(`invalid manifest entry ${entry.path || '(none)'}`);
        paths.add(entry.path);
        const content = fs.readFileSync(path.join(docs, entry.path));
        const sha256 = crypto.createHash('sha256').update(content).digest('hex');
        if (sha256 !== entry.sha256) throw new Error(`artifact hash mismatch for ${entry.path}`);
        return { path: entry.path, sha256 };
    });
    const aggregate = crypto.createHash('sha256').update(JSON.stringify(files)).digest('hex');
    if (aggregate !== manifest.artifact_sha256) throw new Error('artifact aggregate hash mismatch');
    const actual = artifactFiles(docs);
    if (JSON.stringify(actual) !== JSON.stringify([...paths].sort())) throw new Error('artifact file inventory does not match manifest');
    console.log(`Verified reviewed publication artifact ${manifest.artifact_sha256} (${files.length} files).`);
} catch (error) {
    console.error(`Publication artifact verification failed: ${error.message}`);
    process.exitCode = 1;
}
