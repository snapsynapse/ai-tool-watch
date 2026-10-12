'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

const ROOT = path.join(__dirname, '..');
const build = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'build.yml'), 'utf8');
const pagesDeploy = build.slice(build.indexOf('  deploy:\n'));

test('the Pages deploy job verifies the fresh downloaded artifact', () => {
    assert.match(pagesDeploy, /name: Checkout verifier[\s\S]*actions\/checkout@v4/);
    assert.match(pagesDeploy, /name: Setup Node\.js[\s\S]*node-version: '20'/);
    assert.match(pagesDeploy, /actions\/download-artifact@v4[\s\S]*path: publication/);
    assert.match(pagesDeploy, /node scripts\/verify-publication-manifest\.js publication/);
    assert.match(pagesDeploy, /permissions:[\s\S]*contents: read[\s\S]*pages: write/);
    assert.match(pagesDeploy, /actions\/upload-pages-artifact@v3[\s\S]*path: publication/);
    assert.doesNotMatch(pagesDeploy, /node scripts\/build\.js/);
    // The PAICE.work FTP target was retired on 2026-10-11.
    assert.ok(!fs.existsSync(path.join(ROOT, '.github', 'workflows', 'deploy-ftp.yml')));
    assert.doesNotMatch(build, /deploy-ftp|FTP_/);
});

test('a completed Verify Features run triggers the deploy instead of a fixed cron', () => {
    assert.match(build, /workflow_run:\n\s+workflows: \[Verify Features\]\n\s+types: \[completed\]\n\s+branches: \[main\]/);
    assert.doesNotMatch(build, /^\s+schedule:/m);
    assert.match(pagesDeploy, /if: \(github\.event_name == 'push' \|\| github\.event_name == 'workflow_run'\)/);
});

test('only preparation can write, and it stages canonical evidence with its docs artifact', () => {
    const prepare = build.slice(build.indexOf('  prepare-publication:\n'), build.indexOf('  deploy:\n'));
    assert.match(build, /^permissions:\n\s+contents: read/m);
    assert.match(prepare, /permissions:\n\s+contents: write/);
    assert.match(prepare, /node scripts\/prepare-publication\.js/);
    assert.match(prepare, /git status --porcelain -- data\/platforms\/ data\/watchlist\/ data\/evidence\/index\.json docs\//);
    assert.match(prepare, /git add data\/platforms\/ data\/watchlist\/ data\/evidence\/index\.json docs\//);
});

test('claim validation blocks preparation and deployment after the scheduled trial', () => {
    const validate = build.slice(build.indexOf('  validate:\n'), build.indexOf('  prepare-publication:\n'));
    assert.match(validate, /node scripts\/validate-claims\.js/);
    assert.doesNotMatch(validate, /continue-on-error/);
    assert.match(build, /prepare-publication:\n\s+needs: validate/);
    assert.match(build, /reviewed_input_sha256=/);
});

test('the deployment binds downloads to independent producer identity', () => {
    for (const key of ['source_revision', 'reviewed_input_sha256', 'artifact_sha256']) {
        assert.ok(build.includes(`${key}: \${{ steps.receipt.outputs.${key} }}`));
        assert.ok(pagesDeploy.includes(`EXPECTED_${key.toUpperCase()}: \${{ needs.prepare-publication.outputs.${key} }}`));
        assert.ok(pagesDeploy.includes(`--expected-${key.replaceAll('_', '-')} "$EXPECTED_${key.toUpperCase()}"`));
    }
    assert.match(build, /id: receipt[\s\S]*GITHUB_OUTPUT/);
});
