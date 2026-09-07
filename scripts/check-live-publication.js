#!/usr/bin/env node
'use strict';

// Explicit post-deployment acceptance command. Never called by the offline gate.
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { verifyPublication } = require('./verify-publication-manifest');
const DEFAULT_ROUTES = [
    'index.html', 'implementations.html', 'about.html', 'api/v1/index.json',
    'api/v1/implementations.json', 'api/v1/evidence.json', 'api/v1/plan-entitlements.json',
    'agents.json', 'llms.txt', 'sitemap.xml', 'robots.txt', '.well-known/security.txt'
];
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

async function readHttps(url, { timeoutMs = 15000, maxBytes = 5 * 1024 * 1024, fetchImpl = globalThis.fetch } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetchImpl(url, {
            redirect: 'manual', signal: controller.signal,
            headers: { 'User-Agent': 'AI-Tool-Watch-publication-verifier/1', 'Cache-Control': 'no-cache' }
        });
        if (response.status !== 200) {
            await response.body?.cancel();
            return { status: response.status, body: null };
        }
        const chunks = [];
        let size = 0;
        if (Number(response.headers.get('content-length')) > maxBytes) {
            controller.abort();
            throw new Error('Response exceeds byte limit');
        }
        if (response.body) for await (const chunk of response.body) {
            size += chunk.byteLength;
            if (size > maxBytes) { controller.abort(); throw new Error('Response exceeds byte limit'); }
            chunks.push(Buffer.from(chunk));
        }
        return { status: response.status, body: Buffer.concat(chunks) };
    } finally { clearTimeout(timer); }
}

async function checkLivePublication({ directory = path.join(__dirname, '..', 'docs'), baseUrl = 'https://aitool.watch/', routes = DEFAULT_ROUTES, request = readHttps, expected = {} } = {}) {
    const manifest = verifyPublication(directory, expected);
    const base = new URL(baseUrl);
    if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash || !base.pathname.endsWith('/')) {
        throw new Error('Use an HTTPS base URL ending in / without credentials, query, or fragment');
    }
    const inventory = new Map(manifest.files.map(entry => [entry.path, entry.sha256]));
    if (!Array.isArray(routes) || !routes.length || new Set(routes).size !== routes.length || routes.some(route => !inventory.has(route))) {
        throw new Error('Every distinct live route must exist in the verified artifact');
    }
    const expectedFiles = [{ path: 'publication-manifest.json', sha256: digest(fs.readFileSync(path.join(directory, 'publication-manifest.json'))) },
        ...routes.map(route => ({ path: route, sha256: inventory.get(route) }))];
    const results = new Array(expectedFiles.length);
    let next = 0;
    async function worker() {
        while (next < expectedFiles.length) {
            const index = next++;
            const entry = expectedFiles[index];
            const route = entry.path === 'index.html' ? '' : entry.path.split('/').map(encodeURIComponent).join('/');
            const url = new URL(route, base).href;
            const result = { path: entry.path, url, expected_sha256: entry.sha256 };
            try {
                const response = await request(url);
                result.http_status = response.status;
                if (response.status !== 200) {
                    result.status = response.status === 404 || response.status === 410 ? 'mismatch' : 'inconclusive';
                    result.reason = `HTTP ${response.status}; redirects are not followed`;
                } else {
                    result.sha256 = digest(response.body);
                    result.bytes = response.body.length;
                    result.status = result.sha256 === entry.sha256 ? 'matched' : 'mismatch';
                }
            } catch (error) { result.status = 'inconclusive'; result.reason = error.message; }
            results[index] = result;
        }
    }
    await Promise.all(Array.from({ length: Math.min(4, expectedFiles.length) }, worker));
    return {
        schema_version: 1, checked_at: new Date().toISOString(), base_url: base.href,
        source_revision: manifest.source_revision, reviewed_input_sha256: manifest.reviewed_input_sha256,
        artifact_sha256: manifest.artifact_sha256, artifact_file_count: manifest.files.length,
        status: results.some(r => r.status === 'mismatch') ? 'mismatch' : results.some(r => r.status === 'inconclusive') ? 'inconclusive' : 'matched',
        results
    };
}

function parseArgs(args) {
    const options = {};
    const flags = { '--artifact-dir': 'directory', '--base-url': 'baseUrl', '--receipt': 'receipt' };
    for (let i = 0; i < args.length; i++) {
        const key = flags[args[i]], value = args[++i];
        if (!key || !value || value.startsWith('--') || options[key] !== undefined) throw new Error('Expected --artifact-dir, --base-url, or --receipt with a value');
        options[key] = value;
    }
    return options;
}

if (require.main === module) (async () => {
    const options = parseArgs(process.argv.slice(2));
    if (options.receipt && fs.existsSync(options.receipt)) throw new Error('Receipt already exists; select a new path to preserve evidence');
    const report = await checkLivePublication(options);
    if (options.receipt) {
        fs.mkdirSync(path.dirname(path.resolve(options.receipt)), { recursive: true });
        fs.writeFileSync(options.receipt, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
    }
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.status === 'matched' ? 0 : report.status === 'mismatch' ? 1 : 2;
})().catch(error => { console.error(`Live publication check failed: ${error.message}`); process.exitCode = 2; });

module.exports = { checkLivePublication, readHttps, parseArgs, DEFAULT_ROUTES };
