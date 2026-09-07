'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

const ROOT = path.join(__dirname, '..');
const build = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'build.yml'), 'utf8');
const ftp = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'deploy-ftp.yml'), 'utf8');
const pagesDeploy = build.slice(build.indexOf('  deploy:\n'), build.indexOf('  deploy-ftp:\n'));
const ftpDeploy = ftp.slice(ftp.indexOf('  deploy:\n'));

test('dependent deploy jobs verify the same fresh downloaded artifact', () => {
    for (const workflow of [pagesDeploy, ftpDeploy]) {
        assert.match(workflow, /name: Checkout verifier[\s\S]*actions\/checkout@v4/);
        assert.match(workflow, /name: Setup Node\.js[\s\S]*node-version: '20'/);
        assert.match(workflow, /actions\/download-artifact@v4[\s\S]*path: publication/);
        assert.match(workflow, /node scripts\/verify-publication-manifest\.js publication/);
    }
    assert.match(pagesDeploy, /permissions:[\s\S]*contents: read[\s\S]*pages: write/);
    assert.match(pagesDeploy, /actions\/upload-pages-artifact@v3[\s\S]*path: publication/);
    assert.match(ftpDeploy, /local-dir: \.\/publication\//);
    assert.match(ftpDeploy, /permissions:\n\s+contents: read/);
    assert.doesNotMatch(ftpDeploy, /node scripts\/build\.js/);
});

test('only preparation can write, and it stages canonical evidence with its docs artifact', () => {
    const prepare = build.slice(build.indexOf('  prepare-publication:\n'), build.indexOf('  deploy:\n'));
    assert.match(build, /^permissions:\n\s+contents: read/m);
    assert.match(prepare, /permissions:\n\s+contents: write/);
    assert.match(prepare, /node scripts\/prepare-publication\.js/);
    assert.match(prepare, /git status --porcelain -- data\/platforms\/ data\/watchlist\/ data\/evidence\/index\.json docs\//);
    assert.match(prepare, /git add data\/platforms\/ data\/watchlist\/ data\/evidence\/index\.json docs\//);
});
