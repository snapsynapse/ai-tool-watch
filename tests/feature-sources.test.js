'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');

test('Focus Modes exposes its primary sources inside its human feature card', () => {
    const html = fs.readFileSync(path.join(ROOT, 'docs/implementations.html'), 'utf8');
    const start = html.indexOf('<div class="feature-card" id="perplexity-focus-modes"');
    assert.ok(start >= 0, 'Focus Modes feature card is missing');
    const end = html.indexOf('<div class="feature-card"', start + 1);
    const card = html.slice(start, end < 0 ? undefined : end);
    for (const slug of ['10354759-why-can-t-i-see-focus-mode-on-my-search-bar', '10352903-what-is-pro-search']) {
        assert.ok(card.includes(`href="https://perplexity.ai/help-center/en/articles/${slug}"`), `Missing primary source ${slug}`);
    }
    assert.ok(card.includes('Organization accounts use source controls instead of manual focus mode.'));
});

test('the repaired Focus Modes evidence agrees across human, API, and MCP readers', () => {
    const result = spawnSync(process.execPath, ['scripts/validate-publication.js'], {
        cwd: ROOT,
        env: { ...process.env, AI_TOOL_WATCH_PUBLICATION_FIXTURE: 'perplexity-focus-modes' },
        encoding: 'utf8'
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);
});
