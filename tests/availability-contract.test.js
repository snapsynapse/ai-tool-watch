'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

function implementations() {
    return JSON.parse(
        fs.readFileSync(path.join(ROOT, 'docs', 'api', 'v1', 'implementations.json'), 'utf8')
    ).implementations;
}

function humanImplementations() {
    return JSON.parse(
        fs.readFileSync(path.join(ROOT, 'docs', 'assets', 'data.json'), 'utf8')
    ).implementations;
}

test('limited plan availability remains available in the generated API', () => {
    const implementation = implementations().find(item => item.id === 'gemini-deep-research');
    assert.ok(implementation, 'Gemini Deep Research implementation is missing');

    const free = implementation.plans.find(plan => plan.plan === 'Free');
    assert.ok(free, 'Gemini Deep Research Free plan is missing');
    assert.equal(free.limits, '~5/month');
    assert.equal(free.available, true, 'limited availability must not serialize as unavailable');

    const human = humanImplementations().find(item => item.id === 'gemini-deep-research');
    assert.ok(human.plans.includes('Free'), 'limited availability must remain discoverable in the human export');
});

test('limited surface availability remains available in the generated API', () => {
    const implementation = implementations().find(item => item.id === 'claude-connectors');
    assert.ok(implementation, 'Claude connectors implementation is missing');

    const ios = implementation.surfaces.find(surface => surface.surface === 'ios');
    assert.ok(ios, 'Claude connectors iOS surface is missing');
    assert.match(ios.notes, /Full use/);
    assert.equal(ios.available, true, 'limited surface availability must not serialize as unavailable');

    const human = humanImplementations().find(item => item.id === 'claude-connectors');
    assert.ok(human.surfaces.includes('ios'), 'limited surfaces must remain discoverable in the human export');
});
