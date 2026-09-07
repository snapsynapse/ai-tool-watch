'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { parsePlatform } = require('../scripts/lib/parser');

test('pricing stops before lifecycle prose, source links, and a separate changelog table', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'atw-pricing-'));
    try {
        const file = path.join(dir, 'fixture.md');
        fs.writeFileSync(file, [
            '---', 'name: Fixture', '---', '', '## Pricing', '',
            '| Plan | Price | Notes |', '|---|---|---|', '| Premium | $19.99/mo | U.S. monthly |', '',
            'Existing subscriptions can continue.', '', '### Sources', '',
            '- [Source](https://example.com/)', '', '### Changelog', '',
            '| Date | Change |', '|---|---|', '| 2026-09-07 | Corrected scope |', '', '---', ''
        ].join('\n'));
        assert.deepEqual(parsePlatform(file).pricing, [{plan: 'Premium', price: '$19.99/mo', notes: 'U.S. monthly'}]);
    } finally {
        fs.rmSync(dir, {recursive: true, force: true});
    }
});
