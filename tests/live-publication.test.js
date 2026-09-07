'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { checkLivePublication, readHttps, parseArgs } = require('../scripts/check-live-publication');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
function fixture(t) {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'atw-live-contract-'));
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
    fs.writeFileSync(path.join(directory, 'index.html'), '<h1>Reviewed</h1>');
    const files = [{ path: 'index.html', sha256: hash('<h1>Reviewed</h1>') }];
    const manifest = { schema_version: 1, source_revision: 'a'.repeat(40), reviewed_input_sha256: 'b'.repeat(64), artifact_sha256: hash(JSON.stringify(files)), files };
    fs.writeFileSync(path.join(directory, 'publication-manifest.json'), JSON.stringify(manifest));
    return { directory, routes: ['index.html'], request: async url => ({ status: 200, body: fs.readFileSync(path.join(directory, new URL(url).pathname === '/' ? 'index.html' : 'publication-manifest.json')) }) };
}
test('live acceptance requires manifest and selected route byte agreement', async t => {
    const report = await checkLivePublication(fixture(t));
    assert.equal(report.status, 'matched');
    assert.equal(report.results.length, 2);
    assert.equal(report.results[1].url, 'https://aitool.watch/');
    assert.equal(report.artifact_file_count, 1);
});
for (const [status, expected] of [[404, 'mismatch'], [410, 'mismatch'], [301, 'inconclusive'], [429, 'inconclusive'], [503, 'inconclusive']]) {
    test(`HTTP ${status} produces ${expected}`, async t => {
        assert.equal((await checkLivePublication({ ...fixture(t), request: async () => ({ status }) })).status, expected);
    });
}
test('changed bytes fail and network errors remain inconclusive', async t => {
    const options = fixture(t);
    assert.equal((await checkLivePublication({ ...options, request: async () => ({ status: 200, body: Buffer.from('wrong candidate') }) })).status, 'mismatch');
    assert.equal((await checkLivePublication({ ...options, request: async () => { throw new Error('DNS unavailable'); } })).status, 'inconclusive');
});
test('local corruption or wrong expected candidate prevents all requests', async t => {
    const options = fixture(t);
    let calls = 0;
    options.request = async () => { calls++; throw new Error('must not fetch'); };
    await assert.rejects(checkLivePublication({ ...options, expected: { source_revision: 'c'.repeat(40) } }));
    fs.writeFileSync(path.join(options.directory, 'index.html'), 'corruption');
    await assert.rejects(checkLivePublication(options));
    assert.equal(calls, 0);
});
test('invalid destinations and route inventory fail before requests', async t => {
    const options = fixture(t);
    for (const baseUrl of ['http://aitool.watch/', 'https://user:pass@aitool.watch/', 'https://aitool.watch/?query', 'https://aitool.watch/path']) {
        await assert.rejects(checkLivePublication({ ...options, baseUrl }));
    }
    for (const routes of [[], ['absent'], ['index.html', 'index.html']]) await assert.rejects(checkLivePublication({ ...options, routes }));
});
test('transport refuses redirects and bounds declared and streamed bodies', async () => {
    let mode;
    assert.equal((await readHttps('https://aitool.watch/', { fetchImpl: async (_url, options) => { mode = options.redirect; return new Response(null, { status: 302 }); } })).status, 302);
    assert.equal(mode, 'manual');
    for (const headers of [{ 'content-length': '100' }, {}]) {
        await assert.rejects(readHttps('https://aitool.watch/', { maxBytes: 3, fetchImpl: async () => new Response('too large', { headers }) }), /byte limit/);
    }
});
test('transport timeout cancels a pending fetch', async () => {
    await assert.rejects(readHttps('https://aitool.watch/', {
        timeoutMs: 5,
        fetchImpl: async (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted'))))
    }), /aborted/);
});
test('CLI accepts explicit artifact and receipt locations and rejects ambiguity', () => {
    assert.deepEqual(parseArgs(['--artifact-dir', '/tmp/artifact', '--receipt', '/tmp/receipt.json']), { directory: '/tmp/artifact', receipt: '/tmp/receipt.json' });
    for (const args of [['--unknown', 'x'], ['--receipt'], ['--receipt', 'a', '--receipt', 'b']]) assert.throws(() => parseArgs(args));
});

test('a definite content mismatch is retained alongside a transport failure', async t => {
    const options = fixture(t);
    const report = await checkLivePublication({ ...options, request: async url => {
        if (new URL(url).pathname === '/') throw new Error('timeout');
        return { status: 200, body: Buffer.from('different manifest') };
    } });
    assert.equal(report.status, 'mismatch');
    assert.deepEqual(report.results.map(row => row.status), ['mismatch', 'inconclusive']);
});

test('transport timeout also cancels a stalled response body', async () => {
    await assert.rejects(readHttps('https://aitool.watch/', {
        timeoutMs: 5,
        fetchImpl: async (_url, { signal }) => new Response(new ReadableStream({
            start(controller) { signal.addEventListener('abort', () => controller.error(new Error('body aborted'))); }
        }))
    }), /body aborted/);
});
