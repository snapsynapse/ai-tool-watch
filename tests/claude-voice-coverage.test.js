'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

function readApi(name) {
    return JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'api', 'v1', name), 'utf8'));
}

test('Claude Voice is represented across plans, capabilities, surfaces, and evidence', () => {
    const implementation = readApi('implementations.json').implementations
        .find(item => item.id === 'claude-voice-mode');
    assert.ok(implementation, 'Claude Voice implementation is missing');

    assert.deepEqual(
        implementation.capabilities.slice().sort(),
        ['hear-audio-and-speech', 'speak-back-in-real-time']
    );
    assert.equal(implementation.status, 'beta');
    assert.equal(implementation.gating, 'free');

    const expectedPlans = ['Free', 'Pro', 'Max 5x', 'Max 20x', 'Team', 'Enterprise'];
    assert.deepEqual(implementation.plans.map(plan => plan.plan), expectedPlans);
    assert.ok(implementation.plans.every(plan => plan.available));

    for (const surface of ['windows', 'macos', 'linux', 'ios', 'android', 'web']) {
        assert.equal(
            implementation.surfaces.find(item => item.surface === surface)?.available,
            true,
            `Claude Voice must be available on ${surface}`
        );
    }
    for (const surface of ['chrome', 'terminal', 'api']) {
        assert.equal(
            implementation.surfaces.find(item => item.surface === surface)?.available,
            false,
            `Claude Voice must not be represented as available on ${surface}`
        );
    }

    const evidence = readApi('evidence.json').evidence
        .find(item => item.entity_id === 'claude-voice-mode');
    assert.ok(evidence, 'Claude Voice evidence record is missing');
    assert.ok(evidence.sources.some(source => source.url === 'https://support.claude.com/en/articles/11101966-use-voice-mode'));
});
