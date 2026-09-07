'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildRunHealth, healthExitCode, isAdequatelyChecked } = require('../scripts/lib/verification-health');

function vote(type, overrides = {}) {
    return { type, modelName: 'provider-a', response: 'substantive response', confidence: 0.8,
        hasSearchEvidence: true, sources: ['https://source.example/'], ...overrides };
}
function result(outcome, votes, overrides = {}) {
    return { platform: 'Example platform', feature: 'Example feature', outcome, results: votes, ...overrides };
}
function health(overrides = {}) {
    return buildRunHealth({ runId: 'run-1', startedAt: '2026-09-06T00:00:00Z',
        finishedAt: '2026-09-06T00:01:00Z', inventoryCount: 20, selectedCount: 1, results: [], ...overrides });
}

test('two distinct cited and search-grounded negatives are adequate', () => {
    const noChange = result('no_change', [vote('negative'), vote('negative', { modelName: 'provider-b' })]);
    assert.equal(isAdequatelyChecked(noChange), true);
    const h = health({ results: [noChange] });
    assert.equal(h.status, 'healthy');
    assert.equal(healthExitCode(h), 0);
});

test('one negative, duplicate providers, missing citations, or no search remain inadequate', () => {
    assert.equal(isAdequatelyChecked(result('no_change', [vote('negative')])), false);
    assert.equal(isAdequatelyChecked(result('no_change', [vote('negative'), vote('negative')])), false);
    assert.equal(isAdequatelyChecked(result('no_change', [
        vote('negative'), vote('negative', { modelName: 'provider-b', sources: [] })
    ])), false);
    assert.equal(isAdequatelyChecked(result('no_change', [
        vote('negative'), vote('negative', { modelName: 'provider-b', hasSearchEvidence: false })
    ])), false);
    const missingSearchFlag = vote('negative', { modelName: 'provider-b' });
    delete missingSearchFlag.hasSearchEvidence;
    assert.equal(isAdequatelyChecked(result('no_change', [
        vote('negative'), missingSearchFlag
    ])), false);
});

test('all-provider failures fail instead of appearing healthy', () => {
    const failed = result('error', [vote('error'), vote('error', { modelName: 'provider-b' })]);
    const h = health({ results: [failed] });
    assert.equal(h.status, 'failed');
    assert.equal(h.counts.providerFailures, 2);
    assert.equal(healthExitCode(h), 2);
    assert.equal(h.alert.repository, 'ai-tool-watch');
    assert.equal(h.alert.notification.status, 'not_configured');
});

test('a complete cited contradiction is review-required', () => {
    const conflict = result('contradiction', [
        vote('positive'), vote('negative', { modelName: 'provider-b' })
    ]);
    const h = health({ results: [conflict] });
    assert.equal(isAdequatelyChecked(conflict), true);
    assert.equal(h.status, 'review_required');
    assert.equal(healthExitCode(h), 1);
});

test('a contradiction needs two distinct qualified providers', () => {
    const sameProvider = result('contradiction', [vote('positive'), vote('negative')]);
    assert.equal(isAdequatelyChecked(sameProvider), false);
    assert.equal(health({ results: [sameProvider] }).status, 'failed');
});

test('a confirmed consensus is a review candidate, not a healthy no-change result', () => {
    const confirmed = result('confirmed', [
        vote('positive'), vote('positive', { modelName: 'provider-b' }),
        vote('positive', { modelName: 'provider-c' })
    ]);
    const h = health({ results: [confirmed] });
    assert.equal(h.status, 'review_required');
    assert.equal(h.reviewRequired.count, 1);
});

test('incomplete and consistency-blocked work degrades a run without hiding pending results', () => {
    const adequate = result('no_change', [vote('negative'), vote('negative', { modelName: 'provider-b' })]);
    const blocked = result('inconclusive', [], { consistencyIssues: ['source disagreement'] });
    const h = health({ selectedCount: 2, dueCount: 3, results: [adequate, blocked] });
    assert.equal(h.status, 'degraded');
    assert.equal(h.counts.adequate, 1);
    assert.equal(h.selection.backlog, 1);
    assert.equal(healthExitCode(h), 2);
});

test('a valid empty queue is idle and an invalid inventory fails closed', () => {
    assert.equal(health({ selectedCount: 0, dueCount: 0, results: [] }).status, 'idle');
    assert.equal(health({ inventoryCount: 0, selectedCount: 0, dueCount: 0, results: [] }).status, 'failed');
});

test('a malformed vote container returns a failed health envelope', () => {
    const h = health({ results: [{ platform: 'Example', feature: 'Broken', outcome: 'inconclusive', results: {} }] });
    assert.equal(h.status, 'failed');
    assert.equal(h.counts.malformedResults, 1);
    assert.equal(h.alert.type, 'verification_run_failed');
});
