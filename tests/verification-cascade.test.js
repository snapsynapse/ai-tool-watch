'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { CascadeOutcome, runCascade, runBatchCascade, summarizeResults } = require('../scripts/lib/cascade');

const platform = { name: 'Example', vendor: 'OpenAI', pricing: [{ plan: 'Free' }] };
const feature = { name: 'Example feature', status: 'GA', gating: 'Free', availability: [], platforms: [] };
const noChange = `1. Pricing: CORRECT. Stored data matches.
2. Platform: CORRECT. Stored data matches.
3. Status: CORRECT. Stored data matches.
4. Gating: CORRECT. Stored data matches.
5. Regional: CORRECT.
6. URL: CORRECT.
7. Recent: No changes detected.`;
const positive = `1. Pricing: INCORRECT. Free users now have access.
2. Platform: CORRECT.
3. Status: CORRECT.
4. Gating: INCORRECT. The feature is now available on free tier.
5. Regional: CORRECT.
6. URL: CORRECT.
7. Recent: A change was announced.`;
function client(name, reply) {
    return { name, displayName: name, verify: async () => reply };
}
function response(text, overrides = {}) {
    return { response: text, hasSearchEvidence: true, sources: ['https://source.example/'], raw: { id: 'raw' },
        usageReceipt: { id: 'receipt' }, ...overrides };
}

test('only two distinct cited search-grounded negatives can produce no_change', async () => {
    const result = await runCascade(platform, feature, { clients: [
        client('provider-a', response(noChange)),
        client('provider-b', response(noChange))
    ], delayBetweenQueries: 0 });
    assert.equal(result.outcome, CascadeOutcome.NO_CHANGE);
    assert.equal(result.results[0].raw.id, 'raw');
    assert.equal(result.results[0].usageReceipt.id, 'receipt');
});

test('one result and unsupported no-change evidence remain inconclusive', async () => {
    const one = await runCascade(platform, feature, { clients: [client('provider-a', response(noChange))], delayBetweenQueries: 0 });
    const noCitation = await runCascade(platform, feature, { clients: [
        client('provider-a', response(noChange, { sources: [] })),
        client('provider-b', response(noChange, { hasSearchEvidence: false }))
    ], delayBetweenQueries: 0 });
    assert.equal(one.outcome, CascadeOutcome.INCONCLUSIVE);
    assert.equal(noCitation.outcome, CascadeOutcome.INCONCLUSIVE);
});

test('positive evidence is retained as a contradiction, never discarded', async () => {
    const result = await runCascade(platform, feature, { clients: [
        client('provider-a', response(positive)),
        client('provider-b', response(noChange))
    ], delayBetweenQueries: 0 });
    assert.equal(result.outcome, CascadeOutcome.CONTRADICTION);
    assert.equal(result.results.some(vote => vote.type === 'positive'), true);
    assert.equal('discardedPositives' in result, false);
});

test('provider errors retain available raw response and usage receipts', async () => {
    const error = Object.assign(new Error('provider failed'), {
        raw: { id: 'failed-raw' },
        usageReceipt: { id: 'failed-receipt' }
    });
    const result = await runCascade(platform, feature, {
        clients: [{ name: 'provider-a', displayName: 'provider-a', verify: async () => { throw error; } }],
        delayBetweenQueries: 0
    });
    assert.equal(result.outcome, CascadeOutcome.ERROR);
    assert.equal(result.results[0].raw.id, 'failed-raw');
    assert.equal(result.results[0].usageReceipt.id, 'failed-receipt');
});

test('parser failures retain the successful provider response artifacts', async () => {
    const reply = response({ malformed: true }, { raw: { id: 'response-raw' }, usageReceipt: { id: 'response-receipt' } });
    const result = await runCascade(platform, feature, {
        clients: [client('provider-a', reply)],
        delayBetweenQueries: 0
    });
    assert.equal(result.outcome, CascadeOutcome.ERROR);
    assert.equal(result.results[0].raw.id, 'response-raw');
    assert.equal(result.results[0].usageReceipt.id, 'response-receipt');
});

test('same-vendor injected client is still skipped and onResult is awaited', async () => {
    const completed = [];
    const batch = await runBatchCascade([{ platform: { ...platform, vendor: 'Google' }, feature }], { clients: [
        client('gemini', response(noChange)),
        client('provider-a', response(noChange)),
        client('provider-b', response(noChange))
    ], delayBetweenFeatures: 0, delayBetweenQueries: 0, onResult: async result => {
        await Promise.resolve();
        completed.push(result);
    } });
    assert.equal(batch.results[0].results.some(vote => vote.modelName === 'gemini'), false);
    assert.equal(completed.length, 1);
});

test('onResult errors propagate instead of becoming provider errors', async () => {
    await assert.rejects(runBatchCascade([{ platform, feature }], {
        clients: [client('provider-a', response(noChange))], delayBetweenFeatures: 0, delayBetweenQueries: 0,
        onResult: async () => { throw new Error('persistence failed'); }
    }), /persistence failed/);
});

test('a pre-request budget refusal prevents provider transport and propagates', async () => {
    let calls = 0;
    await assert.rejects(runCascade(platform, feature, {
        clients: [{ name: 'provider-a', displayName: 'provider-a', verify: async () => { calls++; return response(noChange); } }],
        delayBetweenQueries: 0,
        beforeProviderRequest: async () => { throw new Error('spend ceiling exhausted'); }
    }), /spend ceiling exhausted/);
    assert.equal(calls, 0);
});

test('a checkpoint callback failure stops before another provider and records once', async () => {
    let firstCalls = 0; let secondCalls = 0; let receipts = 0;
    await assert.rejects(runCascade(platform, feature, { clients: [
        { name: 'provider-a', displayName: 'provider-a', verify: async () => { firstCalls++; return response(noChange); } },
        { name: 'provider-b', displayName: 'provider-b', verify: async () => { secondCalls++; return response(noChange); } }
    ], delayBetweenQueries: 0, afterProviderRequest: async () => { receipts++; throw new Error('checkpoint failed'); } }), /checkpoint failed/);
    assert.equal(firstCalls, 1); assert.equal(secondCalls, 0); assert.equal(receipts, 1);
});

test('a later spend refusal leaves the earlier provider response available to the runtime sink', async () => {
    let reservations = 0; const runtime = [];
    await assert.rejects(runCascade(platform, feature, { clients: [
        client('provider-a', response(noChange, { raw: { id: 'raw-1' }, usageReceipt: { id: 'usage-1' } })),
        client('provider-b', response(noChange))
    ], delayBetweenQueries: 0,
    beforeProviderRequest: async () => { if (reservations++) throw new Error('spend ceiling exhausted'); },
    afterProviderRequest: async event => runtime.push(event) }), /spend ceiling exhausted/);
    assert.equal(runtime.length, 1);
    assert.equal(runtime[0].response.raw.id, 'raw-1');
    assert.equal(runtime[0].response.usageReceipt.id, 'usage-1');
});

test('summary uses contract field names and ignores malformed outcomes', () => {
    const summary = summarizeResults([
        { platform: 'Example', outcome: CascadeOutcome.NO_CHANGE },
        { platform: 'Example', outcome: 'unexpected' },
        null
    ]);
    assert.equal(summary.total, 3);
    assert.equal(summary.noChange, 1);
    assert.equal(summary.byPlatform.Example.total, 1);
    assert.equal(summary.byPlatform.Example.noChange, 1);
    assert.equal(summary.byPlatform.Example.no_change, undefined);
    assert.equal(Object.getPrototypeOf(summary.byPlatform), null);
});
