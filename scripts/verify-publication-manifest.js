#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const isDigest = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const isRevision = value => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);

function artifactFiles(docs, dir = docs) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const full = path.join(dir, entry.name);
        const relative = path.relative(docs, full).replace(/\\/g, '/');
        if (entry.isDirectory()) return artifactFiles(docs, full);
        if (!entry.isFile()) throw new Error(`artifact contains non-regular file ${relative}`);
        return relative === 'publication-manifest.json' ? [] : [relative];
    }).sort();
}

function verifyPublication(directory, expected = {}) {
    const docs = path.resolve(directory);
    if (!fs.lstatSync(docs).isDirectory()) throw new Error('artifact root must be a regular directory');
    const manifestPath = path.join(docs, 'publication-manifest.json');
    if (!fs.lstatSync(manifestPath).isFile()) throw new Error('publication manifest must be a regular file');
    // Reject symlinks and other special files before reading any artifact entry.
    const actual = artifactFiles(docs);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (!manifest || manifest.schema_version !== 1 || !isRevision(manifest.source_revision) ||
        !isDigest(manifest.reviewed_input_sha256) || !isDigest(manifest.artifact_sha256) ||
        !Array.isArray(manifest.files) || !manifest.files.length) throw new Error('invalid publication manifest shape');
    for (const [key, valid] of [['source_revision', isRevision], ['reviewed_input_sha256', isDigest], ['artifact_sha256', isDigest]]) {
        if (expected[key] !== undefined) {
            if (!valid(expected[key])) throw new Error(`invalid expected ${key}`);
            if (manifest[key] !== expected[key]) throw new Error(`artifact does not match expected ${key}`);
        }
    }
    const paths = new Set();
    for (const entry of manifest.files) {
        const name = entry && entry.path;
        if (typeof name !== 'string' || !name || name.startsWith('/') || /[\\\x00-\x1f:]/.test(name) ||
            name.split('/').some(part => !part || part === '.' || part === '..') || name === 'publication-manifest.json' ||
            !isDigest(entry.sha256) || paths.has(name)) throw new Error(`invalid manifest entry ${name || '(none)'}`);
        paths.add(name);
    }
    if (JSON.stringify(actual) !== JSON.stringify([...paths].sort())) throw new Error('artifact file inventory does not match manifest');
    const files = manifest.files.map(entry => {
        const digest = sha256(fs.readFileSync(path.join(docs, entry.path)));
        if (digest !== entry.sha256) throw new Error(`artifact hash mismatch for ${entry.path}`);
        return { path: entry.path, sha256: digest };
    });
    if (sha256(JSON.stringify(files)) !== manifest.artifact_sha256) throw new Error('artifact aggregate hash mismatch');
    return manifest;
}

function parseArgs(args) {
    let directory;
    const expected = {};
    const flags = {
        '--expected-source-revision': 'source_revision',
        '--expected-reviewed-input-sha256': 'reviewed_input_sha256',
        '--expected-artifact-sha256': 'artifact_sha256'
    };
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (Object.hasOwn(flags, arg)) {
            const value = args[++i];
            if (!value || value.startsWith('--') || expected[flags[arg]] !== undefined) throw new Error(`Missing or duplicate ${arg}`);
            expected[flags[arg]] = value;
        } else if (arg.startsWith('-') || directory !== undefined) throw new Error(`Unknown argument ${arg}`);
        else directory = arg;
    }
    return { directory: directory || path.join(__dirname, '..', 'docs'), expected };
}

if (require.main === module) {
    try {
        const { directory, expected } = parseArgs(process.argv.slice(2));
        const manifest = verifyPublication(directory, expected);
        console.log(`Verified reviewed publication artifact ${manifest.artifact_sha256} (${manifest.files.length} files).`);
    } catch (error) {
        console.error(`Publication artifact verification failed: ${error.message}`);
        process.exitCode = 1;
    }
}
module.exports = { verifyPublication, parseArgs };
