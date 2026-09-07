'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const review = require('../scripts/lib/freshness-review');

const result = { platform: 'Fixture', feature: 'Feature', outcome: 'confirmed', proposedChanges: [{ type: 'status', detail: 'now GA' }], results: [{ model: 'a', type: 'positive', response: 'Observed 2026-09-06', sources: ['https://example.org/source'] }] };

test('repeated evidence keeps the finding id and original first-seen time', () => {
    const first = review.findingForResult(review.emptyReviewState(), result, { now: new Date('2026-01-01T00:00:00.000Z') });
    const repeated = review.findingForResult(first.state, result, { now: new Date('2026-02-01T00:00:00.000Z') });
    assert.equal(repeated.finding.id, first.finding.id);
    assert.equal(repeated.finding.firstSeenAt, '2026-01-01T00:00:00.000Z');
});

test('an older exact-title issue preserves the historical review age', () => {
    const entry = review.findingForResult(review.emptyReviewState(), result, { now: new Date('2026-02-01T00:00:00.000Z') });
    const linked = review.linkIssue(entry.state, entry.finding.id, { status: 'accepted', url: 'https://github.com/example/repo/issues/1', createdAt: '2026-01-01T00:00:00.000Z', linkedAt: '2026-02-01T00:00:00.000Z' }, { now: new Date('2026-02-01T00:00:00.000Z') });
    assert.equal(linked.finding.firstSeenAt, '2026-01-01T00:00:00.000Z');
});

test('material evidence dates affect findings while envelope timestamps do not', () => {
    const first = review.findingForResult(review.emptyReviewState(), { ...result, results: [{ ...result.results[0], response: 'Effective 2026-01-01', raw: { receivedAt: '2026-02-01T00:00:00.000Z' } }] }, { now: new Date('2026-02-01T00:00:00.000Z') });
    const replay = review.findingForResult(first.state, { ...result, results: [{ ...result.results[0], response: 'Effective 2026-01-01', raw: { receivedAt: '2026-03-01T00:00:00.000Z' } }] }, { now: new Date('2026-03-01T00:00:00.000Z') });
    const changed = review.findingForResult(first.state, { ...result, results: [{ ...result.results[0], response: 'Effective 2026-04-01' }] }, { now: new Date('2026-03-01T00:00:00.000Z') });
    assert.equal(replay.finding.id, first.finding.id);
    assert.notEqual(changed.finding.id, first.finding.id);
});
