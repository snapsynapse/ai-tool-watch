'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { verifyPublication, parseArgs } = require('../scripts/verify-publication-manifest');
const digest = value => crypto.createHash('sha256').update(value).digest('hex');

function fixture() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'atw-artifact-contract-'));
    fs.writeFileSync(path.join(dir, 'index.html'), 'reviewed page');
    fs.writeFileSync(path.join(dir, '.nojekyll'), '');
    const manifest = { schema_version: 1, source_revision: 'a'.repeat(40), reviewed_input_sha256: 'b'.repeat(64), files: [
        { path: '.nojekyll', sha256: digest('') }, { path: 'index.html', sha256: digest('reviewed page') }
    ] };
    save(dir, manifest);
    return { dir, manifest };
}
function save(dir, manifest) {
    manifest.artifact_sha256 = digest(JSON.stringify(manifest.files));
    fs.writeFileSync(path.join(dir, 'publication-manifest.json'), JSON.stringify(manifest));
}
function scenario(name, mutate, expectedError) {
    test(name, () => {
        const { dir, manifest } = fixture();
        try { mutate(dir, manifest); assert.throws(() => verifyPublication(dir), expectedError); }
        finally { fs.rmSync(dir, { recursive: true, force: true }); }
    });
}

scenario('missing reviewed file fails the exact inventory', dir => fs.unlinkSync(path.join(dir, 'index.html')), /inventory/);
scenario('duplicate manifest paths are rejected even with a consistent aggregate', (dir, m) => { m.files.push(m.files[0]); save(dir, m); }, /invalid manifest entry/);
for (const name of ['../outside', '/absolute', 'nested/../../outside', 'C:\\outside', 'nested\\file', './index.html', 'nested//file', 'publication-manifest.json']) {
    scenario(`unsafe or ambiguous manifest path ${JSON.stringify(name)} is rejected`, (dir, m) => { m.files[0].path = name; save(dir, m); }, /invalid manifest entry/);
}
scenario('symlink entry is rejected before its target is read', dir => {
    fs.unlinkSync(path.join(dir, 'index.html')); fs.symlinkSync('/no-such-reviewed-file', path.join(dir, 'index.html'));
}, /non-regular file/);
scenario('symlink manifest is rejected before JSON is read', dir => {
    fs.renameSync(path.join(dir, 'publication-manifest.json'), path.join(dir, 'manifest-target.json'));
    fs.symlinkSync('manifest-target.json', path.join(dir, 'publication-manifest.json'));
}, /manifest must be a regular file/);
scenario('directory symlink is rejected', dir => fs.symlinkSync(dir, path.join(dir, 'cycle')), /non-regular file/);
scenario('malformed JSON is rejected', dir => fs.writeFileSync(path.join(dir, 'publication-manifest.json'), '{'), /JSON/);
scenario('empty artifact manifest is rejected', (dir, m) => { m.files = []; save(dir, m); }, /manifest shape/);
scenario('null manifest entry is rejected without dereferencing it', (dir, m) => { m.files[0] = null; save(dir, m); }, /invalid manifest entry/);
scenario('invalid file digest is rejected', (dir, m) => { m.files[0].sha256 = 'not-a-digest'; save(dir, m); }, /invalid manifest entry/);
scenario('invalid aggregate digest is rejected', (dir, m) => {
    m.artifact_sha256 = 'not-a-digest'; fs.writeFileSync(path.join(dir, 'publication-manifest.json'), JSON.stringify(m));
}, /manifest shape/);
scenario('mismatched aggregate digest is rejected', (dir, m) => {
    m.artifact_sha256 = '0'.repeat(64); fs.writeFileSync(path.join(dir, 'publication-manifest.json'), JSON.stringify(m));
}, /aggregate hash mismatch/);

test('a valid replacement artifact fails the producer expected identity', () => {
    const { dir, manifest } = fixture();
    try {
        const expected = { source_revision: manifest.source_revision, reviewed_input_sha256: manifest.reviewed_input_sha256, artifact_sha256: manifest.artifact_sha256 };
        assert.equal(verifyPublication(dir, expected).files.length, 2);
        fs.writeFileSync(path.join(dir, 'index.html'), 'different but self-consistent build');
        manifest.files[1].sha256 = digest('different but self-consistent build');
        save(dir, manifest);
        assert.equal(verifyPublication(dir).artifact_sha256, manifest.artifact_sha256);
        assert.throws(() => verifyPublication(dir, expected), /expected artifact_sha256/);
        assert.throws(() => verifyPublication(dir, { source_revision: 'c'.repeat(40) }), /expected source_revision/);
        assert.throws(() => verifyPublication(dir, { reviewed_input_sha256: 'd'.repeat(64) }), /expected reviewed_input_sha256/);
        assert.throws(() => verifyPublication(dir, { artifact_sha256: '' }), /invalid expected/);
    } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('CLI identity flags cannot silently disappear or accept malformed arguments', () => {
    const args = parseArgs(['publication', '--expected-source-revision', 'a'.repeat(40), '--expected-artifact-sha256', 'b'.repeat(64)]);
    assert.equal(args.directory, 'publication');
    assert.equal(args.expected.source_revision, 'a'.repeat(40));
    assert.equal(args.expected.artifact_sha256, 'b'.repeat(64));
    for (const bad of [['--expected-artifact-sha256'], ['--unknown'], ['one', 'two'], ['--expected-source-revision', 'a', '--expected-source-revision', 'b']]) assert.throws(() => parseArgs(bad));
});
