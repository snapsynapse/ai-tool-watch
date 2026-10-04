'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');

function listHtml(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) return listHtml(fullPath);
        return entry.name.endsWith('.html') ? [fullPath] : [];
    });
}

test('PostHog uses the shared public key with cookieless privacy controls', () => {
    const build = fs.readFileSync(path.join(ROOT, 'scripts', 'build.js'), 'utf8');
    assert.match(build, /const POSTHOG_TOKEN = 'phc_[A-Za-z0-9_-]+';/);
    assert.match(build, /location\.hostname !== 'aitool\.watch'/);
    assert.match(build, /api_host: 'https:\/\/us\.i\.posthog\.com'/);
    assert.match(build, /person_profiles: 'identified_only'/);
    assert.match(build, /persistence: 'memory'/);
    assert.match(build, /maskAllInputs: true/);
    assert.match(build, /maskTextSelector: '\*'/);
});

test('every generated HTML page carries the same hostname-guarded analytics', () => {
    const files = listHtml(DOCS);
    assert.ok(files.length >= 140, `expected generated HTML inventory, found ${files.length}`);
    for (const file of files) {
        const html = fs.readFileSync(file, 'utf8');
        const label = path.relative(ROOT, file);
        assert.match(html, /PostHog product analytics: cookieless/, label);
        assert.match(html, /location\.hostname !== 'aitool\.watch'/, label);
        assert.match(html, /persistence: 'memory'/, label);
        assert.doesNotMatch(html, /No trackers here/i, label);
    }
});

test('the standalone pattern page has a source template', () => {
    const templatePath = path.join(ROOT, 'scripts', 'templates', 'pattern.html');
    assert.equal(fs.existsSync(templatePath), true);
    const template = fs.readFileSync(templatePath, 'utf8');
    assert.doesNotMatch(template, /No trackers here/i);
    assert.doesNotMatch(template, /Made by PAICE|signalsandsubtractions\.substack|https:\/\/www\./i);
});

test('the definitions page has a current source template', () => {
    const templatePath = path.join(ROOT, 'scripts', 'templates', 'definitions.html');
    assert.equal(fs.existsSync(templatePath), true);
    const template = fs.readFileSync(templatePath, 'utf8');
    assert.match(template, /AI Tool Watch/);
    assert.match(template, /github\.com\/snapsynapse\/ai-tool-watch/);
    assert.doesNotMatch(template, /AI Feature Tracker|ai-feature-tracker|Made by PAICE/i);
});

test('public documentation discloses analytics without stale no-tracking claims', () => {
    const security = fs.readFileSync(path.join(ROOT, 'SECURITY.md'), 'utf8');
    const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
    assert.match(security, /Cookieless PostHog analytics/);
    assert.match(readme, /PostHog for cookieless site-use measurement/);
    assert.doesNotMatch(security, /site uses no analytics/i);
    assert.doesNotMatch(security, /there is no data collection/i);
});
